from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.user import User, UserSavedCrop, UserNotification

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    preferred_lang: Optional[str] = None
    district_id: Optional[int] = None
    password: Optional[str] = None


@router.get("/me")
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "full_name": user.full_name,
        "phone": user.phone,
        "email": user.email,
        "preferred_lang": user.preferred_lang,
        "district_id": user.district_id,
        "created_at": user.created_at,
    }


@router.patch("/me")
async def update_profile(
    body: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.full_name:
        user.full_name = body.full_name
    if body.preferred_lang:
        user.preferred_lang = body.preferred_lang
    if body.district_id is not None:
        user.district_id = body.district_id
    if body.password:
        user.password_hash = hash_password(body.password)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"message": "Profile updated", "user": {"full_name": user.full_name, "preferred_lang": user.preferred_lang}}


@router.get("/me/saved-crops")
async def get_saved_crops(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(text("""
        SELECT usc.id, usc.created_at, usc.crop_id,
               c.name_en, c.name_kn, c.category, c.has_msp, c.msp_price
        FROM user_saved_crops usc
        JOIN crops c ON usc.crop_id = c.id
        WHERE usc.user_id = :uid
        ORDER BY usc.created_at DESC
    """), {"uid": user.id})
    return [dict(r) for r in result.mappings().all()]


@router.post("/me/saved-crops/{crop_id}", status_code=201)
async def save_crop(
    crop_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check not already saved
    existing = await db.execute(text(
        "SELECT id FROM user_saved_crops WHERE user_id = :uid AND crop_id = :cid"
    ), {"uid": user.id, "cid": crop_id})
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Crop already saved")

    await db.execute(text(
        "INSERT INTO user_saved_crops (user_id, crop_id) VALUES (:uid, :cid)"
    ), {"uid": user.id, "cid": crop_id})
    await db.commit()
    return {"message": "Crop saved"}


@router.delete("/me/saved-crops/{crop_id}")
async def unsave_crop(
    crop_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(text(
        "DELETE FROM user_saved_crops WHERE user_id = :uid AND crop_id = :cid"
    ), {"uid": user.id, "cid": crop_id})
    await db.commit()
    return {"message": "Crop removed from saved list"}


@router.get("/me/notifications")
async def get_notifications(
    unread_only: bool = False,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = "SELECT * FROM user_notifications WHERE user_id = :uid"
    if unread_only:
        q += " AND is_read = false"
    q += " ORDER BY created_at DESC LIMIT 50"

    result = await db.execute(text(q), {"uid": user.id})
    return [dict(r) for r in result.mappings().all()]


@router.patch("/me/notifications/{notif_id}/read")
async def mark_read(
    notif_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(text(
        "UPDATE user_notifications SET is_read = true WHERE id = :nid AND user_id = :uid"
    ), {"nid": notif_id, "uid": user.id})
    await db.commit()
    return {"message": "Marked as read"}
