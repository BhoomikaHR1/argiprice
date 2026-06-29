from datetime import date, timedelta
import logging
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

MODEL_PATH = Path("/ml/models/xgb_price_model.joblib")
SCALER_PATH = Path("/ml/models/feature_scaler.joblib")

_model = None
_scaler = None

MARKET_LIBRARY = {
    1: {"name": "Kolar APMC", "district": "Kolar", "distance_km": 8},
    2: {"name": "Hassan APMC", "district": "Hassan", "distance_km": 45},
    3: {"name": "Mandya APMC", "district": "Mandya", "distance_km": 62},
    4: {"name": "Mysuru APMC", "district": "Mysuru", "distance_km": 90},
    5: {"name": "Bengaluru APMC", "district": "Bengaluru", "distance_km": 105},
}

PERISHABLE_CROP_IDS = {
    20, 21, 23, 24, 25, 26, 27, 28, 29, 31, 33,
    40, 41, 42, 43, 44, 45, 46, 47, 48,
}

DISTRICT_WEATHER = {
    "Kolar": {"temperature": 29, "humidity": 58, "rainfall_mm": 2.5, "condition": "Partly Cloudy"},
    "Hassan": {"temperature": 25, "humidity": 74, "rainfall_mm": 7.2, "condition": "Light Rain"},
    "Mandya": {"temperature": 28, "humidity": 68, "rainfall_mm": 3.8, "condition": "Cloudy"},
    "Mysuru": {"temperature": 27, "humidity": 70, "rainfall_mm": 4.5, "condition": "Scattered Showers"},
    "Bengaluru": {"temperature": 26, "humidity": 66, "rainfall_mm": 1.8, "condition": "Pleasant"},
}

RECOMMENDATION_CONFIG = {
    "SELL_TODAY": {
        "label_en": "Sell Today",
        "label_kn": "ಇಂದೇ ಮಾರಾಟ ಮಾಡಿ",
    },
    "WAIT_2_DAYS": {
        "label_en": "Wait 2 Days",
        "label_kn": "2 ದಿನ ಕಾಯಿರಿ",
    },
    "HOLD": {
        "label_en": "Hold",
        "label_kn": "ತಡೆದು ನೋಡಿ",
    },
    "GOVT_PROCUREMENT": {
        "label_en": "Government Procurement",
        "label_kn": "ಸರ್ಕಾರಿ ಖರೀದಿ",
    },
}


def load_model():
    global _model, _scaler
    if _model is None and MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        if SCALER_PATH.exists():
            _scaler = joblib.load(SCALER_PATH)
        logger.info("XGBoost model loaded")
    return _model, _scaler


def build_weather_outlook(district: str) -> list[dict]:
    base = DISTRICT_WEATHER.get(district, {"temperature": 28, "humidity": 65, "rainfall_mm": 3.0, "condition": "Mixed"})
    outlook = []
    today = date.today()
    for offset in range(1, 4):
        outlook.append({
            "date": str(today + timedelta(days=offset)),
            "temperature": round(base["temperature"] + (offset - 2) * 0.7, 1),
            "humidity": max(45, min(90, round(base["humidity"] + offset * 1.5, 1))),
            "rainfall_mm": max(0, round(base["rainfall_mm"] + (offset - 2) * 1.2, 1)),
            "condition": base["condition"],
        })
    return outlook


def synthesize_price_history(crop_id: int, base_price: float, arrivals_seed: float) -> list[dict]:
    history = []
    start = date.today() - timedelta(days=34)
    current = base_price * 0.92
    for idx in range(35):
        wave = np.sin((idx + crop_id) / 4.5) * base_price * 0.018
        drift = ((crop_id % 6) - 2) * base_price * 0.0012
        current = max(base_price * 0.72, min(base_price * 1.24, current + wave + drift))
        history.append({
            "trade_date": start + timedelta(days=idx),
            "modal_price": round(current, 2),
            "min_price": round(current * 0.95, 2),
            "max_price": round(current * 1.05, 2),
            "arrivals_tonnes": round(arrivals_seed + ((idx % 5) - 2) * 2.8 + crop_id % 7, 2),
        })
    return history


