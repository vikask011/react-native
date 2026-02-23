from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import razorpay
import hmac
import hashlib
import os

from database import engine, get_db, Base
import models
import schemas


app = FastAPI(title="Event Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ENV VARIABLES
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


# ─── Helpers ─────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str, db: Session) -> models.User:
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except (JWTError, ValueError):
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


# ─── Seed Events ─────────────────────────────────────────────

def seed_events(db: Session):
    count = db.query(models.Event).count()
    if count > 0:
        return

    events = [
        models.Event(
            title="Coldplay India Tour 2025",
            description="Experience the magic of Coldplay live in Mumbai!",
            location="DY Patil Stadium, Mumbai",
            date=datetime(2025, 1, 19, 19, 0),
            price=4999,
            category="Music",
            available_seats=50000,
        ),
    ]

    db.add_all(events)
    db.commit()


@app.on_event("startup")
def startup_event():
    try:
        db = next(get_db())
        seed_events(db)
        db.close()
    except Exception:
        pass  # Prevent serverless crash


# ─── Auth Routes ─────────────────────────────────────────────

@app.post("/auth/register", response_model=schemas.TokenResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        phone=data.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        email=user.email
    )


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        email=user.email
    )


# ─── Events Routes ───────────────────────────────────────────

@app.get("/events", response_model=list[schemas.EventResponse])
def get_events(search: str = None, category: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Event).filter(models.Event.is_active == True)

    if search:
        query = query.filter(or_(
            models.Event.title.ilike(f"%{search}%"),
            models.Event.location.ilike(f"%{search}%"),
            models.Event.description.ilike(f"%{search}%"),
        ))

    if category and category.lower() != "all":
        query = query.filter(models.Event.category.ilike(category))

    return query.order_by(models.Event.date.asc()).all()


@app.get("/")
def root():
    return {"status": "Event Booking API running"}