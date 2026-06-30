from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.rag import chatbot as rag

router = APIRouter()


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[ChatTurn] = Field(default_factory=list)


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not settings.GROQ_API_KEY:
        raise HTTPException(503, "Chatbot not configured: GROQ_API_KEY is missing.")
    try:
        result = await rag.answer(
            req.message, history=[t.model_dump() for t in req.history]
        )
        return result
    except Exception as exc:
        raise HTTPException(500, f"Chatbot error: {exc}")


@router.post("/reindex")
async def reindex(db: AsyncSession = Depends(get_db)):
    """Rebuild the knowledge base from static docs + live DB data."""
    count = await rag.reindex(db)
    return {"status": "ok", "documents_indexed": count}
