from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, get_current_user
)
from app.models.user import User
from jose import JWTError, jwt
from app.core.config import settings

router = APIRouter()


class RegisterRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    preferred_lang: str = "en"
    district_id: Optional[int] = None


class LoginRequest(BaseModel):
    identifier: str   # phone or email
    password: str


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "phone": user.phone,
        "email": user.email,
        "preferred_lang": user.preferred_lang,
        "district_id": user.district_id,
    }


@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if not body.phone and not body.email:
        raise HTTPException(400, "Phone or email is required")

    # Check uniqueness
    filters = []
    if body.phone:
        filters.append(User.phone == body.phone)
    if body.email:
        filters.append(User.email == body.email)

    existing = await db.execute(select(User).where(or_(*filters)))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "An account with this phone/email already exists")

    user = User(
        full_name=body.full_name,
        phone=body.phone,
        email=body.email,
        password_hash=hash_password(body.password),
        preferred_lang=body.preferred_lang,
        district_id=body.district_id,
    )
    db.add(user)
    await db.flush()  # get user.id
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "user": user_to_dict(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find user by phone or email
    result = await db.execute(
        select(User).where(
            or_(User.phone == body.identifier, User.email == body.identifier)
        )
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    if not user.is_active:
        raise HTTPException(403, "Account is disabled")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "user": user_to_dict(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str = Query(...), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user_id = int(payload["sub"])
    except (JWTError, KeyError):
        raise HTTPException(401, "Invalid or expired refresh token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(401, "User not found")

    new_access = create_access_token({"sub": str(user.id)})
    return {"access_token": new_access, "token_type": "bearer"}


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return user_to_dict(user)
