from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

MODEL_PATH = Path("/ml/models/xgb_price_model.joblib")
SCALER_PATH = Path("/ml/models/feature_scaler.joblib")

_model = None
_scaler = None


def load_model():
    global _model, _scaler
    if _model is None and MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        if SCALER_PATH.exists():
            _scaler = joblib.load(SCALER_PATH)
        logger.info("XGBoost model loaded")
    return _model, _scaler


RECOMMENDATION_RULES = [
    # (condition_fn, recommendation)
    (lambda pred_pct, today, msp: pred_pct < -5, "SELL_TODAY"),
    (lambda pred_pct, today, msp: msp and today < msp * 0.98, "GOVT_PROCUREMENT"),
    (lambda pred_pct, today, msp: pred_pct > 8, "HOLD"),
    (lambda pred_pct, today, msp: 0 < pred_pct <= 8, "WAIT_2_DAYS"),
]


def determine_recommendation(predicted_pct_change: float, today_price: float, msp_price: Optional[float]) -> str:
    for condition, rec in RECOMMENDATION_RULES:
        if condition(predicted_pct_change, today_price, msp_price):
            return rec
    return "SELL_TODAY"


@router.post("/recommend")
async def get_recommendation(
    crop_id: int = Query(...),
    apmc_id: int = Query(...),
    quantity_tonnes: float = Query(1.0, ge=0.1, le=500),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Main AI prediction endpoint.
    Returns: recommendation, confidence, predicted prices, reasoning, market comparison.
    """
    # Fetch crop info
    crop_result = await db.execute(text("SELECT * FROM crops WHERE id = :id"), {"id": crop_id})
    crop = crop_result.mappings().one_or_none()
    if not crop:
        raise HTTPException(404, "Crop not found")

    # Fetch recent price history (30 days)
    prices_result = await db.execute(text("""
        SELECT trade_date, modal_price, min_price, max_price, arrivals_tonnes
        FROM price_records
        WHERE crop_id = :cid AND apmc_id = :mid
          AND trade_date >= CURRENT_DATE - INTERVAL '35 days'
        ORDER BY trade_date DESC
        LIMIT 35
    """), {"cid": crop_id, "mid": apmc_id})
    price_rows = prices_result.mappings().all()

    if not price_rows:
        raise HTTPException(422, "Insufficient price history for this crop/market combination")

    prices_df = pd.DataFrame([dict(r) for r in price_rows])
    prices_df["trade_date"] = pd.to_datetime(prices_df["trade_date"])
    prices_df = prices_df.sort_values("trade_date")

    today_price = float(prices_df["modal_price"].iloc[-1])
    price_7d_avg = float(prices_df["modal_price"].tail(7).mean())
    price_30d_avg = float(prices_df["modal_price"].mean())
    arrivals_avg = float(prices_df["arrivals_tonnes"].tail(7).mean())

    # Try ML model, fall back to rule-based
    model, scaler = load_model()

    if model:
        features = np.array([[
            today_price, price_7d_avg, price_30d_avg,
            arrivals_avg,
            prices_df["modal_price"].pct_change().tail(7).mean(),
        ]])
        if scaler:
            features = scaler.transform(features)
        predicted_tomorrow = float(model.predict(features)[0])
        confidence = min(90, max(50, 80 - abs(predicted_tomorrow - today_price) / today_price * 100))
    else:
        # Heuristic fallback — momentum-based
        momentum = (today_price - price_7d_avg) / price_7d_avg
        noise = np.random.normal(0, 0.03)
        predicted_tomorrow = today_price * (1 - momentum * 0.4 + noise)
        confidence = 65.0

    predicted_pct = (predicted_tomorrow - today_price) / today_price * 100
    msp_price = float(crop["msp_price"]) if crop.get("msp_price") else None

    recommendation = determine_recommendation(predicted_pct, today_price, msp_price)

    # Market comparison — nearest 3 markets for same crop
    markets_result = await db.execute(text("""
        SELECT am.id, am.name_en AS market, am.lat, am.lng, pr.modal_price
        FROM price_records pr
        JOIN apmc_markets am ON pr.apmc_id = am.id
        WHERE pr.crop_id = :cid AND pr.trade_date >= CURRENT_DATE - INTERVAL '3 days'
        ORDER BY pr.trade_date DESC
        LIMIT 10
    """), {"cid": crop_id})
    market_comparisons = [dict(r) for r in markets_result.mappings().all()]

    # Build response
    return {
        "recommendation": recommendation,
        "confidence": round(confidence, 1),
        "crop": dict(crop),
        "current_price": today_price,
        "predicted_tomorrow": round(predicted_tomorrow, 0),
        "predicted_3day": round(predicted_tomorrow * (1 + predicted_pct / 200), 0),
        "predicted_pct_change": round(predicted_pct, 1),
        "price_7d_avg": round(price_7d_avg, 0),
        "price_30d_avg": round(price_30d_avg, 0),
        "arrivals_avg_7d": round(arrivals_avg, 1),
        "msp_price": msp_price,
        "est_gross_revenue": round(today_price * quantity_tonnes * 10, 0),  # qty in tonnes → quintals *10
        "market_comparison": market_comparisons[:3],
        "price_history": [
            {"date": str(r["trade_date"])[:10], "price": float(r["modal_price"])}
            for _, r in prices_df.tail(10).iterrows()
        ],
        "model_used": "xgboost" if model else "heuristic",
    }
