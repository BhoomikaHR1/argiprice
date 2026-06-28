"""
AgriPrice — Agmarknet Data Fetcher
Fetches daily APMC mandi prices from Agmarknet API and stores in PostgreSQL.
Run via APScheduler or as a cron job.
"""
import asyncio
import httpx
import logging
from datetime import datetime, date, timedelta
from typing import Optional
from loguru import logger


# Agmarknet API endpoint (official govt data portal)
AGMARKNET_BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
ENАМ_BASE = "https://enam.gov.in/web/dashboard/trade-data"


# Karnataka APMC codes on Agmarknet (sample — full list in DB)
KARNATAKA_MARKET_CODES = {
    "Kolar":        "1213",
    "Hassan":       "1208",
    "Mandya":       "1220",
    "Mysuru":       "1221",
    "Hubballi":     "1209",
    "Belagavi":     "1203",
    "Raichur":      "1224",
    "Kalaburagi":   "1215",
    "Vijayapura":   "1231",
    "Ballari":      "1205",
    "Davanagere":   "1207",
    "Shivamogga":   "1226",
    "Tumakuru":     "1228",
    "Byadagi":      "1211",
    "Bengaluru":    "1206",
}

# Karnataka crop codes on Agmarknet
KARNATAKA_CROP_CODES = {
    "Tomato":       "78",
    "Onion":        "23",
    "Potato":       "24",
    "Rice":         "1",
    "Ragi":         "4",
    "Maize":        "5",
    "Jowar":        "3",
    "Tur":          "18",
    "Groundnut":    "12",
    "Cotton":       "30",
    "Soybean":      "28",
    "Sunflower":    "27",
}


async def fetch_agmarknet_prices(
    api_key: str,
    trade_date: Optional[date] = None,
    market_code: Optional[str] = None,
    crop_code: Optional[str] = None,
    limit: int = 500,
) -> list[dict]:
    """
    Fetch price data from Agmarknet API.

    API docs: https://data.gov.in/catalog/daily-market-prices-agricultural-commodities
    Requires free API key from data.gov.in
    """
    if not trade_date:
        trade_date = date.today()

    params = {
        "api-key":  api_key,
        "format":   "json",
        "limit":    limit,
        "filters[State]": "Karnataka",
    }
    if market_code:
        params["filters[APMC]"] = market_code
    if crop_code:
        params["filters[Commodity]"] = crop_code

    params["filters[Arrival_Date]"] = trade_date.strftime("%d/%m/%Y")

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(AGMARKNET_BASE, params=params)
        resp.raise_for_status()
        data = resp.json()

    records = []
    for r in data.get("records", []):
        try:
            records.append({
                "crop_name":        r.get("Commodity", ""),
                "market_name":      r.get("APMC", ""),
                "district":         r.get("District", ""),
                "variety":          r.get("Variety", "FAQ"),
                "grade":            r.get("Grade", "FAQ"),
                "min_price":        float(r.get("Min_x0020_Price", 0)),
                "max_price":        float(r.get("Max_x0020_Price", 0)),
                "modal_price":      float(r.get("Modal_x0020_Price", 0)),
                "trade_date":       trade_date.isoformat(),
                "arrivals_tonnes":  float(r.get("Arrivals_x0020__x0028_Tonnes_x0029_", 0)),
                "source":           "agmarknet",
            })
        except (ValueError, TypeError) as e:
            logger.warning(f"Skipping malformed record: {r} — {e}")

    logger.info(f"Fetched {len(records)} price records from Agmarknet for {trade_date}")
    return records


async def fetch_all_karnataka_prices(api_key: str, trade_date: Optional[date] = None) -> list[dict]:
    """Fetch prices for ALL Karnataka crops and markets in parallel."""
    if not trade_date:
        trade_date = date.today()

    tasks = []
    async with httpx.AsyncClient(timeout=30) as client:
        for market_name, market_code in KARNATAKA_MARKET_CODES.items():
            tasks.append(
                fetch_agmarknet_prices(api_key, trade_date, market_code=market_code)
            )

    results = await asyncio.gather(*tasks, return_exceptions=True)
    all_records = []
    for r in results:
        if isinstance(r, list):
            all_records.extend(r)
        elif isinstance(r, Exception):
            logger.error(f"Fetch error: {r}")

    logger.info(f"Total: {len(all_records)} records fetched for Karnataka on {trade_date}")
    return all_records


