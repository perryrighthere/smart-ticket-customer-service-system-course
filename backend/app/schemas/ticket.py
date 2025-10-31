"""Pydantic schemas for Ticket/Reply (Lesson 2)."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


TicketStatus = Literal["open", "in_progress", "resolved", "closed"]
TicketPriority = Literal["low", "medium", "high", "urgent"]


class TicketBase(BaseModel):
    title: str
    content: str
    status: TicketStatus | None = "open"
    priority: TicketPriority | None = "medium"
    tags: str | None = None  # comma-separated for Lesson 2


class TicketCreate(TicketBase):
    requester_id: int


class TicketUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    tags: str | None = None


class TicketRead(TicketBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    requester_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ReplyBase(BaseModel):
    content: str


class ReplyCreate(ReplyBase):
    author_id: int


class ReplyRead(ReplyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: int
    author_id: int
    created_at: datetime | None = None

