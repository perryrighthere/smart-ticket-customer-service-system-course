# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AstraTickets is an enterprise-grade AI-powered customer service ticketing system implementing the full workflow: "ticket intake → classification → retrieval → AI first response → human collaboration → analytics dashboard". The project uses a decoupled architecture with FastAPI backend, React frontend, and RAG (Retrieval-Augmented Generation) capabilities via Chroma vector database.

## Architecture

### Backend Structure (FastAPI)
- **Entry point**: `backend/app/main.py` - Uses modern `lifespan` context manager for startup/shutdown
- **Configuration**: `backend/app/core/config.py` - Pydantic Settings with `.env` support, provides `sync_database_url` property
- **Database**:
  - Models: `backend/app/db/models.py` - SQLAlchemy ORM with User, Ticket, Reply entities
  - Session: `backend/app/db/session.py` - Synchronous session management with `get_session()` dependency
  - Uses SQLite for development (can switch to PostgreSQL/MySQL via DATABASE_URL)
- **API Routes**: 
  - Organized by domain under `backend/app/api/`
  - Root router at `backend/app/api/router.py` aggregates all domain routers
  - Mounted under `/api` prefix in main.py
  - Current domains: `users.py`, `tickets.py` (replies nested under tickets)
- **Schemas**: `backend/app/schemas/` - Pydantic models with Base/Create/Update/Read pattern

### Frontend Structure (React + Vite)
- **Entry**: `frontend/src/main.tsx` → `frontend/src/App.tsx`
- **Layout**: `frontend/src/components/AppLayout.tsx` - AntD-based layout
- **Pages**: `frontend/src/pages/` - Route components (currently showing lesson milestones)
- **API Client**: `frontend/src/api/client.ts` - Axios instance with `/api` proxy configured in `vite.config.ts`

### Data Models & Relationships
```
User 1:N Ticket (as requester)
User 1:N Reply (as author)
Ticket 1:N Reply (cascade delete)
```

**Ticket States**: open → in_progress → resolved → closed  
**Priority Levels**: low, medium, high, urgent

### Key Technical Decisions
1. **Time Handling**: Use `datetime.now(timezone.utc)` (not deprecated `utcnow()`)
2. **Pydantic v2**: Use `model_config = ConfigDict(from_attributes=True)` pattern
3. **FastAPI Lifecycle**: Use `@asynccontextmanager` lifespan, not `@app.on_event()`
4. **Database**: `onupdate=utcnow` for automatic timestamp updates on Ticket model
5. **Cascade Deletes**: Deleting a ticket automatically removes all replies

## Development Commands

### Environment Setup
```bash
make bootstrap              # Create venv, install backend + frontend deps
cd backend && cp .env.example .env  # Configure environment
```

### Running Services
```bash
# Local development (recommended)
make run-backend           # Start FastAPI on :8000
make run-frontend          # Start Vite dev server on :5173

# Docker (all services including Chroma)
make dev-up               # docker compose up --build from infra/
```

### Testing
```bash
make test-backend         # Run pytest (backend/tests/)
cd backend && pytest tests/test_tickets_crud.py -v  # Single test file
cd backend && pytest tests/test_tickets_crud.py::test_ticket_crud_flow  # Single test
```

### Code Quality
```bash
cd backend && ruff check .   # Lint (configured in pyproject.toml)
cd backend && ruff format .  # Format
```

## Adding New Features

### New API Endpoint Pattern
1. Define Pydantic schemas in `backend/app/schemas/<domain>.py` (Base/Create/Update/Read)
2. Add router in `backend/app/api/<domain>.py` using dependency injection:
   ```python
   @router.post("/", response_model=DomainRead)
   def create_domain(payload: DomainCreate, session: Session = Depends(get_session)):
       ...
   ```
3. Register router in `backend/app/api/router.py`:
   ```python
   api_router.include_router(domain_router, prefix="/domain", tags=["domain"])
   ```
4. Test in `backend/tests/test_<domain>.py` using `TestClient`

### Database Model Changes
1. Update SQLAlchemy model in `backend/app/db/models.py`
2. Since no migrations yet (Lesson 2 prototype), tables recreate on startup via `init_models()`
3. Add corresponding Pydantic schemas
4. For production: Will add Alembic migrations in later lessons

### Frontend Page Addition
1. Create component in `frontend/src/pages/<feature>/`
2. Add route in `frontend/src/main.tsx` (React Router)
3. Update navigation in `frontend/src/components/AppLayout.tsx`
4. API calls go through `frontend/src/api/client.ts`

## Configuration

Environment variables (backend/.env):
- `DATABASE_URL`: SQLite default, supports PostgreSQL/MySQL
- `VECTOR_STORE_PATH`: Chroma data location (used from Lesson 4+)
- Future: `OPENAI_API_KEY`, `LLM_PROVIDER` for AI features

## Current State & Roadmap

**Completed (Lesson 1-2)**:
- FastAPI backend with User/Ticket/Reply CRUD
- Database models with proper relationships
- RESTful API with filtering, pagination
- Nested routes (ticket replies)
- Frontend scaffold with AntD layout
- Docker Compose setup with Chroma placeholder

**Upcoming**:
- Lesson 3: Frontend ticket management UI
- Lesson 4: RAG knowledge base with SentenceTransformers + Chroma
- Lesson 5: AI classification and response generation
- Lesson 6: Context-aware conversations, human-in-the-loop
- Lesson 7: Analytics dashboard, JWT auth
- Lesson 8: Production deployment

## Code Style

### Python (Backend)
- Type hints required for all functions
- Use `from __future__ import annotations` for forward references
- SQLAlchemy: Use modern `Mapped[]` annotations
- FastAPI: Explicit response models and status codes
- Line length: 100 chars (ruff config)

### React/TypeScript (Frontend)
- Functional components with hooks
- TypeScript strict mode
- AntD components for UI consistency
- API types mirror backend Pydantic schemas

## Testing Notes

- Backend tests use `fastapi.testclient.TestClient`
- Test database uses same SQLite, tables recreated per test session
- Current coverage: User CRUD, Ticket CRUD with filters, Reply nested operations, cascade deletes
- Helper pattern: `create_user_helper()` in tests for test data setup

## Documentation

- Technical docs: README.md (no course content)
- Course materials: docs/lesson-N.md (teaching content, assignments)
- Architecture notes: docs/architecture.md, docs/configuration.md
- Collaboration rules: AGENTS.md (project structure, commit guidelines)
