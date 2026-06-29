from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from pydantic import BaseModel, Field
from typing import Literal, Optional

from app.core.database import get_db
from app.core.security import get_current_user, hash_password
from app.models.user import User, UserSavedCrop, UserNotification, JointCommunityEntry

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    preferred_lang: Optional[str] = None
    district_id: Optional[int] = None
    password: Optional[str] = None


class JointCommunityCreateRequest(BaseModel):
    crop_id: int
    quantity: float = Field(..., gt=0)
    unit: Literal["kg", "quintal", "tonne"]
    village_name: str = Field(..., min_length=2, max_length=255)


UNIT_TO_KG = {
    "kg": 1,
    "quintal": 100,
    "tonne": 1000,
}


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


@router.get("/me/joint-community")
async def get_joint_community(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.execute(text("""
        SELECT
            jce.id,
            jce.user_id,
            jce.crop_id,
            jce.quantity,
            jce.unit,
            jce.quantity_kg,
            jce.village_name,
            jce.created_at,
            u.full_name AS farmer_name,
            c.name_en AS crop_name,
            c.name_kn AS crop_name_kn
        FROM joint_community_entries jce
        JOIN users u ON u.id = jce.user_id
        JOIN crops c ON c.id = jce.crop_id
        ORDER BY jce.created_at DESC
    """))
    entries = []
    for row in rows.mappings().all():
        entries.append({
            "id": row["id"],
            "user_id": str(row["user_id"]),
            "crop_id": row["crop_id"],
            "quantity": float(row["quantity"]),
            "unit": row["unit"],
            "quantity_kg": row["quantity_kg"],
            "village_name": row["village_name"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            "farmer_name": row["farmer_name"],
            "crop_name": row["crop_name"],
            "crop_name_kn": row["crop_name_kn"],
            "is_current_user": str(row["user_id"]) == str(user.id),
        })

    return {"entries": entries}


@router.post("/me/joint-community", status_code=201)
async def create_joint_community_entry(
    body: JointCommunityCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    crop = await db.execute(text("SELECT id FROM crops WHERE id = :id"), {"id": body.crop_id})
    if crop.scalar_one_or_none() is None:
        raise HTTPException(404, "Crop not found")

    entry = JointCommunityEntry(
        user_id=user.id,
        crop_id=body.crop_id,
        quantity=body.quantity,
        unit=body.unit,
        quantity_kg=int(round(body.quantity * UNIT_TO_KG[body.unit])),
        village_name=body.village_name.strip(),
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return {
        "message": "Joined crop community successfully",
        "entry": {
            "id": entry.id,
            "user_id": str(entry.user_id),
            "crop_id": entry.crop_id,
            "quantity": entry.quantity,
            "unit": entry.unit,
            "quantity_kg": entry.quantity_kg,
            "village_name": entry.village_name,
            "created_at": entry.created_at.isoformat() if entry.created_at else None,
            "farmer_name": user.full_name,
        },
    }


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
