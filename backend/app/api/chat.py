from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.db.session import get_session
from app.db.models import ChatSession, ChatMessage, User
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatMessageResponse,
    ChatRequest,
)
from app.ai.llm import LLMConfigOverride, generate_chat_answer
from app.rag.store import similarity_search

router = APIRouter()

@router.get("/sessions", response_model=List[ChatSessionResponse])
def list_sessions(
    user_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """List chat sessions. Optionally filter by user_id."""
    query = select(ChatSession).order_by(desc(ChatSession.updated_at))
    if user_id:
        query = query.where(ChatSession.user_id == user_id)
    
    sessions = session.scalars(query).all()
    return sessions

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(
    payload: ChatSessionCreate,
    user_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """Create a new chat session."""
    chat_session = ChatSession(
        title=payload.title,
        user_id=user_id
    )
    session.add(chat_session)
    session.commit()
    session.refresh(chat_session)
    return chat_session

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session_details(
    session_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific chat session."""
    chat_session = session.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return chat_session

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    session: Session = Depends(get_session)
):
    """Delete a chat session."""
    chat_session = session.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.delete(chat_session)
    session.commit()
    return {"ok": True}

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
def send_message(
    session_id: int,
    payload: ChatRequest,
    session: Session = Depends(get_session)
):
    """Send a message to a session and get AI response."""
    chat_session = session.get(ChatSession, session_id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Save User Message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=payload.query
    )
    session.add(user_msg)
    session.commit() # Commit to save user message first

    # 2. Prepare Context (History + RAG)
    # Fetch recent history
    history_msgs = session.scalars(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    ).all()
    
    # Convert to format expected by LLM
    history_pairs = [(m.role, m.content) for m in history_msgs[:-1]] # Exclude the one we just added? 
    # Actually generate_chat_answer expects history BEFORE the current query.
    # But we just added the query as a message.
    # So history_pairs should be everything EXCEPT the last one.
    
    # RAG Search
    kb_snippets = []
    try:
        _ids, docs, _metas, _dists = similarity_search(
            payload.query,
            n_results=payload.n_results,
            collection=payload.collection,
            distance_threshold=payload.distance_threshold,
        )
        kb_snippets = [d for d in docs if d]
    except Exception:
        pass # Ignore RAG errors

    # 3. Generate AI Response
    override = LLMConfigOverride(
        provider=payload.provider,
        base_url=payload.base_url,
        model=payload.model,
        api_key=payload.api_key,
    )
    
    try:
        answer = generate_chat_answer(
            payload.query,
            kb_snippets,
            history_pairs,
            override=override
        )
    except Exception as exc:
        # If AI fails, we still saved the user message. 
        # Should we save an error message as assistant? Or just error out?
        # Let's error out for now so frontend knows.
        raise HTTPException(status_code=502, detail=str(exc))

    # 4. Save Assistant Message
    ai_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=answer
    )
    session.add(ai_msg)
    
    # Update session timestamp - use utcnow() since ai_msg.created_at is None before commit
    from app.db.models import utcnow
    chat_session.updated_at = utcnow()
    
    session.commit()
    session.refresh(ai_msg)
    
    return ai_msg
