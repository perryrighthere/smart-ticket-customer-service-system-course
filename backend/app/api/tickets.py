"""Ticket and Reply CRUD endpoints (Lesson 2)."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select, update
from sqlalchemy.orm import Session

from app.db.models import Reply, Ticket, TicketPriority, TicketStatus, User
from app.db.session import get_session
from app.schemas.ticket import ReplyCreate, ReplyRead, TicketCreate, TicketRead, TicketUpdate


router = APIRouter()


def _validate_enum(value: str | None, allowed: set[str], field: str) -> None:
    if value is not None and value not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid {field}: {value}")


@router.post("/", response_model=TicketRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreate, session: Session = Depends(get_session)) -> Ticket:
    # Validate requester exists
    requester = session.get(User, payload.requester_id)
    if requester is None:
        raise HTTPException(status_code=404, detail="Requester not found")

    _validate_enum(payload.status, {s.value for s in TicketStatus}, "status")
    _validate_enum(payload.priority, {p.value for p in TicketPriority}, "priority")

    ticket = Ticket(
        title=payload.title,
        content=payload.content,
        status=payload.status or TicketStatus.open.value,
        priority=payload.priority or TicketPriority.medium.value,
        tags=payload.tags,
        requester_id=payload.requester_id,
    )
    session.add(ticket)
    session.commit()
    session.refresh(ticket)
    return ticket


@router.get("/", response_model=list[TicketRead])
def list_tickets(
    session: Session = Depends(get_session),
    status_: str | None = Query(None, alias="status"),
    priority: str | None = None,
    requester_id: int | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> list[Ticket]:
    conditions = []
    if status_:
        _validate_enum(status_, {s.value for s in TicketStatus}, "status")
        conditions.append(Ticket.status == status_)
    if priority:
        _validate_enum(priority, {p.value for p in TicketPriority}, "priority")
        conditions.append(Ticket.priority == priority)
    if requester_id:
        conditions.append(Ticket.requester_id == requester_id)

    stmt = select(Ticket).order_by(Ticket.created_at.desc())
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    result = session.execute(stmt)
    return list(result.scalars().all())


@router.get("/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: int, session: Session = Depends(get_session)) -> Ticket:
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketRead)
def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    session: Session = Depends(get_session),
) -> Ticket:
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if payload.status:
        _validate_enum(payload.status, {s.value for s in TicketStatus}, "status")
    if payload.priority:
        _validate_enum(payload.priority, {p.value for p in TicketPriority}, "priority")

    data = payload.model_dump(exclude_unset=True)
    if data:
        data["updated_at"] = datetime.now(timezone.utc)
        session.execute(update(Ticket).where(Ticket.id == ticket_id).values(**data))
        session.commit()
    updated = session.get(Ticket, ticket_id)
    assert updated is not None
    return updated


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, session: Session = Depends(get_session)) -> None:
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    session.delete(ticket)
    session.commit()
    return None


@router.post("/{ticket_id}/replies", response_model=ReplyRead, status_code=status.HTTP_201_CREATED)
def add_reply(
    ticket_id: int,
    payload: ReplyCreate,
    session: Session = Depends(get_session),
) -> Reply:
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    author = session.get(User, payload.author_id)
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")

    reply = Reply(ticket_id=ticket_id, author_id=payload.author_id, content=payload.content)
    session.add(reply)
    session.commit()
    session.refresh(reply)
    return reply


@router.get("/{ticket_id}/replies", response_model=list[ReplyRead])
def list_replies(ticket_id: int, session: Session = Depends(get_session)) -> list[Reply]:
    ticket = session.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    result = session.execute(select(Reply).where(Reply.ticket_id == ticket_id).order_by(Reply.id))
    return list(result.scalars().all())
