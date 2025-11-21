# Repository Guidelines

## Project Structure & Module Organization
- `backend/` houses the FastAPI app (`app/`, `tests/`, `.env.example`, Dockerfile). Future modules (ORM models, routers, background workers) should live under `app/<domain>` to keep imports flat.
- `frontend/` contains the Vite + React console, organized by domain folders under `src/` (`pages`, `components`, `api`). Keep shared types close to their feature until Lesson 3 introduces a global `types/`.
- `infra/` stores Compose files and deployment manifests; `scripts/` contains executable helpers such as `bootstrap.sh`; `docs/` records architecture notes. Course briefs stay at repo root (`项目介绍.md`, `课程大纲.md`).
- Place anonymized datasets in `data/` and research spikes under `research/` to avoid cluttering delivery code.

## Build, Test, and Development Commands
- `make bootstrap` → provisions the Python venv, installs backend deps, and runs `npm install` inside `frontend/`.
- `make run-backend` / `make run-frontend` → start the FastAPI server (`uvicorn app.main:app --reload`) and the Vite dev server respectively.
- `make dev-up` → executes `docker compose up --build` from `infra/`, launching backend, frontend, and the Chroma placeholder; the frontend container runs `npm install` inside its own volume to avoid host/OS mismatches.
- Backend tests use `make test-backend` (Pytest). Add analogous `make test-frontend` once Vitest specs are introduced.
- Keep bespoke scripts (e.g., `scripts/embed_kb.py`) executable and documented in `README.md`.

## Coding Style & Naming Conventions
- Python: 4-space indentation, type hints required, lint/format with `ruff` (configured via `backend/pyproject.toml`). Module names stay `snake_case`; routers should mirror domain names (`tickets.py`, `analytics.py`).
- React/TypeScript: Prettier defaults (2 spaces, single quotes, semi: false) and ESLint config already present. Components are `PascalCase`, hooks `useCamelCase`, and files grouped by feature (`src/pages/tickets/TicketList.tsx`).
- Branch naming: `feat/<area>`, `fix/<area>`, `docs/<topic>`; append issue IDs when available (`feat/rag-ingest-42`).
- Document env vars in `docs/configuration.md` (create it when the first secret is needed). Never commit `.env`—only `.env.example`.

## Testing Guidelines
- Backend unit tests live in `backend/tests/test_*.py` (see `test_health.py` for the current pattern). Target ≥80% coverage for CRUD-heavy modules; document gaps when experimenting with AI prompts.
- Frontend specs should use Vitest + Testing Library and live next to the components they test (`src/pages/__tests__`). Playwright will power e2e flows starting Lesson 3.
- Maintain runnable smoke scripts (e.g., `scripts/check_api.py`, `scripts/check_ui.ts`) to demo stability during live sessions.
- Record coverage deltas in PRs, especially when touching shared infra or AI pipelines.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`); collect multiple lesson notes under `docs:` commits rather than mixing with code.
- PR descriptions should include: lesson context (e.g., “Lesson 2: backend CRUD”), summary of changes, testing evidence (command output), and screenshots/GIFs for UI additions.
- Link issues or syllabus milestones, and request reviews from the relevant track owner (backend/frontend/infra) before merging.

## Security & Configuration Tips
- No production credentials belong in this repo; share `.env.sample` references only.
- When demonstrating LLM providers, show how to use local runners (Ollama, LM Studio) to avoid leaking API keys on streams.
- Keep anonymization scripts handy (`scripts/redact_logs.py`) before uploading any real customer transcripts for RAG demos.
