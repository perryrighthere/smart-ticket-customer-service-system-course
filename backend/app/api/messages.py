from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Ticket, TicketMessage, User
from app.db.session import get_session
from app.schemas.messages import MessageCreate, MessageResponse

router = APIRouter()


@router.get("/{ticket_id}/messages", response_model=list[MessageResponse])
def list_messages(ticket_id: int, session: Session = Depends(get_session)) -> list[TicketMessage]:
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    stmt = select(TicketMessage).where(TicketMessage.ticket_id == ticket_id).order_by(TicketMessage.created_at)
    result = session.execute(stmt)
    return list(result.scalars().all())


@router.post("/{ticket_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    ticket_id: int, 
    payload: MessageCreate, 
    sender_id: int, # In a real app, this would come from the token
    sender_type: str = "agent", # or "user"
    session: Session = Depends(get_session)
) -> TicketMessage:
    ticket = session.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    sender = session.get(User, sender_id)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")

    message = TicketMessage(
        ticket_id=ticket_id,
        sender_id=sender_id,
        sender_type=sender_type,
        content=payload.content
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message
