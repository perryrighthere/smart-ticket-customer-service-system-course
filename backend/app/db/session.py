"""Synchronous SQLAlchemy engine and session management (Lesson 2).

Using a sync engine avoids extra runtime dependencies in restricted envs.
"""
from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


_engine = None
SessionLocal: sessionmaker[Session] | None = None
_initialized = False


def _get_engine():
    global _engine, SessionLocal
    if _engine is None:
        settings = get_settings()
        _engine = create_engine(settings.sync_database_url, echo=False, future=True)
        SessionLocal = sessionmaker(bind=_engine, expire_on_commit=False)
    return _engine


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency to provide a request-scoped sync session."""
    global SessionLocal, _initialized
    if SessionLocal is None:
        _get_engine()
    assert SessionLocal is not None
    if not _initialized:
        init_models()
        _initialized = True
    with SessionLocal() as session:  # type: ignore[call-arg]
        yield session


def init_models() -> None:
    """Create all tables for Lesson 2 prototypes (no migrations)."""
    engine = _get_engine()
    from app.db import models  # noqa: F401  ensures model metadata is registered

    Base.metadata.create_all(bind=engine)