def generate_forecast_series(today_price: float, weather_outlook: list[dict], crop_id: int, market_bias: float) -> tuple[list[dict], dict]:
    predictions = []
    current_price = today_price
    total_weather_impact = 0.0
    total_arrival_impact = 0.0
    total_momentum_impact = 0.0

    for day_index, weather in enumerate(weather_outlook, start=1):
        rainfall_impact = -0.018 if weather["rainfall_mm"] >= 6 else -0.006 if weather["rainfall_mm"] >= 3 else 0.004
        humidity_impact = -0.004 if weather["humidity"] >= 75 else 0.002
        temp_impact = -0.005 if weather["temperature"] >= 31 and crop_id in PERISHABLE_CROP_IDS else 0.003
        weather_impact = rainfall_impact + humidity_impact + temp_impact

        arrivals_impact = -0.01 if crop_id in PERISHABLE_CROP_IDS else -0.004
        momentum_impact = 0.006 + market_bias - (day_index - 1) * 0.002

        daily_change = weather_impact + arrivals_impact + momentum_impact
        current_price = max(today_price * 0.6, round(current_price * (1 + daily_change), 0))

        total_weather_impact += weather_impact
        total_arrival_impact += arrivals_impact
        total_momentum_impact += momentum_impact

        predictions.append({
            "day": day_index,
            "date": weather["date"],
            "predicted_price": current_price,
            "weather": weather,
            "drivers": {
                "weather_impact_pct": round(weather_impact * 100, 1),
                "arrivals_impact_pct": round(arrivals_impact * 100, 1),
                "momentum_impact_pct": round(momentum_impact * 100, 1),
            },
        })

    summary = {
        "weather_impact_pct": round(total_weather_impact * 100, 1),
        "arrivals_impact_pct": round(total_arrival_impact * 100, 1),
        "momentum_impact_pct": round(total_momentum_impact * 100, 1),
    }
    return predictions, summary


def score_features(weather_summary: dict, crop_id: int, current_price: float, avg_7d: float, arrivals_avg: float) -> dict:
    trend_gap = abs(current_price - avg_7d) / max(avg_7d, 1)
    return {
        "price_trend_score": int(min(95, 58 + trend_gap * 180)),
        "arrivals_score": int(min(95, 52 + arrivals_avg / 2.4)),
        "seasonal_score": int(min(95, 50 + (crop_id % 12) * 3)),
        "weather_score": int(min(95, 48 + abs(weather_summary["weather_impact_pct"]) * 5)),
    }


def build_market_comparison(base_price: float, selected_market_id: int) -> list[dict]:
    rows = []
    for market_id, market in MARKET_LIBRARY.items():
        price = round(base_price * (0.95 + market_id * 0.025))
        transport = round(market["distance_km"] * 3)
        rows.append({
            "market_id": market_id,
            "market": market["name"],
            "district": market["district"],
            "distance": market["distance_km"],
            "transport": transport,
            "price": price,
            "net": price - transport,
            "selected": market_id == selected_market_id,
        })
    return sorted(rows, key=lambda item: item["net"], reverse=True)