async def ingest_prices_to_db(db_session, records: list[dict], crop_map: dict, market_map: dict):
    """
    Store fetched price records in PostgreSQL.
    crop_map: {"Tomato": 20, "Ragi": 2, ...}
    market_map: {"Kolar APMC": 1, "Hassan APMC": 3, ...}
    """
    from sqlalchemy import text

    inserted = 0
    skipped = 0

    for r in records:
        crop_id = crop_map.get(r["crop_name"])
        market_id = market_map.get(r["market_name"])

        if not crop_id or not market_id or r["modal_price"] <= 0:
            skipped += 1
            continue

        try:
            await db_session.execute(text("""
                INSERT INTO price_records
                    (crop_id, apmc_id, variety, grade, min_price, max_price,
                     modal_price, arrivals_tonnes, trade_date, source)
                VALUES
                    (:crop_id, :apmc_id, :variety, :grade, :min, :max,
                     :modal, :arrivals, :date, :source)
                ON CONFLICT (crop_id, apmc_id, variety, trade_date) DO UPDATE SET
                    modal_price     = EXCLUDED.modal_price,
                    min_price       = EXCLUDED.min_price,
                    max_price       = EXCLUDED.max_price,
                    arrivals_tonnes = EXCLUDED.arrivals_tonnes
            """), {
                "crop_id":  crop_id,
                "apmc_id":  market_id,
                "variety":  r.get("variety", "FAQ"),
                "grade":    r.get("grade", "FAQ"),
                "min":      r["min_price"],
                "max":      r["max_price"],
                "modal":    r["modal_price"],
                "arrivals": r["arrivals_tonnes"],
                "date":     r["trade_date"],
                "source":   r["source"],
            })
            inserted += 1
        except Exception as e:
            logger.error(f"DB insert error for {r['crop_name']} @ {r['market_name']}: {e}")
            skipped += 1

    await db_session.commit()
    logger.info(f"Ingested {inserted} records, skipped {skipped}")
    return {"inserted": inserted, "skipped": skipped}


# ─────────────────────────────────────────────
# SCHEDULER (APScheduler)
# ─────────────────────────────────────────────

def setup_price_scheduler(app, db_session_factory, api_key: str):
    """
    Sets up APScheduler to run daily price fetch at 7 AM IST.
    APMC markets report prices by 6-7 AM daily.
    """
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from apscheduler.triggers.cron import CronTrigger
    import pytz

    IST = pytz.timezone("Asia/Kolkata")
    scheduler = AsyncIOScheduler(timezone=IST)

    async def daily_fetch_job():
        logger.info("⏰ Daily price fetch starting...")
        try:
            records = await fetch_all_karnataka_prices(api_key)
            async with db_session_factory() as session:
                # Get crop and market maps from DB
                from sqlalchemy import text
                crops = await session.execute(text("SELECT name_en, id FROM crops"))
                markets = await session.execute(text("SELECT name_en, id FROM apmc_markets"))
                crop_map  = {r.name_en: r.id for r in crops.fetchall()}
                market_map = {r.name_en: r.id for r in markets.fetchall()}
                result = await ingest_prices_to_db(session, records, crop_map, market_map)
            logger.info(f"✅ Daily fetch done: {result}")
        except Exception as e:
            logger.error(f"❌ Daily fetch failed: {e}")

    # Run at 7:00 AM IST daily
    scheduler.add_job(daily_fetch_job, CronTrigger(hour=7, minute=0, timezone=IST), id="daily_price_fetch")

    # Also run at startup if today's data is missing
    scheduler.add_job(daily_fetch_job, "date", run_date=datetime.now(), id="startup_fetch")

    scheduler.start()
    logger.info("📅 Price fetch scheduler started — runs daily at 7 AM IST")
    return scheduler


# ─────────────────────────────────────────────
# MOCK DATA GENERATOR (for development without API key)
# ─────────────────────────────────────────────

def generate_mock_prices(n_days: int = 90) -> list[dict]:
    """Generate realistic mock price data for development/testing."""
    import random
    random.seed(42)

    crops = [
        {"id": 20, "name": "Tomato",   "base": 1500, "volatility": 0.08},
        {"id": 2,  "name": "Ragi",     "base": 3800, "volatility": 0.02},
        {"id": 7,  "name": "Tur",      "base": 7500, "volatility": 0.02},
        {"id": 21, "name": "Onion",    "base": 2000, "volatility": 0.06},
        {"id": 59, "name": "Cotton",   "base": 7500, "volatility": 0.02},
        {"id": 3,  "name": "Maize",    "base": 2100, "volatility": 0.02},
        {"id": 13, "name": "Groundnut","base": 6800, "volatility": 0.02},
    ]

    markets = [
        {"id": 1, "name": "Kolar APMC"},
        {"id": 3, "name": "Hassan APMC"},
        {"id": 8, "name": "Raichur APMC"},
    ]

    records = []
    today = date.today()

    for crop in crops:
        for market in markets:
            price = crop["base"]
            for i in range(n_days):
                d = today - timedelta(days=n_days - i)
                price *= (1 + random.gauss(0, crop["volatility"]))
                price = max(crop["base"] * 0.4, min(price, crop["base"] * 2.5))
                arrivals = abs(random.gauss(50, 20))

                records.append({
                    "crop_id":        crop["id"],
                    "apmc_id":        market["id"],
                    "crop_name":      crop["name"],
                    "market_name":    market["name"],
                    "variety":        "FAQ",
                    "grade":          "FAQ",
                    "min_price":      round(price * 0.9, 2),
                    "max_price":      round(price * 1.1, 2),
                    "modal_price":    round(price, 2),
                    "arrivals_tonnes": round(arrivals, 1),
                    "trade_date":     d.isoformat(),
                    "source":         "mock",
                })

    logger.info(f"Generated {len(records)} mock price records")
    return records
