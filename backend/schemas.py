from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str


# ─── Events ──────────────────────────────────────────────────────────────────

class EventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    location: str
    date: datetime
    price: float
    category: str
    image_url: Optional[str]
    available_seats: int

    class Config:
        from_attributes = True


# ─── Bookings ────────────────────────────────────────────────────────────────

class BookingResponse(BaseModel):
    id: int
    event_id: int
    amount: float
    status: str
    booked_at: datetime
    event: EventResponse

    class Config:
        from_attributes = True


# ─── Payment ─────────────────────────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    event_id: int

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    event_id: int


# ─── User Profile ─────────────────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True