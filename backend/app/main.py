"""Entry point for the AstraTickets FastAPI service.

Lesson 2: mounts domain routers and prepares the database.
"""
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from app.core.config import get_settings
from app.api.router import api_router
from app.db.session import init_models

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Create tables for Lesson 2 prototypes (no migrations yet)
    init_models()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(title=settings.app_name, lifespan=lifespan)


@app.get("/health", tags=["system"])
async def health_check() -> dict[str, str]:
    """Lightweight probe for Lesson 1 demos."""
    return {"status": "ok", "environment": settings.environment}


# Mount API routers under /api
app.include_router(api_router, prefix="/api")
