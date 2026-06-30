from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24       # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://agriprice:agriprice_dev_2024@localhost:5432/agriprice"
    DATABASE_URL_SYNC: str = "postgresql://agriprice:agriprice_dev_2024@localhost:5432/agriprice"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # External APIs
    OPENWEATHER_API_KEY: str = ""
    AGMARKNET_API_KEY: str = ""          # data.gov.in API key

    # RAG Chatbot
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    CHROMA_DIR: str = "./chroma_store"
    RAG_TOP_K: int = 5

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "https://agriprice-frontend.onrender.com"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse ALLOWED_ORIGINS if it's a JSON string (from docker-compose env)
        if isinstance(self.ALLOWED_ORIGINS, str):
            try:
                object.__setattr__(self, "ALLOWED_ORIGINS", json.loads(self.ALLOWED_ORIGINS))
            except Exception:
                pass


settings = Settings()
