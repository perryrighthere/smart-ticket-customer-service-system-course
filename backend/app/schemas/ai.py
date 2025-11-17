from __future__ import annotations

"""Pydantic schemas for AI-related APIs (Lesson 5)."""

from typing import List, Literal

from pydantic import BaseModel, Field


class TicketAISuggestionRequest(BaseModel):
    """Request body for generating a ticket AI suggestion."""

    collection: str = Field(default="kb_main", description="Knowledge base collection name")
    n_results: int = Field(default=3, ge=1, le=10, description="Number of KB snippets to retrieve")
    # Optional per-request LLM overrides (frontend demo only)
    provider: str | None = Field(
        default=None,
        description="Optional LLM provider override, e.g. openai/deepseek/qwen/local.",
    )
    base_url: str | None = Field(
        default=None,
        description="Optional OpenAI-compatible base URL override.",
    )
    model: str | None = Field(
        default=None,
        description="Optional model name override for the provider.",
    )
    api_key: str | None = Field(
        default=None,
        description="Optional API key override (demo only; prefer backend env vars in production).",
    )


class TicketAISuggestionResponse(BaseModel):
    """AI suggestion for a given ticket."""

    ticket_id: int
    category: str
    confidence: float
    suggested_priority: str
    suggested_tags: List[str]
    ai_reply: str
    kb_snippets: List[str]


class ChatMessage(BaseModel):
    """Single message in an AI chat history."""

    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """Chat request that combines a query with RAG and optional history."""

    query: str
    collection: str = Field(default="kb_main", description="Knowledge base collection name")
    n_results: int = Field(default=4, ge=1, le=10, description="Number of KB snippets to retrieve")
    distance_threshold: float | None = Field(
        default=None,
        ge=0.0,
        le=2.0,
        description="Optional distance threshold for similarity search. Lower is more similar.",
    )
    history: List[ChatMessage] = Field(default_factory=list)
    # Optional per-request LLM overrides (frontend demo only)
    provider: str | None = Field(
        default=None,
        description="Optional LLM provider override, e.g. openai/deepseek/qwen/local.",
    )
    base_url: str | None = Field(
        default=None,
        description="Optional OpenAI-compatible base URL override.",
    )
    model: str | None = Field(
        default=None,
        description="Optional model name override for the provider.",
    )
    api_key: str | None = Field(
        default=None,
        description="Optional API key override (demo only; prefer backend env vars in production).",
    )


class ChatResponse(BaseModel):
    """Chat response containing the final answer and supporting snippets."""

    query: str
    answer: str
    kb_sources: List[str]
    kb_snippets: List[str]

