"""Root API router that aggregates domain routers."""
from fastapi import APIRouter

from app.api.users import router as users_router
from app.api.tickets import router as tickets_router
from app.api.kb import router as kb_router


api_router = APIRouter()
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(tickets_router, prefix="/tickets", tags=["tickets"])
api_router.include_router(kb_router, prefix="/kb", tags=["kb"])
