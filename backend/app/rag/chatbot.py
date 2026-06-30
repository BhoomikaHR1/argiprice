"""
RAG chatbot service.

- ChromaDB persistent vector store, embeddings computed locally with the default
  ONNX MiniLM model (no API key needed).
- Groq LLM generates the final answer grounded in retrieved context.
"""
from __future__ import annotations

import asyncio
from typing import Any

from loguru import logger

from app.core.config import settings
from app.rag.knowledge import build_documents

_COLLECTION_NAME = "agriprice_kb"

# Lazily-initialised singletons (imports are heavy, so defer them).
_collection = None
_groq_client = None

SYSTEM_PROMPT = (
    "You are AgriBot, the assistant inside AgriPrice — an agricultural market "
    "intelligence app for farmers in Karnataka, India. Answer the farmer's question "
    "using ONLY the context provided below. The context comes from the app's data and "
    "farmer guides. If the context does not contain the answer, say you don't have that "
    "information and suggest the relevant app section (Live Prices, Schemes, MSP, Weather, "
    "AI Prediction, APMC Markets). Keep answers short, practical, and friendly. Use simple "
    "language. Amounts are in Indian Rupees (₹). Reply in English by default; reply in "
    "Kannada ONLY if the user's message is written in Kannada."
)


def _get_collection():
    """Return the Chroma collection, creating the client on first use."""
    global _collection
    if _collection is None:
        import chromadb  # heavy import — defer until needed

        client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
        _collection = client.get_or_create_collection(
            name=_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def _get_groq():
    global _groq_client
    if _groq_client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set. Add it to the backend .env file.")
        from groq import Groq

        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client


# ─────────────────────────────────────────────────────────────────────────────
# Indexing
# ─────────────────────────────────────────────────────────────────────────────
def _reindex_sync(docs: list[dict[str, Any]]) -> int:
    """Replace the whole collection with `docs`. Runs in a worker thread."""
    import chromadb

    client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
    # Recreate the collection so deletions/edits in the source data are reflected.
    try:
        client.delete_collection(_COLLECTION_NAME)
    except Exception:
        pass
    collection = client.get_or_create_collection(
        name=_COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )

    global _collection
    _collection = collection

    if not docs:
        return 0

    # Add in batches; Chroma embeds the documents locally.
    batch = 100
    for start in range(0, len(docs), batch):
        chunk = docs[start : start + batch]
        collection.add(
            ids=[d["id"] for d in chunk],
            documents=[d["text"] for d in chunk],
            metadatas=[d["metadata"] for d in chunk],
        )
    return len(docs)


async def reindex(db) -> int:
    """Rebuild the vector store from static docs + DB. Returns document count."""
    docs = await build_documents(db)
    count = await asyncio.to_thread(_reindex_sync, docs)
    logger.info(f"RAG reindex complete: {count} documents")
    return count


async def ensure_indexed(db) -> None:
    """Build the index on startup if the collection is empty."""
    try:
        collection = await asyncio.to_thread(_get_collection)
        if await asyncio.to_thread(collection.count) == 0:
            await reindex(db)
    except Exception as exc:
        logger.warning(f"RAG initial indexing skipped: {exc}")


# ─────────────────────────────────────────────────────────────────────────────
# Retrieval + generation
# ─────────────────────────────────────────────────────────────────────────────
def _retrieve_sync(query: str, k: int) -> list[dict[str, Any]]:
    collection = _get_collection()
    if collection.count() == 0:
        return []
    res = collection.query(query_texts=[query], n_results=k)
    docs = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    return [{"text": d, "metadata": m} for d, m in zip(docs, metas)]


async def answer(question: str, history: list[dict[str, str]] | None = None) -> dict[str, Any]:
    """Retrieve context and generate a grounded answer via Groq."""
    hits = await asyncio.to_thread(_retrieve_sync, question, settings.RAG_TOP_K)

    context = "\n\n".join(f"[{i + 1}] {h['text']}" for i, h in enumerate(hits)) or "(no context found)"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in (history or [])[-6:]:
        role = turn.get("role")
        content = turn.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append(
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
    )

    client = _get_groq()
    completion = await asyncio.to_thread(
        lambda: client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=700,
        )
    )
    reply = completion.choices[0].message.content.strip()

    sources = [
        {"source": h["metadata"].get("source"), "name": h["metadata"].get("name") or h["metadata"].get("title")}
        for h in hits
    ]
    return {"answer": reply, "sources": sources}
