# Lesson 1 · Architecture Notes

## High-Level Flow
1. **Client (React)** connects to `/api` via Vite dev proxy and renders the Ant Design console.
2. **FastAPI backend** exposes health and future ticket endpoints, persisting to SQLite for local dev.
3. **Chroma vector store** (Docker) will store embeddings for knowledge base search in later lessons.
4. **LLM providers** are abstracted behind env vars so we can switch between OpenAI, DeepSeek, or local models.

## Module Map
- `backend/app` → FastAPI application, configuration, routers.
- `frontend/src` → React pages and components (Home, Layout, future Ticket views).
- `infra/docker-compose.yml` → Spins up backend, frontend, and Chroma for demos.
- `scripts/bootstrap.sh` → Reproducible environment setup showcased in Lesson 1.
