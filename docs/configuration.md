# Configuration Reference

| Variable | Location | Description |
| --- | --- | --- |
| `APP_NAME` | `backend/.env` | Overrides the FastAPI title. |
| `ENVIRONMENT` | `backend/.env` | `development`, `staging`, or `production`; used in health probes. |
| `DATABASE_URL` | `backend/.env` | Defaults to `sqlite+aiosqlite:///./astratickets.db`; replace with MySQL/PostgreSQL for Lesson 2+. |
| `VECTOR_STORE_PATH` | `backend/.env` | Filesystem path for Chroma’s persistent store when running locally. |
| `SENTENCE_TRANSFORMERS_MODEL` | `backend/.env` | Optional. e.g. `sentence-transformers/all-MiniLM-L6-v2`. If not present or package unavailable, falls back to hashing embeddings. |
| `LLM_PROVIDER` | `backend/.env` | `openai`, `deepseek`, `qwen`, or `local`. When unset or `local`, the system uses a built-in template-based reply generator. |
| `LLM_BASE_URL` | `backend/.env` | Optional base URL for OpenAI-compatible chat completions (e.g. local proxy like Ollama with an OpenAI bridge). |
| `LLM_MODEL` | `backend/.env` | Optional model name for the OpenAI-compatible endpoint (defaults to `gpt-3.5-turbo` when using OpenAI). |
| `OPENAI_API_KEY` / `DEEPSEEK_API_KEY` / `QWEN_API_KEY` | `backend/.env` | Optional API keys for respective providers. Only one needs to be set at a time; never commit real secrets. |

Never commit real secrets—extend `.env.example` only.