def determine_recommendation(crop: dict, today_price: float, forecast_3d: list[dict]) -> tuple[str, str, str]:
    day3_price = forecast_3d[-1]["predicted_price"]
    delta_pct = ((day3_price - today_price) / max(today_price, 1)) * 100
    heavy_rain = any(item["weather"]["rainfall_mm"] >= 6 for item in forecast_3d)
    is_perishable = crop["id"] in PERISHABLE_CROP_IDS
    msp_price = float(crop["msp_2024_25"]) if crop.get("msp_2024_25") else None

    if is_perishable:
        rec = "SELL_TODAY"
        en = f"{crop['name_en']} is perishable, so even with a short-term move it is safer to sell now before quality loss."
        kn = f"{crop['name_kn']} ಬೇಗ ಕೆಡುವ ಬೆಳೆ, ಆದ್ದರಿಂದ ಗುಣಮಟ್ಟ ಕುಸಿಯುವ ಮೊದಲು ಈಗಲೇ ಮಾರಾಟ ಮಾಡುವುದು ಉತ್ತಮ."
    elif msp_price and today_price < msp_price * 0.98:
        rec = "GOVT_PROCUREMENT"
        en = f"Current price is below MSP. Government procurement can protect your downside better than waiting in the open market."
        kn = f"ಪ್ರಸ್ತುತ ಬೆಲೆ MSP ಗಿಂತ ಕಡಿಮೆ ಇದೆ. ತೆರೆದ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಕಾಯುವುದಕ್ಕಿಂತ ಸರ್ಕಾರಿ ಖರೀದಿ ಉತ್ತಮ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ."
    elif delta_pct >= 4:
        rec = "WAIT_2_DAYS"
        en = f"The model expects roughly {delta_pct:.1f}% upside over the next 3 days, helped by momentum and manageable weather risk."
        kn = f"ಮುಂದಿನ 3 ದಿನಗಳಲ್ಲಿ ಸುಮಾರು {delta_pct:.1f}% ಏರಿಕೆ ಸಾಧ್ಯವೆಂದು ಮಾದರಿ ಸೂಚಿಸುತ್ತದೆ. ಹವಾಮಾನ ಅಪಾಯ ನಿಯಂತ್ರಣದಲ್ಲಿದೆ."
    elif delta_pct <= -4 or heavy_rain:
        rec = "SELL_TODAY"
        rain_reason = "Heavy rain is likely to increase arrivals and pressure prices." if heavy_rain else f"Prices are projected to soften by {abs(delta_pct):.1f}%."
        en = f"{rain_reason} Selling today protects your current rate."
        kn = f"{'ಭಾರಿ ಮಳೆ ಆಗುವ ಸಾಧ್ಯತೆ ಇದೆ; ಇದರಿಂದ ಮಾರುಕಟ್ಟೆಗೆ ಹೆಚ್ಚಿನ ಸರಕು ಬರಬಹುದು.' if heavy_rain else 'ಬೆಲೆ ಇಳಿಯುವ ಸೂಚನೆ ಇದೆ.'} ಆದ್ದರಿಂದ ಇಂದೇ ಮಾರಾಟ ಮಾಡಿ."
    else:
        rec = "HOLD"
        en = "The next 3 days look mostly stable. Hold briefly and monitor updated mandi prices and weather."
        kn = "ಮುಂದಿನ 3 ದಿನಗಳು ಬಹುತೇಕ ಸ್ಥಿರವಾಗಿ ಕಾಣುತ್ತಿವೆ. ಸ್ವಲ್ಪ ಕಾಲ ತಡೆದು ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮತ್ತು ಹವಾಮಾನವನ್ನು ಗಮನಿಸಿ."

    return rec, en, kn


