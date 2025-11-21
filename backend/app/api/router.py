"""Root API router that aggregates domain routers."""
from fastapi import APIRouter

from app.api.tickets import router as tickets_router
from app.api.users import router as users_router
from app.api.kb import router as kb_router
from app.api.ai import router as ai_router
from app.api.messages import router as messages_router
from app.api.chat import router as chat_router

api_router = APIRouter()

api_router.include_router(tickets_router, prefix="/tickets", tags=["tickets"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(kb_router, prefix="/kb", tags=["knowledge-base"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(messages_router, prefix="/tickets", tags=["messages"])
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
