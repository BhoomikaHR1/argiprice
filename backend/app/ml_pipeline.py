"""
AgriPrice — XGBoost Price Prediction Pipeline
Trains and serves price predictions for Karnataka APMC crops.
"""
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta
from pathlib import Path

try:
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import LabelEncoder
    from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False

MODEL_DIR = Path(__file__).parent.parent.parent.parent / "ml" / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# ─────────────────────────────────────────────
# FEATURE ENGINEERING
# ─────────────────────────────────────────────

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transform raw price records into ML features.
    Input df must have: crop_id, apmc_id, modal_price, trade_date,
                        arrivals_tonnes, temperature, humidity, rainfall_mm
    """
    df = df.copy()
    df['trade_date'] = pd.to_datetime(df['trade_date'])
    df = df.sort_values(['crop_id', 'apmc_id', 'trade_date'])

    # ── Date features ──
    df['day_of_week']  = df['trade_date'].dt.dayofweek      # 0=Mon
    df['day_of_month'] = df['trade_date'].dt.day
    df['month']        = df['trade_date'].dt.month
    df['week_of_year'] = df['trade_date'].dt.isocalendar().week.astype(int)
    df['quarter']      = df['trade_date'].dt.quarter
    df['is_weekend']   = (df['day_of_week'] >= 5).astype(int)

    # ── Season encoding (Karnataka crop calendar) ──
    def season(month):
        if month in [6, 7, 8, 9, 10]:  return 0  # Kharif
        if month in [11, 12, 1, 2, 3]: return 1  # Rabi
        return 2                                   # Zaid/Summer
    df['season'] = df['month'].apply(season)

    # ── Lagged price features (per crop+market pair) ──
    group = df.groupby(['crop_id', 'apmc_id'])
    for lag in [1, 2, 3, 7, 14, 30]:
        df[f'price_lag_{lag}d'] = group['modal_price'].shift(lag)

    # ── Rolling statistics ──
    for window in [7, 14, 30]:
        rolled = group['modal_price'].transform(
            lambda x: x.shift(1).rolling(window, min_periods=3)
        )
        df[f'price_roll_mean_{window}d'] = rolled.mean()
        df[f'price_roll_std_{window}d']  = rolled.std()
        df[f'price_roll_min_{window}d']  = rolled.min()
        df[f'price_roll_max_{window}d']  = rolled.max()

    # ── Momentum features ──
    df['price_change_1d'] = df['modal_price'] - df['price_lag_1d']
    df['price_change_7d'] = df['modal_price'] - df['price_lag_7d']
    df['price_pct_change_1d'] = df['price_change_1d'] / df['price_lag_1d'].replace(0, np.nan)

    # ── Arrivals features ──
    for lag in [1, 3, 7]:
        df[f'arrivals_lag_{lag}d'] = group['arrivals_tonnes'].shift(lag)
    df['arrivals_roll_7d'] = group['arrivals_tonnes'].transform(
        lambda x: x.shift(1).rolling(7, min_periods=2).mean()
    )

    # ── Weather features ──
    if 'temperature' in df.columns:
        df['temp_lag_1d']     = group['temperature'].shift(1) if 'temperature' in df else 28.0
        df['humidity_lag_1d'] = group['humidity'].shift(1) if 'humidity' in df else 65.0
        df['rainfall_3d_sum'] = group['rainfall_mm'].transform(
            lambda x: x.shift(1).rolling(3, min_periods=1).sum()
        ) if 'rainfall_mm' in df else 0.0
    else:
        df['temp_lag_1d']     = 28.0
        df['humidity_lag_1d'] = 65.0
        df['rainfall_3d_sum'] = 0.0

    # ── Relative price to rolling mean ──
    df['price_vs_mean_7d']  = df['modal_price'] / df['price_roll_mean_7d'].replace(0, np.nan)
    df['price_vs_mean_30d'] = df['modal_price'] / df['price_roll_mean_30d'].replace(0, np.nan)

    return df


FEATURE_COLS = [
    'crop_id', 'apmc_id',
    'day_of_week', 'day_of_month', 'month', 'week_of_year', 'quarter', 'is_weekend', 'season',
    'price_lag_1d', 'price_lag_2d', 'price_lag_3d', 'price_lag_7d', 'price_lag_14d', 'price_lag_30d',
    'price_roll_mean_7d', 'price_roll_std_7d', 'price_roll_min_7d', 'price_roll_max_7d',
    'price_roll_mean_14d', 'price_roll_mean_30d', 'price_roll_std_30d',
    'price_change_1d', 'price_change_7d', 'price_pct_change_1d',
    'arrivals_lag_1d', 'arrivals_lag_3d', 'arrivals_lag_7d', 'arrivals_roll_7d',
    'temp_lag_1d', 'humidity_lag_1d', 'rainfall_3d_sum',
    'price_vs_mean_7d', 'price_vs_mean_30d',
]
TARGET_COL = 'next_day_price'


# ─────────────────────────────────────────────
# TRAINING
# ─────────────────────────────────────────────

def train_model(df: pd.DataFrame, crop_id: int = None) -> dict:
    """
    Train XGBoost model for price prediction.
    If crop_id is given, trains crop-specific model; else trains global model.
    Returns: {"model": xgb.XGBRegressor, "mae": float, "mape": float, "feature_importance": dict}
    """
    if not ML_AVAILABLE:
        return {"error": "XGBoost not installed"}

    # Build features
    df = build_features(df)

    # Create target: next day's price
    df[TARGET_COL] = df.groupby(['crop_id', 'apmc_id'])['modal_price'].shift(-1)

    # Filter to specific crop if requested
    if crop_id:
        df = df[df['crop_id'] == crop_id]

    # Drop rows with missing target or features
    feature_cols = [c for c in FEATURE_COLS if c in df.columns]
    df_clean = df[feature_cols + [TARGET_COL]].dropna()

    if len(df_clean) < 100:
        return {"error": f"Insufficient data: {len(df_clean)} rows (need 100+)"}

    X = df_clean[feature_cols]
    y = df_clean[TARGET_COL]

    # Time-series split (no shuffle — respect temporal order)
    split_idx = int(len(df_clean) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    # XGBoost model
    model = xgb.XGBRegressor(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        reg_alpha=0.1,
        reg_lambda=1.0,
        early_stopping_rounds=30,
        eval_metric='mae',
        random_state=42,
        n_jobs=-1,
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    mape = mean_absolute_percentage_error(y_test, y_pred) * 100

    # Feature importance
    importance = dict(zip(feature_cols, model.feature_importances_))
    top_features = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True)[:10])

    # Save model
    model_name = f"xgb_crop_{crop_id}.pkl" if crop_id else "xgb_global.pkl"
    model_path = MODEL_DIR / model_name
    joblib.dump({
        "model": model,
        "feature_cols": feature_cols,
        "trained_at": datetime.now().isoformat(),
        "mae": mae,
        "mape": mape,
        "n_train": len(X_train),
        "n_test": len(X_test),
    }, model_path)

    print(f"✓ Model saved: {model_path}")
    print(f"  MAE:  ₹{mae:.2f}/quintal")
    print(f"  MAPE: {mape:.1f}%")
    print(f"  Top features: {list(top_features.keys())[:5]}")

    return {
        "model": model,
        "feature_cols": feature_cols,
        "mae": round(mae, 2),
        "mape": round(mape, 1),
        "feature_importance": top_features,
        "model_path": str(model_path),
    }


# ─────────────────────────────────────────────
# PREDICTION
# ─────────────────────────────────────────────

_model_cache: dict = {}

def load_model(crop_id: int = None) -> dict | None:
    """Load model from disk with caching."""
    model_name = f"xgb_crop_{crop_id}.pkl" if crop_id else "xgb_global.pkl"
    if model_name not in _model_cache:
        path = MODEL_DIR / model_name
        if not path.exists():
            path = MODEL_DIR / "xgb_global.pkl"  # fallback
        if path.exists():
            _model_cache[model_name] = joblib.load(path)
        else:
            return None
    return _model_cache.get(model_name)


def predict_tomorrow(
    crop_id: int,
    apmc_id: int,
    recent_prices: list[dict],
    weather: dict | None = None,
) -> dict:
    """
    Predict tomorrow's price for a crop+market.

    Args:
        crop_id: crop database ID
        apmc_id: APMC market database ID
        recent_prices: list of dicts with keys: trade_date, modal_price, arrivals_tonnes
        weather: dict with keys: temperature, humidity, rainfall_mm (optional)

    Returns:
        dict with: predicted_price, confidence, recommendation, reasoning
    """
    model_data = load_model(crop_id) or load_model()

    if not model_data:
        return _fallback_prediction(recent_prices)

    # Build dataframe from recent history
    df = pd.DataFrame(recent_prices)
    df['crop_id']  = crop_id
    df['apmc_id']  = apmc_id

    if weather:
        df['temperature']  = weather.get('temperature', 28)
        df['humidity']     = weather.get('humidity', 65)
        df['rainfall_mm']  = weather.get('rainfall_mm', 0)

    df = build_features(df)

    # Use last row (today) to predict tomorrow
    feature_cols = model_data['feature_cols']
    available_cols = [c for c in feature_cols if c in df.columns]
    last_row = df[available_cols].iloc[-1:].fillna(0)

    # Pad any missing columns with 0
    for col in feature_cols:
        if col not in last_row.columns:
            last_row[col] = 0

    predicted = float(model_data['model'].predict(last_row[feature_cols])[0])
    current   = float(df['modal_price'].iloc[-1])

    # Confidence based on model MAPE
    mape = model_data.get('mape', 15.0)
    confidence = max(40, min(95, round(100 - mape, 1)))

    # Recommendation logic
    recommendation, reasoning_en, reasoning_kn = _generate_recommendation(
        current, predicted, crop_id, weather, df
    )

    return {
        "predicted_price":   round(predicted, 2),
        "current_price":     round(current, 2),
        "price_change":      round(predicted - current, 2),
        "price_change_pct":  round((predicted - current) / current * 100, 1),
        "confidence":        confidence,
        "recommendation":    recommendation,
        "reasoning_en":      reasoning_en,
        "reasoning_kn":      reasoning_kn,
        "model_mae":         model_data.get('mae', 0),
    }


def _generate_recommendation(
    current: float, predicted: float,
    crop_id: int, weather: dict | None,
    df: pd.DataFrame
) -> tuple[str, str, str]:
    """
    Business logic for sell/hold/wait/govt recommendation.
    This is where the domain expertise lives.
    """
    change_pct = (predicted - current) / current * 100
    rain_coming = weather and weather.get('rainfall_mm', 0) > 5

    # Perishable crops: never recommend Hold/Wait
    PERISHABLE_CROP_IDS = {20, 21, 23, 24, 25, 26, 27, 28, 29, 31, 33, 40, 41, 42, 43, 44, 45, 46, 47, 48}
    is_perishable = crop_id in PERISHABLE_CROP_IDS

    # MSP crops
    MSP_CROPS = {1: 2300, 2: 3846, 3: 2090, 4: 3371, 5: 2625, 7: 7550, 8: 8682, 9: 7400, 13: 6783, 59: 7521}
    msp = MSP_CROPS.get(crop_id)

    # Price vs 7-day mean
    mean_7d = df['price_roll_mean_7d'].iloc[-1] if 'price_roll_mean_7d' in df else current

    if is_perishable:
        if change_pct >= 3:
            rec = "SELL_TODAY"
            en = f"Prices rising but this is a perishable crop. Sell today to avoid quality/spoilage risk. Predicted tomorrow: ₹{predicted:.0f}."
            kn = f"ಇದು ಬೇಗ ಕೆಡುವ ಬೆಳೆ. ಗುಣಮಟ್ಟ ಕಳೆದುಕೊಳ್ಳುವ ಮೊದಲು ಇಂದೇ ಮಾರಿ."
        elif change_pct < -5:
            rec = "SELL_TODAY"
            en = f"Prices dropping tomorrow (predicted: ₹{predicted:.0f}). For this perishable crop, sell today."
            kn = f"ನಾಳೆ ಬೆಲೆ ಕಡಿಮೆ ಆಗಲಿದೆ. ಇಂದೇ ಮಾರಿ."
        else:
            rec = "SELL_TODAY"
            en = f"Perishable crop — sell today. Current price ₹{current:.0f} is stable."
            kn = f"ಬೇಗ ಕೆಡುವ ಬೆಳೆ — ಇಂದೇ ಮಾರಿ."
    elif msp and current < msp:
        rec = "GOVT_PROCUREMENT"
        en = f"Current market price ₹{current:.0f} is below MSP ₹{msp:.0f}. Visit government procurement center for guaranteed MSP price."
        kn = f"ಮಾರ್ಕೆಟ್ ಬೆಲೆ MSP ₹{msp:.0f} ಗಿಂತ ಕಡಿಮೆ. ಸರ್ಕಾರಿ ಖರೀದಿ ಕೇಂದ್ರಕ್ಕೆ ಹೋಗಿ."
    elif change_pct >= 5:
        rec = "WAIT_2_DAYS"
        en = f"Price predicted to rise {change_pct:.1f}% tomorrow to ₹{predicted:.0f}. Consider waiting 2 days for better return."
        kn = f"ನಾಳೆ ಬೆಲೆ ₹{predicted:.0f} ಆಗಬಹುದು. 2 ದಿನ ಕಾಯಿ."
    elif change_pct <= -5 or rain_coming:
        rec = "SELL_TODAY"
        reason = "Rain forecast will increase supply and push prices down." if rain_coming else f"Price predicted to drop {abs(change_pct):.1f}%."
        en = f"{reason} Sell today at ₹{current:.0f}."
        kn = f"{'ಮಳೆ ಮುನ್ಸೂಚನೆ ಬೆಲೆ ಕಡಿಮೆ ಮಾಡಬಹುದು.' if rain_coming else 'ಬೆಲೆ ಇಳಿಯಲಿದೆ.'} ಇಂದೇ ಮಾರಿ."
    elif current >= mean_7d * 1.1:
        rec = "SELL_TODAY"
        en = f"Price ₹{current:.0f} is {((current/mean_7d)-1)*100:.0f}% above 7-day average (₹{mean_7d:.0f}). Good time to sell."
        kn = f"ಬೆಲೆ 7 ದಿನದ ಸರಾಸರಿಗಿಂತ ಹೆಚ್ಚಿದೆ. ಮಾರಲು ಉತ್ತಮ ಸಮಯ."
    else:
        rec = "HOLD"
        en = f"Prices are stable. Hold for 1-2 days and monitor. Predicted: ₹{predicted:.0f}."
        kn = f"ಬೆಲೆ ಸ್ಥಿರವಾಗಿದೆ. 1-2 ದಿನ ಕಾಯಿ."

    return rec, en, kn


def _fallback_prediction(recent_prices: list[dict]) -> dict:
    """Simple fallback when no ML model is available."""
    if not recent_prices:
        return {"error": "No price data available"}

    prices = [p['modal_price'] for p in recent_prices[-7:]]
    current = prices[-1]
    trend = (prices[-1] - prices[0]) / len(prices) if len(prices) > 1 else 0
    predicted = current + trend

    return {
        "predicted_price": round(predicted, 2),
        "current_price": round(current, 2),
        "price_change": round(predicted - current, 2),
        "confidence": 45.0,
        "recommendation": "SELL_TODAY" if predicted < current else "HOLD",
        "reasoning_en": "Simple trend-based prediction (ML model not loaded).",
        "reasoning_kn": "ಸರಳ ಊಹೆ (ML ಮಾದರಿ ಲೋಡ್ ಆಗಿಲ್ಲ).",
        "model_mae": None,
    }


# ─────────────────────────────────────────────
# CLI TRAINING SCRIPT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    """
    Usage: python ml_pipeline.py
    Loads data from PostgreSQL, trains models for all crops.
    """
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

    print("🌾 AgriPrice XGBoost Training Pipeline")
    print("=" * 50)

    if not ML_AVAILABLE:
        print("❌ XGBoost not installed. Run: pip install xgboost scikit-learn")
        sys.exit(1)

    # Synthetic training data for testing
    np.random.seed(42)
    n = 3000
    dates = pd.date_range('2022-01-01', periods=n, freq='D')
    crop_ids = [1, 2, 7, 20, 59]

    records = []
    for cid in crop_ids:
        base = {1: 2300, 2: 3800, 7: 7500, 20: 1500, 59: 7500}[cid]
        price = base
        for i, date in enumerate(dates[:600]):
            price *= (1 + np.random.normal(0, 0.015))
            price = max(price, base * 0.5)
            records.append({
                'crop_id': cid, 'apmc_id': 1,
                'trade_date': date,
                'modal_price': round(price, 2),
                'arrivals_tonnes': abs(np.random.normal(50, 20)),
                'temperature': np.random.normal(28, 5),
                'humidity': np.random.normal(65, 15),
                'rainfall_mm': max(0, np.random.normal(0, 3)),
            })

    df = pd.DataFrame(records)
    print(f"Training on {len(df)} synthetic records ({len(crop_ids)} crops × 600 days)")

    result = train_model(df)
    if "error" not in result:
        print(f"\n✅ Global model trained!")
        print(f"   MAE:  ₹{result['mae']}/quintal")
        print(f"   MAPE: {result['mape']}%")
        print(f"   Top feature: {list(result['feature_importance'].keys())[0]}")
    else:
        print(f"❌ Training failed: {result['error']}")
