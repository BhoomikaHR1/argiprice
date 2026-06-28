from fastapi import APIRouter, Query
import httpx
from app.core.config import settings

router = APIRouter()


@router.get("/district/{district_id}")
async def get_district_weather(district_id: int):
    """Fetch weather for a Karnataka district via OpenWeather API"""
    # District lat/lng lookup would come from DB in production
    district_coords = {
        1: (16.1891, 75.6961),   # Bagalkot
        5: (12.9716, 77.5946),   # Bengaluru Urban
        22: (12.2958, 76.6394),  # Mysuru
    }
    coords = district_coords.get(district_id, (15.3173, 75.7139))  # Default: Karnataka center

    if not settings.OPENWEATHER_API_KEY:
        return {"error": "Weather API key not configured", "mock": True}

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.openweathermap.org/data/2.5/forecast",
            params={
                "lat": coords[0], "lon": coords[1],
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric", "cnt": 8
            }
        )
    return resp.json()


@router.get("/location")
async def get_weather_by_location(lat: float = Query(...), lng: float = Query(...)):
    if not settings.OPENWEATHER_API_KEY:
        return {"mock": True, "temp": 28, "condition": "Partly Cloudy", "humidity": 65}

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"lat": lat, "lon": lng, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"}
        )
    return resp.json()
