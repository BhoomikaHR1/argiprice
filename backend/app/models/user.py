from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


# ── FIX: District must be a SQLAlchemy model so create_all creates the table
#         before users table tries to reference it via FK
class District(Base):
    __tablename__ = "districts"

    id        = Column(Integer, primary_key=True, index=True)
    name_en   = Column(String(100), nullable=False)
    name_kn   = Column(String(100))
    code      = Column(String(10), unique=True, nullable=False)
    latitude  = Column(String(20))
    longitude = Column(String(20))

    users = relationship("User", back_populates="district")


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    full_name      = Column(String(120), nullable=False)
    phone          = Column(String(15), unique=True, nullable=True, index=True)
    email          = Column(String(200), unique=True, nullable=True, index=True)
    password_hash  = Column(String(255), nullable=False)
    preferred_lang = Column(String(5), default="en")
    district_id    = Column(Integer, ForeignKey("districts.id"), nullable=True)
    is_active      = Column(Boolean, default=True)
    is_admin       = Column(Boolean, default=False)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())

    district      = relationship("District", back_populates="users")
    saved_crops   = relationship("UserSavedCrop", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("UserNotification", back_populates="user", cascade="all, delete-orphan")


class UserSavedCrop(Base):
    __tablename__ = "user_saved_crops"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id    = Column(Integer, ForeignKey("crops.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_crops")


class UserNotification(Base):
    __tablename__ = "user_notifications"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    type       = Column(String(30))
    message    = Column(String(500))
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")
