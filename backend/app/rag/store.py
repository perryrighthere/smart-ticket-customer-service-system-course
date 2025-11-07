from __future__ import annotations

"""Chroma persistent store helpers for Lesson 4."""

from typing import Any, Dict, List, Optional, Tuple

import chromadb
from chromadb import Settings as ChromaSettings
from chromadb.api.models.Collection import Collection

from app.core.config import get_settings
from app.rag.embeddings import (
    EmbeddingProvider,
    SentenceTransformerEmbedding,
    get_default_provider,
)


_client: chromadb.PersistentClient | None = None
_provider: EmbeddingProvider | None = None


def _get_client() -> chromadb.PersistentClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = chromadb.PersistentClient(
            path=settings.vector_store_path,
            settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
        )
    return _client


def _get_provider() -> EmbeddingProvider:
    global _provider
    if _provider is None:
        settings = get_settings()
        # If user specifies a ST model and package is available, use it
        if settings.sentence_transformers_model:
            try:
                _provider = SentenceTransformerEmbedding(model_name=settings.sentence_transformers_model)
            except Exception:
                _provider = get_default_provider()
        else:
            _provider = get_default_provider()
    return _provider


def get_collection(name: str = "kb_main") -> Collection:
    client = _get_client()
    # We embed outside and pass embeddings explicitly, so no server-side embedding fn is needed.
    col = client.get_or_create_collection(name=name)
    return col


def add_documents(
    texts: List[str],
    ids: Optional[List[str]] = None,
    metadatas: Optional[List[Dict[str, Any]]] = None,
    collection: str = "kb_main",
) -> List[str]:
    col = get_collection(collection)
    provider = _get_provider()
    embeddings = provider.embed_documents(texts)
    # Ensure IDs are present
    if ids is None:
        base = col.count() or 0
        ids = [f"doc_{base + i}" for i in range(len(texts))]
    # Normalize metadata: if provided but union of keys is empty, omit metadatas
    metas_to_send: Optional[List[Dict[str, Any]]] = None
    if metadatas is not None:
        norm = [(m or {}) for m in metadatas]
        union_keys = set()
        for m in norm:
            union_keys.update(m.keys())
        if union_keys:
            metas_to_send = norm
        else:
            metas_to_send = None
    col.add(documents=texts, embeddings=embeddings, ids=ids, metadatas=metas_to_send)
    return ids


def similarity_search(
    query: str, n_results: int = 5, collection: str = "kb_main"
) -> Tuple[List[str], List[Dict[str, Any] | None], List[float]]:
    col = get_collection(collection)
    provider = _get_provider()
    qvec = provider.embed_query(query)
    res = col.query(
        query_embeddings=[qvec],
        n_results=n_results,
        include=["documents", "metadatas", "distances"],
    )

    def _extract_first(key: str) -> list:
        v = res.get(key)
        if isinstance(v, list) and v and isinstance(v[0], list):
            return v[0]
        return []

    docs = _extract_first("documents")
    metas = _extract_first("metadatas")
    dists = _extract_first("distances")
    # Ensure lengths align; pad distances with None-equivalent floats (0.0) if needed
    if len(dists) < len(docs):
        dists = dists + [0.0] * (len(docs) - len(dists))
    return docs, metas, dists


def delete_by_ids(ids: List[str], collection: str = "kb_main") -> int:
    col = get_collection(collection)
    before = col.count() or 0
    col.delete(ids=ids)
    after = col.count() or 0
    return max(0, before - after)


def list_documents(
    collection: str = "kb_main", limit: int = 20, offset: int = 0
) -> Tuple[List[str], List[str | None], List[Dict[str, Any] | None], int]:
    """Return (ids, documents, metadatas, total_count) for the collection.

    Uses Chroma's Collection.get with pagination.
    """
    col = get_collection(collection)
    total = col.count() or 0
    res = col.get(limit=limit, offset=offset, include=["documents", "metadatas"])
    ids = res.get("ids", []) or []
    docs = res.get("documents", []) or []
    metas = res.get("metadatas", []) or []
    return ids, docs, metas, int(total)
