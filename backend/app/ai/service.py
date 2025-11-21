from __future__ import annotations

"""High-level AI helpers for tickets (Lesson 5)."""

from dataclasses import dataclass
from typing import List, Optional

from app.ai.classifier import TicketClassificationResult, get_ticket_classifier
from app.ai.llm import LLMConfigOverride, generate_reply
from app.db.models import Ticket, TicketPriority
from app.rag.store import similarity_search


@dataclass
class TicketAISuggestion:
    ticket_id: int
    category: str
    confidence: float
    suggested_priority: str
    suggested_tags: List[str]
    ai_reply: str
    kb_snippets: List[str]


def _map_category_to_priority_and_tags(category: str) -> tuple[str, list[str]]:
    mapping = {
        "password_reset": (TicketPriority.medium.value, ["password", "auth"]),
        "login_issue": (TicketPriority.high.value, ["login", "auth"]),
        "account_security": (TicketPriority.urgent.value, ["security", "account"]),
        "billing": (TicketPriority.medium.value, ["billing", "payment"]),
        "general": (TicketPriority.low.value, ["general"]),
    }
    return mapping.get(category, (TicketPriority.low.value, ["general"]))


def generate_ticket_suggestion(
    ticket: Ticket,
    collection: str = "kb_main",
    n_results: int = 3,
    llm_override: Optional[LLMConfigOverride] = None,
) -> TicketAISuggestion:
    """Generate category, priority/tags suggestion and AI draft reply for a ticket."""
    classifier = get_ticket_classifier()
    text = f"{ticket.title}\n\n{ticket.content}"
    cls_result: TicketClassificationResult = classifier.predict(text)

    try:
        docs, _metas, _dists = similarity_search(text, n_results=n_results, collection=collection)
        kb_snippets: list[str] = [d for d in docs if d]
    except Exception:
        kb_snippets = []

    # Collect conversation history
    history: List[tuple[str, str]] = []
    
    # Add legacy replies
    for reply in ticket.replies:
        # Assuming author_id 1 is admin/agent, others are users? 
        # Or just use "User" for all legacy replies if we can't distinguish easily without user lookup
        # But TicketMessage has explicit sender_type.
        # For simplicity, let's just use "Reply" or try to infer.
        # Actually, let's focus on the new TicketMessage system which is the "Dialogue Context" feature.
        pass

    # Add new messages
    # Sort by created_at
    sorted_messages = sorted(ticket.messages, key=lambda m: m.created_at)
    for msg in sorted_messages:
        sender_label = "Agent" if msg.sender_type == "agent" else "User"
        history.append((sender_label, msg.content))

    suggested_priority, suggested_tags = _map_category_to_priority_and_tags(cls_result.category)
    reply_text = generate_reply(
        ticket, 
        cls_result.category, 
        kb_snippets, 
        override=llm_override,
        history=history
    )

    return TicketAISuggestion(
        ticket_id=ticket.id,
        category=cls_result.category,
        confidence=cls_result.confidence,
        suggested_priority=suggested_priority,
        suggested_tags=suggested_tags,
        ai_reply=reply_text,
        kb_snippets=kb_snippets,
    )
