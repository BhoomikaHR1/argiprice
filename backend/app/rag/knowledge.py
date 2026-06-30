"""
Knowledge ingestion for the RAG chatbot.

Builds text "documents" from two sources and loads them into ChromaDB:
  1. Static FAQ markdown files in app/rag/docs/ (split into sections).
  2. Live rows from the Postgres DB (crops, schemes, MSP, markets).

Every document gets a stable string id so re-indexing replaces (upserts) cleanly
instead of duplicating.
"""
from __future__ import annotations

import glob
import os
from typing import Any

from loguru import logger
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

DOCS_DIR = os.path.join(os.path.dirname(__file__), "docs")


# ─────────────────────────────────────────────────────────────────────────────
# Static markdown docs
# ─────────────────────────────────────────────────────────────────────────────
def _split_sections(md: str) -> list[tuple[str, str]]:
    """Split markdown into (heading, body) chunks on '## ' headings."""
    sections: list[tuple[str, str]] = []
    current_head = "Overview"
    current_lines: list[str] = []

    for line in md.splitlines():
        if line.startswith("## "):
            if current_lines:
                sections.append((current_head, "\n".join(current_lines).strip()))
            current_head = line[3:].strip()
            current_lines = []
        elif line.startswith("# "):
            current_head = line[2:].strip()
        else:
            current_lines.append(line)
    if current_lines:
        sections.append((current_head, "\n".join(current_lines).strip()))

    return [(h, b) for h, b in sections if b]


def static_documents() -> list[dict[str, Any]]:
    """Read every docs/*.md file and return chunked documents."""
    docs: list[dict[str, Any]] = []
    for path in sorted(glob.glob(os.path.join(DOCS_DIR, "*.md"))):
        slug = os.path.splitext(os.path.basename(path))[0]
        with open(path, "r", encoding="utf-8") as fh:
            content = fh.read()
        for i, (heading, body) in enumerate(_split_sections(content)):
            docs.append(
                {
                    "id": f"doc::{slug}::{i}",
                    "text": f"{heading}\n{body}",
                    "metadata": {"source": "faq", "topic": slug, "title": heading},
                }
            )
    return docs


# ─────────────────────────────────────────────────────────────────────────────
# DB-derived docs
# ─────────────────────────────────────────────────────────────────────────────
def _row_to_text(label: str, row: dict[str, Any], skip: set[str] | None = None) -> str:
    skip = skip or set()
    parts = [f"{k}: {v}" for k, v in row.items() if v not in (None, "", [], {}) and k not in skip]
    return f"{label} — " + "; ".join(parts)


async def _safe_query(db: AsyncSession, sql: str) -> list[dict[str, Any]]:
    """Run a query, returning [] (and logging) if the table/columns don't exist."""
    try:
        result = await db.execute(text(sql))
        return [dict(r) for r in result.mappings().all()]
    except Exception as exc:  # missing table / column — non-fatal
        logger.warning(f"RAG ingest skipped a source: {exc}")
        return []


async def db_documents(db: AsyncSession) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []

    # Crops
    for row in await _safe_query(db, "SELECT * FROM crops LIMIT 1000"):
        cid = row.get("id")
        name = row.get("name_en") or row.get("name_kn") or f"crop {cid}"
        docs.append(
            {
                "id": f"crop::{cid}",
                "text": _row_to_text(f"Crop '{name}'", row, skip={"image_url", "sort_order"}),
                "metadata": {"source": "crop", "name": str(name), "crop_id": cid},
            }
        )

    # Government schemes
    for row in await _safe_query(db, "SELECT * FROM government_schemes LIMIT 500"):
        sid = row.get("id")
        name = row.get("name") or row.get("name_en") or f"scheme {sid}"
        docs.append(
            {
                "id": f"scheme::{sid}",
                "text": _row_to_text(f"Government scheme '{name}'", row),
                "metadata": {"source": "scheme", "name": str(name)},
            }
        )

    # APMC markets
    for row in await _safe_query(db, "SELECT * FROM apmc_markets LIMIT 1000"):
        mid = row.get("id")
        name = row.get("name_en") or row.get("name_kn") or f"market {mid}"
        docs.append(
            {
                "id": f"market::{mid}",
                "text": _row_to_text(f"APMC market '{name}'", row, skip={"created_at"}),
                "metadata": {"source": "market", "name": str(name)},
            }
        )

    return docs


# ─────────────────────────────────────────────────────────────────────────────
# Index build
# ─────────────────────────────────────────────────────────────────────────────
async def build_documents(db: AsyncSession | None) -> list[dict[str, Any]]:
    """Collect all documents from static files and (optionally) the DB."""
    docs = static_documents()
    if db is not None:
        docs.extend(await db_documents(db))
    return docs
