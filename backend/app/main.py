"""Entry point for the AstraTickets FastAPI service."""
from fastapi import FastAPI

from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name)


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Lightweight probe for Lesson 1 demos."""
    return {"status": "ok", "environment": settings.environment}
