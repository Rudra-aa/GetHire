"""
app/core/config.py
------------------
Centralised application configuration using Pydantic Settings.

All configuration is read from environment variables (or a .env file in
development).  Pydantic validates and coerces every value at startup, so the
app will fail fast with a clear error rather than silently using a bad value.

Usage:
    from app.core.config import settings
    print(settings.APP_NAME)
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any, List

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    GetHire application settings.

    Environment variable names are case-insensitive.
    A .env file in the working directory is loaded automatically in development.
    """

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # silently discard unknown env vars
    )

    # ── Application ────────────────────────────────────────────────────────
    APP_NAME: str = Field(default="GetHire", description="Human-readable application name")
    APP_VERSION: str = Field(default="1.0.0", description="Semantic version string")
    ENVIRONMENT: str = Field(
        default="development",
        description="Runtime environment: development | staging | production",
    )
    DEBUG: bool = Field(default=False, description="Enable debug mode (never True in production)")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level: DEBUG | INFO | WARNING | ERROR")

    # ── Security ───────────────────────────────────────────────────────────
    # SECRET_KEY is not required in Sprint 0 (no auth yet), but the field is
    # declared here so it is validated when authentication is added.
    SECRET_KEY: str = Field(
        default="change-me-in-production-minimum-32-chars-random",
        description="JWT signing secret — must be random and ≥32 chars in production",
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["*", "localhost", "127.0.0.1", "*.onrender.com", "*.render.com"],
        description="Trusted host allowlist (used by TrustedHostMiddleware in production)",
    )

    # ── CORS ───────────────────────────────────────────────────────────────
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000", "https://*.vercel.app"],
        description="Allowed CORS origins for the frontend",
    )

    # ── MongoDB ────────────────────────────────────────────────────────────
    MONGODB_URI: str = Field(
        default="mongodb://localhost:27017",
        description="MongoDB connection URI (Atlas or local)",
    )
    MONGODB_DB_NAME: str = Field(
        default="gethire",
        description="MongoDB database name",
    )
    MONGODB_MAX_POOL_SIZE: int = Field(
        default=20,
        description="Maximum MongoDB connection pool size",
    )
    MONGODB_MIN_POOL_SIZE: int = Field(
        default=5,
        description="Minimum MongoDB connection pool size",
    )

    # ── Redis ──────────────────────────────────────────────────────────────
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL",
    )
    REDIS_MAX_CONNECTIONS: int = Field(
        default=20,
        description="Maximum Redis connection pool size",
    )

    # ── AI Providers ───────────────────────────────────────────────────────
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini API Key for AI Interview Engine",
    )
    
    # ── Ollama (prepared, not implemented in Sprint 0) ─────────────────────
    OLLAMA_BASE_URL: str = Field(
        default="http://ollama:11434",
        description="Base URL of the Ollama AI runtime",
    )
    PRIMARY_MODEL: str = Field(
        default="qwen2.5:7b",
        description="Primary LLM model name",
    )
    FALLBACK_MODEL: str = Field(
        default="llama3.2:3b",
        description="Fallback LLM model name",
    )

    # ── File Upload ────────────────────────────────────────────────────────
    UPLOAD_DIR: str = Field(
        default="/tmp/gethire/uploads",
        description="Directory where uploaded files are stored",
    )
    MAX_UPLOAD_SIZE_MB: int = Field(
        default=5,
        description="Maximum file upload size in megabytes",
    )

    # ── Feature Flags ──────────────────────────────────────────────────────
    FEATURE_FACESENSE_ENABLED: bool = Field(default=True)
    FEATURE_VOICESENSE_ENABLED: bool = Field(default=True)

    # ── Validators ─────────────────────────────────────────────────────────

    @field_validator("ENVIRONMENT")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v.lower() not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of: {', '.join(allowed)}")
        return v.lower()

    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        v_upper = v.upper()
        if v_upper not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of: {', '.join(allowed)}")
        return v_upper

    @field_validator("ALLOWED_HOSTS", "CORS_ORIGINS", mode="before")
    @classmethod
    def parse_list_fields(cls, v: Any) -> Any:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    # ── Computed properties ────────────────────────────────────────────────

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return a cached Settings instance.

    Using lru_cache ensures settings are loaded from the environment exactly
    once, which is correct for production and makes tests faster.

    In tests, call get_settings.cache_clear() before patching env vars.
    """
    return Settings()


# Module-level singleton — the rest of the codebase imports this directly.
settings: Settings = get_settings()
