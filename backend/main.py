from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import razorpay
import hmac
import hashlib
import os

from database import engine, get_db, Base
import models
import schemas

load_dotenv()

#Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Booking API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
security = HTTPBearer()


# ─── Helpers ─────────────────────────────────────────────────────────────────

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


# ─── Seed Events ─────────────────────────────────────────────────────────────

def seed_events(db: Session):
    count = db.query(models.Event).count()
    if count > 0:
        return
    events = [
        models.Event(
            title="Coldplay India Tour 2025",
            description="Experience the magic of Coldplay live in Mumbai! One of the world's biggest bands brings their Music of the Spheres World Tour to India. Expect a spectacular light show, confetti cannons, and chart-topping hits spanning their entire career.",
            location="DY Patil Stadium, Mumbai",
            date=datetime(2025, 1, 19, 19, 0),
            price=4999,
            category="Music",
            image_url=None,
            available_seats=50000,
        ),
        models.Event(
            title="Google I/O Extended Bengaluru",
            description="Join thousands of developers for a full day of tech talks, workshops, and networking. Get hands-on with the latest in AI, Android, Flutter, Firebase and more. Keynote sessions streamed live from Google HQ.",
            location="KTPO Convention Centre, Bengaluru",
            date=datetime(2025, 3, 15, 9, 0),
            price=499,
            category="Tech",
            image_url=None,
            available_seats=2000,
        ),
        models.Event(
            title="IPL 2025 — RCB vs MI",
            description="The biggest rivalry in Indian cricket! Royal Challengers Bengaluru take on Mumbai Indians in what promises to be a blockbuster clash. Book your seats now before they sell out!",
            location="M. Chinnaswamy Stadium, Bengaluru",
            date=datetime(2025, 4, 10, 19, 30),
            price=1500,
            category="Sports",
            image_url=None,
            available_seats=35000,
        ),
        models.Event(
            title="Lollapalooza India 2025",
            description="India's premier music festival returns! Three days of non-stop music across 4 stages featuring international and homegrown artists. Food, art installations, and an unforgettable atmosphere await.",
            location="Mahalaxmi Race Course, Mumbai",
            date=datetime(2025, 2, 8, 12, 0),
            price=3500,
            category="Music",
            image_url=None,
            available_seats=40000,
        ),
        models.Event(
            title="Comic Con India — Delhi Edition",
            description="India's biggest pop culture celebration! Meet your favourite creators, cosplay competitions, gaming zones, exclusive merchandise, and celebrity guests. A paradise for fans of comics, anime, gaming and sci-fi.",
            location="Pragati Maidan, New Delhi",
            date=datetime(2025, 5, 24, 10, 0),
            price=799,
            category="Art",
            image_url=None,
            available_seats=15000,
        ),
        models.Event(
            title="Zomato Feeding India Food Fest",
            description="A celebration of India's diverse culinary heritage! Over 200 food stalls, live cooking demonstrations by celebrity chefs, street food competitions, and fusion cuisine you have never tasted before.",
            location="Jawaharlal Nehru Stadium, Delhi",
            date=datetime(2025, 3, 29, 11, 0),
            price=299,
            category="Food",
            image_url=None,
            available_seats=10000,
        ),
        models.Event(
            title="Zakir Khan — Suniye Toh Sahi",
            description="India's favourite storyteller is back with a brand new stand-up special. Zakir Khan brings his signature desi humour and relatable life stories to Chennai. An evening of non-stop laughter guaranteed!",
            location="Music Academy, Chennai",
            date=datetime(2025, 6, 14, 20, 0),
            price=899,
            category="Comedy",
            image_url=None,
            available_seats=1500,
        ),
        models.Event(
            title="Startup Summit Hyderabad 2025",
            description="Connect with 500+ founders, investors, and industry leaders. Pitch competitions with ₹50L prize pool, panel discussions on AI & DeepTech, and exclusive networking sessions. India's fastest growing startup conclave.",
            location="HICC, Hyderabad",
            date=datetime(2025, 7, 5, 9, 0),
            price=1999,
            category="Business",
            image_url=None,
            available_seats=3000,
        ),
        models.Event(
            title="Sunburn Festival Goa 2025",
            description="Asia's biggest electronic dance music festival! World-class DJs, stunning beach backdrop, and 72 hours of non-stop music. Sunburn Goa is the ultimate year-end celebration you cannot miss.",
            location="Vagator Beach, Goa",
            date=datetime(2025, 12, 27, 16, 0),
            price=5999,
            category="Music",
            image_url=None,
            available_seats=60000,
        ),
        models.Event(
            title="PyConf India 2025",
            description="The largest Python conference in India! Three days of talks, tutorials, and sprints covering machine learning, web development, data science, and open source. All skill levels welcome.",
            location="IIT Madras Research Park, Chennai",
            date=datetime(2025, 9, 20, 9, 0),
            price=0,
            category="Tech",
            image_url=None,
            available_seats=5000,
        ),
    ]
    db.add_all(events)
    db.commit()


