"""Knowledge base endpoints for Lesson 4 (local RAG).

Endpoints:
- POST /api/kb/ingest: ingest/chunk documents into Chroma collection
- POST /api/kb/search: query similar chunks
- POST /api/kb/delete: delete by ids
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
import re

from app.rag.chunk import chunk_text, chunk_text_strategy
from app.rag.store import add_documents, delete_by_ids, similarity_search, list_documents
from app.rag.utils import extract_title, derive_doc_id
from app.schemas.kb import (
    KBDeleteRequest,
    KBDeleteResponse,
    KBIngestRequest,
    KBIngestResponse,
    KBMatch,
    KBListResponse,
    KBQueryRequest,
    KBQueryResponse,
)


router = APIRouter()


_COLLECTION_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{1,510}[A-Za-z0-9]$")


def _validate_collection_name(name: str) -> None:
    if not _COLLECTION_RE.match(name):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid collection name. Use 3-512 characters from [A-Za-z0-9._-], "
                "starting and ending with an alphanumeric character."
            ),
        )


@router.post("/ingest", response_model=KBIngestResponse, status_code=status.HTTP_201_CREATED)
def ingest_kb(payload: KBIngestRequest) -> KBIngestResponse:
    _validate_collection_name(payload.collection)
    texts: list[str] = []
    metadatas: list[dict | None] = []
    ids: list[str] | None = []

    if payload.chunk:
        for doc in payload.documents:
            chunks = chunk_text_strategy(
                doc.text,
                strategy=payload.chunk_strategy,
                max_chars=payload.max_chars,
                overlap=payload.overlap,
                delimiters=payload.delimiters,
            )
            texts.extend(chunks)
            # derive title and doc_id for consistent display across chunks
            doc_meta = doc.metadata or {}
            title = doc_meta.get("title") or extract_title(doc.text) or doc_meta.get("filename") or "Untitled"
            doc_id = doc.id or doc_meta.get("doc_id") or derive_doc_id(doc.text, title)
            base_meta = {"doc_id": doc_id, "title": title}
            # include user-provided metadata
            merged = {**doc_meta, **base_meta}
            metadatas.extend([merged] * len(chunks))
        ids = None  # let store assign ids per chunk
    else:
        temp_ids: list[str] = []
        all_have_ids = True
        for doc in payload.documents:
            texts.append(doc.text)
            doc_meta = doc.metadata or {}
            title = doc_meta.get("title") or extract_title(doc.text) or doc_meta.get("filename") or "Untitled"
            base_meta = {"title": title}
            metadatas.append({**doc_meta, **base_meta})
            if doc.id:
                temp_ids.append(doc.id)
            else:
                all_have_ids = False
        ids = temp_ids if all_have_ids else None

    try:
        inserted_ids = add_documents(
            texts=texts, ids=ids, metadatas=metadatas, collection=payload.collection
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return KBIngestResponse(
        collection=payload.collection, inserted_ids=inserted_ids, chunks_added=len(texts)
    )


@router.post("/search", response_model=KBQueryResponse)
def search_kb(payload: KBQueryRequest) -> KBQueryResponse:
    _validate_collection_name(payload.collection)
    try:
        # Extend store.similarity_search to also fetch IDs by reading raw response
        # Here we call it and then re-query ids via another call; better to extend store,
        # but keep minimal changes: call underlying collection.query directly is not exposed.
        # Instead, we adjust store.similarity_search to return ids if available.
        docs, metas, dists = similarity_search(query=payload.query, n_results=payload.n_results, collection=payload.collection)
    except Exception as e:  # chroma errors
        raise HTTPException(status_code=400, detail=str(e))

    # Retrieve IDs by re-running the query: we want ids to enable deletion from UI.
    # Avoid duplication of embeddings computation by using the same function again;
    # but since store.similarity_search doesn't return ids, we reconstruct by calling chroma directly would need refactor.
    # A pragmatic path: import store.get_collection and provider to query with texts instead.
    from app.rag.store import get_collection, _get_provider  # type: ignore

    col = get_collection(payload.collection)
    qvec = _get_provider().embed_query(payload.query)
    raw = col.query(query_embeddings=[qvec], n_results=payload.n_results)
    ids_list = raw.get("ids")
    if isinstance(ids_list, list) and ids_list and isinstance(ids_list[0], list):
        ids = ids_list[0]
    else:
        ids = []

    matches = []
    for i, (t, m, d) in enumerate(zip(docs, metas, dists)):
        mid = ids[i] if i < len(ids) else None
        matches.append(
            KBMatch(
                id=mid,
                text=t,
                metadata=m,
                distance=(d if isinstance(d, (int, float)) else None),
            )
        )
    return KBQueryResponse(collection=payload.collection, query=payload.query, matches=matches)


@router.post("/delete", response_model=KBDeleteResponse)
def delete_kb(payload: KBDeleteRequest) -> KBDeleteResponse:
    _validate_collection_name(payload.collection)
    if not payload.ids:
        raise HTTPException(status_code=400, detail="ids cannot be empty")
    deleted = delete_by_ids(ids=payload.ids, collection=payload.collection)
    return KBDeleteResponse(collection=payload.collection, deleted=deleted)


@router.get("/items", response_model=KBListResponse)
def list_kb_items(collection: str, limit: int = 20, offset: int = 0) -> KBListResponse:
    _validate_collection_name(collection)
    if limit < 1 or limit > 200:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 200")
    if offset < 0:
        raise HTTPException(status_code=400, detail="offset must be >= 0")
    try:
        ids, docs, metas, total = list_documents(collection=collection, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    items = []
    for i, id_ in enumerate(ids):
        text = docs[i] if i < len(docs) else None
        meta = metas[i] if i < len(metas) else None
        items.append({"id": id_, "text": text, "metadata": meta})

    return KBListResponse(collection=collection, total=total, items=items)
