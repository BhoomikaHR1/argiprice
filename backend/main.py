"""
AgriPrice — FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base

# FIX: Import ALL models here so Base.metadata knows about every table
# before create_all runs. Without this District & Crop tables are missing.
from app.models.user import User, District, UserSavedCrop, UserNotification, JointCommunityEntry  # noqa: F401
from app.models.crop import Crop
from app.routers import auth, crops, prices, markets, predictions, weather, schemes, users, chatbot
from app.core.database import AsyncSessionLocal
from app.rag import chatbot as rag_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create all tables (District is now included)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Build the RAG knowledge base if it's empty (non-fatal if it fails)
    async with AsyncSessionLocal() as session:
        await rag_service.ensure_indexed(session)
    yield
    await engine.dispose()


app = FastAPI(
    title="AgriPrice API",
    description="AI-powered agricultural market intelligence for Karnataka farmers",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",        tags=["auth"])
app.include_router(crops.router,       prefix="/api/crops",       tags=["crops"])
app.include_router(prices.router,      prefix="/api/prices",      tags=["prices"])
app.include_router(markets.router,     prefix="/api/markets",     tags=["markets"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])
app.include_router(weather.router,     prefix="/api/weather",     tags=["weather"])
app.include_router(schemes.router,     prefix="/api/schemes",     tags=["schemes"])
app.include_router(users.router,       prefix="/api/users",       tags=["users"])
app.include_router(chatbot.router,     prefix="/api/chatbot",     tags=["chatbot"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "AgriPrice API", "version": "1.0.0"}


@app.get("/")
async def root():
    return {"message": "AgriPrice API — Karnataka Crop Price Intelligence"}
