from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Optional

from app.core.database import get_db

router = APIRouter()


@router.get("")
async def list_crops(
    category: Optional[str] = None,
    has_msp: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(100, le=200),
    db: AsyncSession = Depends(get_db),
):
    q = "SELECT * FROM crops WHERE 1=1"
    params: dict = {}
    if category:
        q += " AND category = :category"
        params["category"] = category
    if has_msp is not None:
        q += " AND has_msp = :has_msp"
        params["has_msp"] = has_msp
    if search:
        q += " AND (name_en ILIKE :s OR name_kn ILIKE :s)"
        params["s"] = f"%{search}%"
    q += " ORDER BY name_en LIMIT :limit"
    params["limit"] = limit

    result = await db.execute(text(q), params)
    rows = result.mappings().all()
    return [dict(r) for r in rows]


@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT DISTINCT category, COUNT(*) as count FROM crops GROUP BY category ORDER BY category")
    )
    return [dict(r) for r in result.mappings().all()]


@router.get("/{crop_id}")
async def get_crop(crop_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM crops WHERE id = :id"), {"id": crop_id}
    )
    row = result.mappings().one_or_none()
    if not row:
        raise HTTPException(404, "Crop not found")
    return dict(row)


@router.get("/{crop_id}/prices")
async def get_crop_prices(
    crop_id: int,
    days: int = Query(30, le=365),
    apmc_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get historical price records for a specific crop."""
    q = """
        SELECT pr.*, am.name_en as market_name, am.district_id
        FROM price_records pr
        JOIN apmc_markets am ON pr.apmc_id = am.id
        WHERE pr.crop_id = :crop_id
          AND pr.trade_date >= CURRENT_DATE - INTERVAL ':days days'
    """
    params = {"crop_id": crop_id, "days": days}
    if apmc_id:
        q += " AND pr.apmc_id = :apmc_id"
        params["apmc_id"] = apmc_id
    q += " ORDER BY pr.trade_date DESC, am.name_en LIMIT 500"

    result = await db.execute(text(q), params)
    return [dict(r) for r in result.mappings().all()]
