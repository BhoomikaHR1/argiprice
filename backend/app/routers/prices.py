from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional

from app.core.database import get_db

router = APIRouter()


@router.get("/latest")
async def latest_prices(
    district_id: Optional[int] = None,
    category: Optional[str] = None,
    crop_id: Optional[int] = None,
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Latest modal prices for all crops — the Live Prices page datasource."""
    q = """
        SELECT DISTINCT ON (pr.crop_id, pr.apmc_id)
            pr.crop_id,
            pr.apmc_id,
            pr.modal_price,
            pr.min_price,
            pr.max_price,
            pr.arrivals_tonnes,
            pr.trade_date,
            pr.variety,
            c.name_en   AS crop_name,
            c.name_kn   AS crop_name_kn,
            c.category,
            c.has_msp,
            c.msp_price,
            am.name_en  AS market_name,
            d.name      AS district_name
        FROM price_records pr
        JOIN crops c ON pr.crop_id = c.id
        JOIN apmc_markets am ON pr.apmc_id = am.id
        LEFT JOIN districts d ON am.district_id = d.id
        WHERE pr.trade_date >= CURRENT_DATE - INTERVAL '3 days'
    """
    params: dict = {"limit": limit}

    if district_id:
        q += " AND am.district_id = :district_id"
        params["district_id"] = district_id
    if category:
        q += " AND c.category = :category"
        params["category"] = category
    if crop_id:
        q += " AND pr.crop_id = :crop_id"
        params["crop_id"] = crop_id

    q += """
        ORDER BY pr.crop_id, pr.apmc_id, pr.trade_date DESC
        LIMIT :limit
    """

    result = await db.execute(text(q), params)
    rows = result.mappings().all()

    # Attach previous-day price for % change calculation
    prices = [dict(r) for r in rows]
    return prices


@router.get("/ticker")
async def price_ticker(db: AsyncSession = Depends(get_db)):
    """Top 20 prices for the scrolling ticker on the landing/dashboard page."""
    result = await db.execute(text("""
        SELECT DISTINCT ON (pr.crop_id)
            c.name_en, c.name_kn, c.category,
            pr.modal_price, pr.trade_date,
            am.name_en AS market_name
        FROM price_records pr
        JOIN crops c ON pr.crop_id = c.id
        JOIN apmc_markets am ON pr.apmc_id = am.id
        WHERE pr.trade_date >= CURRENT_DATE - INTERVAL '3 days'
        ORDER BY pr.crop_id, pr.trade_date DESC
        LIMIT 20
    """))
    return [dict(r) for r in result.mappings().all()]


@router.get("/history/{crop_id}")
async def price_history(
    crop_id: int,
    apmc_id: Optional[int] = None,
    days: int = Query(30, le=365),
    db: AsyncSession = Depends(get_db),
):
    """Price trend over time — for charts."""
    q = """
        SELECT trade_date, modal_price, min_price, max_price, arrivals_tonnes,
               am.name_en AS market_name
        FROM price_records pr
        JOIN apmc_markets am ON pr.apmc_id = am.id
        WHERE pr.crop_id = :crop_id
          AND pr.trade_date >= CURRENT_DATE - INTERVAL ':days days'
    """
    params = {"crop_id": crop_id, "days": days}
    if apmc_id:
        q += " AND pr.apmc_id = :apmc_id"
        params["apmc_id"] = apmc_id
    q += " ORDER BY trade_date ASC LIMIT 500"

    result = await db.execute(text(q), params)
    return [dict(r) for r in result.mappings().all()]