@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        seed_events(db)
    finally:
        db.close()


# ─── Auth Routes ─────────────────────────────────────────────────────────────

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
    return schemas.TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email)


@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return schemas.TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email)


# ─── Events Routes ───────────────────────────────────────────────────────────

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


@app.get("/events/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


# ─── Payment Routes ──────────────────────────────────────────────────────────

@app.post("/payment/create-order")
def create_order(
    data: schemas.CreateOrderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user = get_current_user(credentials.credentials, db)
    event = db.query(models.Event).filter(models.Event.id == data.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.available_seats <= 0:
        raise HTTPException(status_code=400, detail="No seats available")

    amount_paise = int(event.price * 100)
    order = razorpay_client.order.create({"amount": amount_paise, "currency": "INR", "payment_capture": 1})

    booking = models.Booking(
        user_id=user.id, event_id=event.id,
        razorpay_order_id=order["id"], amount=event.price, status="pending",
    )
    db.add(booking)
    db.commit()
    return {"order_id": order["id"], "amount": amount_paise, "currency": "INR", "key": RAZORPAY_KEY_ID, "event_title": event.title}


@app.post("/payment/verify")
def verify_payment(
    data: schemas.VerifyPaymentRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user = get_current_user(credentials.credentials, db)

    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected_signature = hmac.new(
        bytes(RAZORPAY_KEY_SECRET, 'utf-8'),
        bytes(body, 'utf-8'),
        hashlib.sha256,
    ).hexdigest()
    if expected_signature != data.razorpay_signature:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    booking = db.query(models.Booking).filter(
        models.Booking.razorpay_order_id == data.razorpay_order_id,
        models.Booking.user_id == user.id,
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.razorpay_payment_id = data.razorpay_payment_id
    booking.status = "confirmed"

    event = db.query(models.Event).filter(models.Event.id == booking.event_id).first()
    if event:
        event.available_seats -= 1

    db.commit()
    db.refresh(booking)
    return {"message": "Payment verified", "booking_id": booking.id}


@app.post("/payment/confirm-test")
def confirm_test_payment(
    data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """Test mode only — confirms booking without signature verification."""
    user = get_current_user(credentials.credentials, db)

    booking = db.query(models.Booking).filter(
        models.Booking.razorpay_order_id == data.get("razorpay_order_id"),
        models.Booking.user_id == user.id,
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.razorpay_payment_id = data.get("razorpay_payment_id")
    booking.status = "confirmed"

    event = db.query(models.Event).filter(models.Event.id == booking.event_id).first()
    if event and event.available_seats > 0:
        event.available_seats -= 1

    db.commit()
    return {"message": "Booking confirmed", "booking_id": booking.id}


# ─── Profile Routes ───────────────────────────────────────────────────────────

@app.get("/profile", response_model=schemas.UserProfileResponse)
def get_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    return get_current_user(credentials.credentials, db)


@app.get("/profile/bookings", response_model=list[schemas.BookingResponse])
def get_my_bookings(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    user = get_current_user(credentials.credentials, db)
    return (
        db.query(models.Booking)
        .options(joinedload(models.Booking.event))
        .filter(models.Booking.user_id == user.id)
        .order_by(models.Booking.booked_at.desc())
        .all()
    )


@app.get("/")
def root():
    return {"status": "Event Booking API running"}