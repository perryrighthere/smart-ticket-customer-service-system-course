"""Application-level configuration and dependency helpers."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AstraTickets API"
    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./astratickets.db"
    vector_store_path: str = "./vector_store"
    sentence_transformers_model: str | None = None
    # LLM / AI configuration (Lesson 5+)
    llm_provider: str | None = None
    llm_base_url: str | None = None
    llm_model: str | None = None
    openai_api_key: str | None = None
    deepseek_api_key: str | None = None
    qwen_api_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def sync_database_url(self) -> str:
        """Return synchronous database URL for SQLAlchemy."""
        return self.database_url.replace("+aiosqlite", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()
