from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional

from app.core.database import get_db

router = APIRouter()


@router.get("")
async def list_schemes(
    scheme_type: Optional[str] = None,
    level: Optional[str] = None,  # Central | State
    db: AsyncSession = Depends(get_db),
):
    q = "SELECT * FROM government_schemes WHERE 1=1"
    params: dict = {}
    if scheme_type:
        q += " AND type = :type"
        params["type"] = scheme_type
    if level:
        q += " AND level = :level"
        params["level"] = level
    q += " ORDER BY name"

    result = await db.execute(text(q), params)
    return [dict(r) for r in result.mappings().all()]


@router.get("/msp")
async def get_msp_prices(
    season: str = Query("2024-25"),
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Return MSP prices for current season."""
    q = """
        SELECT c.id, c.name_en, c.name_kn, c.category,
               c.msp_price, c.msp_price_prev, c.has_msp
        FROM crops c
        WHERE c.has_msp = true
    """
    params: dict = {}
    if category:
        q += " AND c.category = :cat"
        params["cat"] = category
    q += " ORDER BY c.category, c.name_en"

    result = await db.execute(text(q), params)
    rows = result.mappings().all()
    return {
        "season": season,
        "announced_by": "CCEA (Cabinet Committee on Economic Affairs)",
        "crops": [dict(r) for r in rows],
    }


@router.get("/crop/{crop_id}")
async def schemes_for_crop(crop_id: int, db: AsyncSession = Depends(get_db)):
    """Return government schemes relevant to a specific crop."""
    result = await db.execute(text("""
        SELECT gs.*
        FROM government_schemes gs
        JOIN scheme_crops sc ON gs.id = sc.scheme_id
        WHERE sc.crop_id = :cid
        ORDER BY gs.level DESC, gs.name
    """), {"cid": crop_id})
    return [dict(r) for r in result.mappings().all()]