@router.post("/recommend")
async def get_recommendation(
    crop_id: int = Query(...),
    apmc_id: int = Query(...),
    quantity_tonnes: float = Query(1.0, ge=0.1, le=500),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    crop_result = await db.execute(text("SELECT * FROM crops WHERE id = :id"), {"id": crop_id})
    crop = crop_result.mappings().one_or_none()
    if not crop:
        raise HTTPException(404, "Crop not found")

    selected_market = MARKET_LIBRARY.get(apmc_id, MARKET_LIBRARY[1])

    prices_result = await db.execute(text("""
        SELECT trade_date, modal_price, min_price, max_price, arrivals_tonnes
        FROM price_records
        WHERE crop_id = :cid AND apmc_id = :mid
          AND trade_date >= CURRENT_DATE - INTERVAL '35 days'
        ORDER BY trade_date ASC
    """), {"cid": crop_id, "mid": apmc_id})
    price_rows = [dict(r) for r in prices_result.mappings().all()]

    base_price = float(crop["msp_2024_25"] or 2200)
    if not price_rows:
        arrivals_seed = 28 if crop_id in PERISHABLE_CROP_IDS else 46
        synthetic_base = round(base_price * (1.03 if crop.get("has_msp") else 1.08))
        price_rows = synthesize_price_history(crop_id, synthetic_base, arrivals_seed)

    prices_df = pd.DataFrame(price_rows)
    prices_df["trade_date"] = pd.to_datetime(prices_df["trade_date"])
    prices_df = prices_df.sort_values("trade_date")

    today_price = float(prices_df["modal_price"].iloc[-1])
    price_7d_avg = float(prices_df["modal_price"].tail(7).mean())
    price_30d_avg = float(prices_df["modal_price"].tail(30).mean())
    arrivals_avg = float(prices_df["arrivals_tonnes"].tail(7).mean())

    weather_outlook = build_weather_outlook(selected_market["district"])
    market_bias = ((apmc_id % 4) - 1.5) * 0.004

    model, scaler = load_model()
    model_boost = 0.0
    if model:
        features = np.array([[
            today_price,
            price_7d_avg,
            price_30d_avg,
            arrivals_avg,
            float(prices_df["modal_price"].pct_change().tail(7).fillna(0).mean()),
        ]])
        if scaler:
            features = scaler.transform(features)
        predicted_tomorrow = float(model.predict(features)[0])
        model_boost = ((predicted_tomorrow - today_price) / max(today_price, 1)) * 0.35
    else:
        predicted_tomorrow = today_price * (1 + market_bias + 0.008)

    forecast_3d, weather_summary = generate_forecast_series(
        today_price=today_price,
        weather_outlook=weather_outlook,
        crop_id=crop_id,
        market_bias=market_bias + model_boost,
    )
    forecast_3d[0]["predicted_price"] = round(predicted_tomorrow, 0)

    recommendation, reasoning_en, reasoning_kn = determine_recommendation(crop, today_price, forecast_3d)
    features = score_features(weather_summary, crop_id, today_price, price_7d_avg, arrivals_avg)
    market_comparison = build_market_comparison(today_price, apmc_id)
    best_market = market_comparison[0]
    selected_transport = next((item["transport"] for item in market_comparison if item["selected"]), market_comparison[0]["transport"])

    price_history = [
        {"date": row["trade_date"].strftime("%Y-%m-%d"), "price": float(row["modal_price"]), "predicted": False}
        for _, row in prices_df.tail(7).iterrows()
    ]
    price_history.extend([
        {"date": "Tomorrow", "price": forecast_3d[0]["predicted_price"], "predicted": True},
        {"date": "+2 days", "price": forecast_3d[1]["predicted_price"], "predicted": True},
        {"date": "+3 days", "price": forecast_3d[2]["predicted_price"], "predicted": True},
    ])

    criteria_used = [
        {
            "label": "Weather outlook",
            "detail": f"Rainfall over next 3 days: {sum(item['weather']['rainfall_mm'] for item in forecast_3d):.1f} mm",
            "impact_score": features["weather_score"],
        },
        {
            "label": "7-day price trend",
            "detail": f"Current price vs 7-day average: Rs {today_price:.0f} vs Rs {price_7d_avg:.0f}",
            "impact_score": features["price_trend_score"],
        },
        {
            "label": "Market arrivals",
            "detail": f"Average arrivals over 7 days: {arrivals_avg:.1f} tonnes",
            "impact_score": features["arrivals_score"],
        },
        {
            "label": "Seasonality",
            "detail": f"Crop category and storage profile influence short-term risk for {crop['name_en']}.",
            "impact_score": features["seasonal_score"],
        },
    ]

    confidence = round(min(91, max(61, 72 + (features["price_trend_score"] - abs(weather_summary["weather_impact_pct"]) * 2) / 6)), 1)
    est_net_profit = round((today_price - selected_transport) * quantity_tonnes * 10, 0)

    return {
        "recommendation": recommendation,
        "recommendation_meta": RECOMMENDATION_CONFIG[recommendation],
        "confidence": confidence,
        "crop": {
            "id": crop["id"],
            "name_en": crop["name_en"],
            "name_kn": crop["name_kn"],
            "has_msp": crop["has_msp"],
            "msp_price": float(crop["msp_2024_25"]) if crop.get("msp_2024_25") else None,
        },
        "market": selected_market,
        "current_price": round(today_price, 0),
        "predicted_tomorrow": forecast_3d[0]["predicted_price"],
        "predicted_3day": forecast_3d[-1]["predicted_price"],
        "predicted_pct_change": round(((forecast_3d[-1]["predicted_price"] - today_price) / max(today_price, 1)) * 100, 1),
        "price_7d_avg": round(price_7d_avg, 0),
        "price_30d_avg": round(price_30d_avg, 0),
        "arrivals_avg_7d": round(arrivals_avg, 1),
        "reasoning_en": reasoning_en,
        "reasoning_kn": reasoning_kn,
        "next_3_days": forecast_3d,
        "weather_summary": {
            "district": selected_market["district"],
            "condition": weather_outlook[0]["condition"],
            "rainfall_total_mm": round(sum(item["weather"]["rainfall_mm"] for item in forecast_3d), 1),
            **weather_summary,
        },
        "criteria_used": criteria_used,
        "features": features,
        "market_comparison": market_comparison[:3],
        "best_market": best_market,
        "price_history": price_history,
        "est_gross_revenue": round(today_price * quantity_tonnes * 10, 0),
        "est_net_profit": est_net_profit,
        "transport_cost": selected_transport,
        "model_used": "xgboost+heuristic" if model else "heuristic",
    }
