"""Application-level configuration and dependency helpers."""
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AstraTickets API"
    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./astratickets.db"
    vector_store_path: str = "./vector_store"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
