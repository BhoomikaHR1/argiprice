from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
import math

from app.core.database import get_db

router = APIRouter()


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("")
async def list_markets(
    district_id: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    q = """
        SELECT am.*, d.name_en AS district_name
        FROM apmc_markets am
        LEFT JOIN districts d ON am.district_id = d.id
        WHERE 1=1
    """
    params: dict = {"limit": limit}
    if district_id:
        q += " AND am.district_id = :district_id"
        params["district_id"] = district_id
    if search:
        q += " AND am.name_en ILIKE :s"
        params["s"] = f"%{search}%"
    q += " ORDER BY am.name_en LIMIT :limit"

    result = await db.execute(text(q), params)
    return [dict(r) for r in result.mappings().all()]


@router.get("/nearest")
async def nearest_markets(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    limit: int = Query(5, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Return markets sorted by distance from user's GPS location."""
    result = await db.execute(text("""
        SELECT am.*, d.name_en AS district_name
        FROM apmc_markets am
        LEFT JOIN districts d ON am.district_id = d.id
        WHERE am.latitude IS NOT NULL AND am.longitude IS NOT NULL
    """))
    markets = [dict(r) for r in result.mappings().all()]

    for m in markets:
        m["distance_km"] = round(haversine_km(lat, lng, float(m["latitude"]), float(m["longitude"])), 1)

    markets.sort(key=lambda m: m["distance_km"])
    return markets[:limit]


@router.get("/{market_id}")
async def get_market(market_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT am.*, d.name_en AS district_name
        FROM apmc_markets am
        LEFT JOIN districts d ON am.district_id = d.id
        WHERE am.id = :id
    """), {"id": market_id})
    row = result.mappings().one_or_none()
    if not row:
        raise HTTPException(404, "Market not found")

    # Also return today's top prices for this market
    prices_result = await db.execute(text("""
        SELECT c.name_en, c.category, pr.modal_price, pr.arrivals_tonnes
        FROM price_records pr
        JOIN crops c ON pr.crop_id = c.id
        WHERE pr.apmc_id = :mid
          AND pr.trade_date >= CURRENT_DATE - INTERVAL '3 days'
        ORDER BY pr.trade_date DESC, pr.modal_price DESC
        LIMIT 10
    """), {"mid": market_id})

    return {
        **dict(row),
        "today_prices": [dict(r) for r in prices_result.mappings().all()]
    }
