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
from pathlib import Path
from typing import Any, List, Optional, Union

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
    ALLOWED_HOSTS: Union[List[str], str] = Field(
        default=["*", "localhost", "127.0.0.1", "*.onrender.com", "*.render.com"],
        description="Trusted host allowlist (used by TrustedHostMiddleware in production)",
    )

    # ── CORS & Public Endpoints ───────────────────────────────────────────
    CORS_ORIGINS: Union[List[str], str] = Field(
        default=["http://localhost:5173", "http://localhost:3000", "https://*.vercel.app"],
        description="Allowed CORS origins for the frontend",
    )
    PUBLIC_APP_URL: Optional[str] = Field(
        default=None,
        description="Canonical production frontend URL for public recruiter links (e.g. https://gethire.app). If None or localhost, public sharing is marked as not configured.",
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
        default=str(Path(__file__).resolve().parents[2] / "uploads"),
        description="Directory where uploaded files are stored",
    )
    MAX_UPLOAD_SIZE_MB: int = Field(
        default=10,
        description="Maximum file upload size in megabytes",
    )
    ALLOWED_UPLOAD_EXTENSIONS: list[str] = Field(
        default=[".pdf"],
        description="Allowed file extensions for upload",
    )
    ALLOWED_UPLOAD_MIME_TYPES: list[str] = Field(
        default=["application/pdf", "application/x-pdf"],
        description="Allowed MIME types for upload",
    )

    # ── Rate Limiting ──────────────────────────────────────────────────────
    RATE_LIMIT_ENABLED: bool = Field(
        default=True,
        description="Master switch to enable or disable API rate limiting",
    )
    RATE_LIMIT_LOGIN_LIMIT: int = Field(
        default=10,
        description="Max login requests per window",
    )
    RATE_LIMIT_LOGIN_WINDOW: int = Field(
        default=60,
        description="Login rate limit window in seconds",
    )
    RATE_LIMIT_REGISTER_LIMIT: int = Field(
        default=5,
        description="Max registration requests per window",
    )
    RATE_LIMIT_REGISTER_WINDOW: int = Field(
        default=3600,
        description="Registration rate limit window in seconds",
    )
    RATE_LIMIT_PASSWORD_RESET_LIMIT: int = Field(
        default=5,
        description="Max password reset requests per window",
    )
    RATE_LIMIT_PASSWORD_RESET_WINDOW: int = Field(
        default=3600,
        description="Password reset rate limit window in seconds",
    )
    RATE_LIMIT_VERIFICATION_LIMIT: int = Field(
        default=10,
        description="Max OTP/email verification requests per window",
    )
    RATE_LIMIT_VERIFICATION_WINDOW: int = Field(
        default=3600,
        description="Verification rate limit window in seconds",
    )
    RATE_LIMIT_UPLOAD_LIMIT: int = Field(
        default=15,
        description="Max file upload requests per window",
    )
    RATE_LIMIT_UPLOAD_WINDOW: int = Field(
        default=3600,
        description="File upload rate limit window in seconds",
    )
    RATE_LIMIT_AI_PROCESSING_LIMIT: int = Field(
        default=30,
        description="Max AI/ML processing requests per window",
    )
    RATE_LIMIT_AI_PROCESSING_WINDOW: int = Field(
        default=60,
        description="AI/ML processing rate limit window in seconds",
    )
    RATE_LIMIT_TELEMETRY_LIMIT: int = Field(
        default=180,
        description="Max client telemetry requests per window",
    )
    RATE_LIMIT_TELEMETRY_WINDOW: int = Field(
        default=60,
        description="Client telemetry rate limit window in seconds",
    )
    RATE_LIMIT_SEARCH_LIMIT: int = Field(
        default=60,
        description="Max search requests per window",
    )
    RATE_LIMIT_SEARCH_WINDOW: int = Field(
        default=60,
        description="Search rate limit window in seconds",
    )
    RATE_LIMIT_PAYMENTS_LIMIT: int = Field(
        default=10,
        description="Max payment/checkout requests per window",
    )
    RATE_LIMIT_PAYMENTS_WINDOW: int = Field(
        default=3600,
        description="Payment rate limit window in seconds",
    )
    RATE_LIMIT_PUBLIC_LIMIT: int = Field(
        default=120,
        description="Max public API requests per window",
    )
    RATE_LIMIT_PUBLIC_WINDOW: int = Field(
        default=60,
        description="Public API rate limit window in seconds",
    )
    RATE_LIMIT_DEFAULT_LIMIT: int = Field(
        default=200,
        description="Default API rate limit per window",
    )
    RATE_LIMIT_DEFAULT_WINDOW: int = Field(
        default=60,
        description="Default API rate limit window in seconds",
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

    @field_validator("ALLOWED_HOSTS", "CORS_ORIGINS", mode="after")
    @classmethod
    def parse_list_fields(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            return [item.strip() for item in v.split(",") if item.strip()]
        elif isinstance(v, list):
            return [str(item).strip() for item in v if str(item).strip()]
        return [str(v)]

    @field_validator("MONGODB_URI", mode="before")
    @classmethod
    def sanitize_mongodb_uri(cls, v: Any) -> str:
        if isinstance(v, str):
            v = v.strip().strip("'\"")
        return v or "mongodb://localhost:27017"

    @field_validator("REDIS_URL", mode="before")
    @classmethod
    def sanitize_redis_url(cls, v: Any) -> str:
        if not v:
            return ""
        if isinstance(v, str):
            v = v.strip().strip("'\"")
            if not v:
                return ""
            # If the user pasted a redis-cli command (e.g. 'redis-cli --tls -u rediss://...')
            if "redis-cli" in v:
                import re
                match = re.search(r"(rediss?://\S+)", v)
                if match:
                    v = match.group(1).strip("'\"")
            # Upstash requires rediss:// (TLS)
            if "upstash.io" in v.lower() and v.lower().startswith("redis://"):
                v = "rediss://" + v[len("redis://"):]
        return v

    # ── Computed properties ────────────────────────────────────────────────

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_production(self) -> bool:
        import os
        return self.ENVIRONMENT == "production" or os.environ.get("RENDER", "").lower() in ("true", "1")

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    @property
    def is_public_sharing_configured(self) -> bool:
        """Determines if a valid, non-localhost public canonical URL is configured."""
        if not self.PUBLIC_APP_URL:
            return False
        url = self.PUBLIC_APP_URL.lower().strip()
        if not (url.startswith("http://") or url.startswith("https://")):
            return False
        return not any(h in url for h in ("localhost", "127.0.0.1", "0.0.0.0"))


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
