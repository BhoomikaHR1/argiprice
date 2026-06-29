import uuid

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
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

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name      = Column(String(120), nullable=False)
    phone          = Column(String(15), unique=True, nullable=True, index=True)
    email          = Column(String(200), unique=True, nullable=True, index=True)
    password_hash  = Column(String(255), nullable=False)
    preferred_lang = Column(String(5), default="en")
    district_id    = Column(Integer, ForeignKey("districts.id"), nullable=True)
    taluk_id       = Column(Integer, nullable=True)
    is_active      = Column(Boolean, default=True)
    is_verified    = Column(Boolean, default=False)
    role           = Column(String(20), default="farmer")
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    district      = relationship("District", back_populates="users")
    saved_crops   = relationship("UserSavedCrop", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("UserNotification", back_populates="user", cascade="all, delete-orphan")
    joint_community_entries = relationship("JointCommunityEntry", back_populates="user", cascade="all, delete-orphan")


class UserSavedCrop(Base):
    __tablename__ = "user_saved_crops"

    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True, nullable=False)
    crop_id    = Column(Integer, ForeignKey("crops.id"), nullable=False)
    added_at   = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="saved_crops")


class UserNotification(Base):
    __tablename__ = "user_notifications"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title_en   = Column(String(300))
    title_kn   = Column(String(300))
    body_en    = Column(String)
    body_kn    = Column(String)
    type       = Column(String(30))
    is_read    = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class JointCommunityEntry(Base):
    __tablename__ = "joint_community_entries"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    crop_id       = Column(Integer, ForeignKey("crops.id"), nullable=False, index=True)
    quantity      = Column(Float, nullable=False)
    unit          = Column(String(20), nullable=False)
    quantity_kg   = Column(Integer, nullable=False)
    village_name  = Column(String(255), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="joint_community_entries")
