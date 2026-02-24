from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from database import engine, get_db
import models
import schemas

# ─────────────────────────────────────────────
# App Initialization
# ─────────────────────────────────────────────
app = FastAPI(title="Event Booking API")

# Create tables on startup (VERY IMPORTANT for Neon)
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# ENV VARIABLES
# ─────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# ─────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ─────────────────────────────────────────────
# Seed Initial Events
# ─────────────────────────────────────────────
def seed_events(db: Session):
    count = db.query(models.Event).count()
    if count > 0:
        return

    events = [
        # ── Music ──────────────────────────────
        models.Event(
            title="Coldplay India Tour 2025",
            description="Experience the magic of Coldplay live in Mumbai! A night filled with dazzling lights, confetti, and timeless hits from one of the world's biggest bands.",
            location="DY Patil Stadium, Mumbai",
            date=datetime(2025, 1, 19, 19, 0),
            price=4999,
            category="Music",
            available_seats=50000,
            is_active=True,
        ),
        models.Event(
            title="Arijit Singh Live Concert",
            description="The soulful voice of Bollywood, Arijit Singh, performs his greatest hits live in Delhi. An unforgettable evening of emotion and music.",
            location="Jawaharlal Nehru Stadium, Delhi",
            date=datetime(2025, 3, 15, 18, 30),
            price=2499,
            category="Music",
            available_seats=35000,
            is_active=True,
        ),
        models.Event(
            title="Sunburn Festival 2025",
            description="Asia's biggest electronic music festival returns to Goa! Featuring world-class DJs, stunning visuals, and three days of non-stop music.",
            location="Vagator Beach, Goa",
            date=datetime(2025, 4, 27, 16, 0),
            price=3999,
            category="Music",
            available_seats=20000,
            is_active=True,
        ),
        models.Event(
            title="AR Rahman Symphony Night",
            description="An orchestral celebration of AR Rahman's legendary compositions. Experience Oscar-winning music performed live with a 100-piece orchestra.",
            location="Nehru Indoor Stadium, Chennai",
            date=datetime(2025, 5, 10, 19, 0),
            price=1999,
            category="Music",
            available_seats=8000,
            is_active=True,
        ),

        # ── Tech ───────────────────────────────
        models.Event(
            title="TechSpark India 2025",
            description="India's premier tech conference featuring keynotes from global tech leaders, hands-on AI/ML workshops, and a massive startup expo.",
            location="Bangalore International Exhibition Centre, Bengaluru",
            date=datetime(2025, 2, 20, 9, 0),
            price=1499,
            category="Tech",
            available_seats=5000,
            is_active=True,
        ),
        models.Event(
            title="AI & Machine Learning Summit",
            description="Deep dive into the future of AI with industry experts. Covers generative AI, LLMs, computer vision, and real-world deployment strategies.",
            location="Hyderabad International Convention Centre, Hyderabad",
            date=datetime(2025, 3, 8, 9, 30),
            price=2999,
            category="Tech",
            available_seats=2000,
            is_active=True,
        ),
        models.Event(
            title="Startup Pitch Night Bengaluru",
            description="Watch 20 promising startups pitch to top VCs and angel investors. Network with founders, mentors, and the broader startup ecosystem.",
            location="91springboard, Bengaluru",
            date=datetime(2025, 2, 28, 18, 0),
            price=0,
            category="Tech",
            available_seats=300,
            is_active=True,
        ),
        models.Event(
            title="DevFest Mumbai 2025",
            description="Google Developer Groups presents DevFest Mumbai — a full day of talks on Flutter, Firebase, Cloud, and Android by Google Developer Experts.",
            location="NSCI Dome, Mumbai",
            date=datetime(2025, 4, 5, 10, 0),
            price=499,
            category="Tech",
            available_seats=1500,
            is_active=True,
        ),

        # ── Sports ─────────────────────────────
        models.Event(
            title="IPL 2025: MI vs CSK",
            description="The most anticipated rivalry in cricket returns! Mumbai Indians take on Chennai Super Kings in a blockbuster IPL clash.",
            location="Wankhede Stadium, Mumbai",
            date=datetime(2025, 4, 12, 19, 30),
            price=1200,
            category="Sports",
            available_seats=33000,
            is_active=True,
        ),
        models.Event(
            title="Pro Kabaddi League Finals",
            description="The grand finale of Pro Kabaddi League Season 11. Two titans of Kabaddi battle it out for the ultimate glory.",
            location="EKA Arena, Ahmedabad",
            date=datetime(2025, 3, 22, 20, 0),
            price=799,
            category="Sports",
            available_seats=10000,
            is_active=True,
        ),
        models.Event(
            title="Bengaluru FC vs Mumbai City FC",
            description="ISL Super Derby! Bengaluru FC hosts Mumbai City FC in a high-octane clash that promises edge-of-the-seat football action.",
            location="Sree Kanteerava Stadium, Bengaluru",
            date=datetime(2025, 2, 16, 19, 0),
            price=399,
            category="Sports",
            available_seats=22000,
            is_active=True,
        ),

        # ── Food ───────────────────────────────
        models.Event(
            title="India Food & Wine Festival",
            description="Celebrate the finest flavours of India and the world. 100+ food stalls, master chef demos, wine tastings, and culinary workshops.",
            location="MMRDA Grounds, Bandra Kurla Complex, Mumbai",
            date=datetime(2025, 3, 1, 11, 0),
            price=599,
            category="Food",
            available_seats=15000,
            is_active=True,
        ),
        models.Event(
            title="Street Food Festival Bengaluru",
            description="A three-day celebration of India's iconic street food! Over 50 vendors from across the country — chaat, dosas, rolls, desserts, and more.",
            location="Palace Grounds, Bengaluru",
            date=datetime(2025, 4, 18, 12, 0),
            price=0,
            category="Food",
            available_seats=25000,
            is_active=True,
        ),
        models.Event(
            title="Masterclass: The Art of Biryani",
            description="Learn the secrets of authentic Hyderabadi Dum Biryani from award-winning chef Imtiaz Qureshi. Includes a hands-on cooking session and full meal.",
            location="ITC Kohenur, Hyderabad",
            date=datetime(2025, 3, 30, 14, 0),
            price=3499,
            category="Food",
            available_seats=50,
            is_active=True,
        ),

        # ── Art ────────────────────────────────
        models.Event(
            title="Kochi-Muziris Biennale 2025",
            description="South Asia's largest contemporary art exhibition returns to the historic shores of Kochi, featuring 100+ artists from 30 countries.",
            location="Aspinwall House, Kochi",
            date=datetime(2025, 2, 12, 10, 0),
            price=100,
            category="Art",
            available_seats=5000,
            is_active=True,
        ),
        models.Event(
            title="Delhi Art Week",
            description="A curated week of gallery openings, artist talks, live installations, and workshops celebrating contemporary Indian and global art.",
            location="Lodhi Art District, New Delhi",
            date=datetime(2025, 3, 17, 10, 0),
            price=0,
            category="Art",
            available_seats=3000,
            is_active=True,
        ),

        # ── Comedy ─────────────────────────────
        models.Event(
            title="Zakir Khan Live: Sakht Launda Tour",
            description="India's most beloved stand-up comedian Zakir Khan is back with a brand new hour of honest, heartwarming, and hilarious storytelling.",
            location="Siri Fort Auditorium, New Delhi",
            date=datetime(2025, 3, 5, 19, 30),
            price=999,
            category="Comedy",
            available_seats=1800,
            is_active=True,
        ),
        models.Event(
            title="The Comedy Store Mumbai: Open Mic Night",
            description="Catch the next big voices in Indian comedy! 12 fresh comedians take the stage for a wild night of laughs at Mumbai's iconic comedy club.",
            location="The Comedy Store, Lower Parel, Mumbai",
            date=datetime(2025, 2, 22, 20, 0),
            price=299,
            category="Comedy",
            available_seats=200,
            is_active=True,
        ),
        models.Event(
            title="Kenny Sebastian: New Special Live",
            description="Kenny Sebastian brings his new stand-up special to Bengaluru before it drops online. Expect relatable stories, live music, and non-stop laughs.",
            location="Chowdaiah Memorial Hall, Bengaluru",
            date=datetime(2025, 4, 20, 19, 0),
            price=799,
            category="Comedy",
            available_seats=1200,
            is_active=True,
        ),

        # ── Business ───────────────────────────
        models.Event(
            title="TiE Global Summit 2025",
            description="The world's largest entrepreneurship conference comes to India. Featuring 200+ speakers, 3000+ attendees, and unparalleled networking opportunities.",
            location="Sheraton Grand, Bengaluru",
            date=datetime(2025, 5, 22, 9, 0),
            price=9999,
            category="Business",
            available_seats=3000,
            is_active=True,
        ),
        models.Event(
            title="Women in Leadership Summit",
            description="An inspiring full-day summit celebrating and empowering women leaders across industries with keynotes, panel discussions, and mentoring circles.",
            location="Taj Lands End, Mumbai",
            date=datetime(2025, 3, 8, 9, 0),
            price=1999,
            category="Business",
            available_seats=800,
            is_active=True,
        ),
        models.Event(
            title="Digital Marketing Masterclass",
            description="A hands-on full-day workshop covering SEO, performance marketing, social media strategy, and growth hacking for startups and SMEs.",
            location="91springboard, Koramangala, Bengaluru",
            date=datetime(2025, 3, 25, 10, 0),
            price=2499,
            category="Business",
            available_seats=150,
            is_active=True,
        ),
    ]

    for event in events:
        db.add(event)
    db.commit()
    print(f"✅ Seeded {len(events)} events successfully.")


@app.on_event("startup")
def startup_event():
    try:
        db = next(get_db())
        seed_events(db)
        db.close()
    except Exception as e:
        print("Startup Error:", e)

# ─────────────────────────────────────────────
# Auth Routes
# ─────────────────────────────────────────────
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

# ─────────────────────────────────────────────
# Events Routes
# ─────────────────────────────────────────────
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

# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "Event Booking API running"}