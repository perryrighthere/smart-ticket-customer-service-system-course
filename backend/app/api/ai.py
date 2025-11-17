from __future__ import annotations

"""AI endpoints for Lesson 5.

Currently provides:
- POST /api/ai/tickets/{ticket_id}/suggest  → classify + draft reply
- POST /api/ai/chat                         → RAG-augmented chat
"""

from typing import List, Tuple

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.service import generate_ticket_suggestion
from app.ai.llm import LLMConfigOverride, generate_chat_answer
from app.db.models import Ticket
from app.db.session import get_session
from app.rag.store import similarity_search
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    TicketAISuggestionRequest,
    TicketAISuggestionResponse,
)


router = APIRouter()


@router.post(
    "/tickets/{ticket_id}/suggest",
    response_model=TicketAISuggestionResponse,
    status_code=status.HTTP_200_OK,
)
def suggest_for_ticket(
    ticket_id: int,
    payload: TicketAISuggestionRequest,
    session: Session = Depends(get_session),
) -> TicketAISuggestionResponse:
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    override = LLMConfigOverride(
        provider=payload.provider,
        base_url=payload.base_url,
        model=payload.model,
        api_key=payload.api_key,
    )
    try:
        suggestion = generate_ticket_suggestion(
            ticket=ticket,
            collection=payload.collection,
            n_results=payload.n_results,
            llm_override=override,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    return TicketAISuggestionResponse(
        ticket_id=suggestion.ticket_id,
        category=suggestion.category,
        confidence=suggestion.confidence,
        suggested_priority=suggestion.suggested_priority,
        suggested_tags=suggestion.suggested_tags,
        ai_reply=suggestion.ai_reply,
        kb_snippets=suggestion.kb_snippets,
    )


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
def chat_with_kb(payload: ChatRequest) -> ChatResponse:
    """RAG-augmented chat endpoint using the shared knowledge base."""
    try:
        _ids, docs, metas, _dists = similarity_search(
            payload.query,
            n_results=payload.n_results,
            collection=payload.collection,
            distance_threshold=payload.distance_threshold,
        )
        kb_snippets: List[str] = [d for d in docs if d]

        # Extract unique source titles from metadata
        source_titles = []
        seen_titles = set()
        if metas:
            for m in metas:
                if m:  # Check if metadata item is not None
                    title = m.get("title")
                    if title and title not in seen_titles:
                        source_titles.append(title)
                        seen_titles.add(title)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Knowledge base search failed: {exc}",
        ) from exc

    history_pairs: List[Tuple[str, str]] = [(m.role, m.content) for m in payload.history]
    override = LLMConfigOverride(
        provider=payload.provider,
        base_url=payload.base_url,
        model=payload.model,
        api_key=payload.api_key,
    )
    try:
        answer = generate_chat_answer(payload.query, kb_snippets, history_pairs, override=override)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return ChatResponse(
        query=payload.query,
        answer=answer,
        kb_sources=source_titles,
        kb_snippets=kb_snippets,
    )
