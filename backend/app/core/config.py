"""Application-level configuration and dependency helpers."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AstraTickets API"
    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./astratickets.db"
    vector_store_path: str = "./vector_store"

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
