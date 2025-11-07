from __future__ import annotations

"""Pydantic schemas for Knowledge Base (Lesson 4)."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from typing import Literal


class KBDocument(BaseModel):
    id: Optional[str] = None
    text: str = Field(min_length=1)
    metadata: Optional[Dict[str, Any]] = None


class KBIngestRequest(BaseModel):
    collection: str = Field(default="kb_main", min_length=1)
    chunk: bool = True
    max_chars: int = 600
    overlap: int = 80
    chunk_strategy: Literal["window", "punctuation"] = "window"
    delimiters: str | None = None
    documents: List[KBDocument]


class KBIngestResponse(BaseModel):
    collection: str
    inserted_ids: List[str]
    chunks_added: int


class KBQueryRequest(BaseModel):
    collection: str = Field(default="kb_main", min_length=1)
    query: str = Field(min_length=1)
    n_results: int = 5


class KBMatch(BaseModel):
    id: str | None = None
    text: str
    metadata: Optional[Dict[str, Any]] = None
    distance: float | None = None


class KBQueryResponse(BaseModel):
    collection: str
    query: str
    matches: List[KBMatch]


class KBDeleteRequest(BaseModel):
    collection: str = Field(default="kb_main", min_length=1)
    ids: List[str]


class KBDeleteResponse(BaseModel):
    collection: str
    deleted: int


class KBItem(BaseModel):
    id: str
    text: str | None = None
    metadata: Dict[str, Any] | None = None


class KBListResponse(BaseModel):
    collection: str
    total: int
    items: List[KBItem]
