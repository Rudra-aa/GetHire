"""
app/core/logging.py
-------------------
Structured logging configuration for GetHire.

Provides consistent, machine-readable structured logging with automatic
redaction of sensitive fields (passwords, tokens, API keys, authorization headers, payment data)
while preserving useful server-side diagnostic logs.

Usage:
    from app.core.logging import get_logger

    logger = get_logger(__name__)
    logger.info("User logged in", user_id="abc123", duration_ms=42)
"""

from __future__ import annotations

import logging
import re
import sys
from typing import Any, Dict


# ── Sensitive Key and Pattern Sanitization ───────────────────────────────────

SENSITIVE_KEY_SUBSTRINGS = (
    "password",
    "passwd",
    "pwd",
    "token",
    "jwt",
    "secret",
    "api_key",
    "apikey",
    "authorization",
    "auth_header",
    "cookie",
    "credit_card",
    "card_number",
    "cvv",
    "cvc",
    "pin",
    "payment",
)

BEARER_TOKEN_PATTERN = re.compile(r"(Bearer\s+)[A-Za-z0-9\-._~+/]+=*", re.IGNORECASE)
JWT_PATTERN = re.compile(r"eyJ[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}")
AUTH_HEADER_PATTERN = re.compile(
    r"((?:authorization|token|password|secret|api[-_]?key)\s*[:=]\s*['\"]?)([^'\";,\s]+)(['\"]?)",
    re.IGNORECASE,
)


def _is_sensitive_key(key: str) -> bool:
    """Check if keyword argument key indicates sensitive credential or token data."""
    k_lower = key.lower().replace("-", "_")
    return any(sub in k_lower for sub in SENSITIVE_KEY_SUBSTRINGS)


def _sanitize_log_value(val: Any) -> Any:
    """Recursively mask sensitive values in strings, dicts, and lists."""
    if isinstance(val, str):
        masked = BEARER_TOKEN_PATTERN.sub(r"\1[REDACTED]", val)
        masked = JWT_PATTERN.sub("[REDACTED_JWT]", masked)
        masked = AUTH_HEADER_PATTERN.sub(r"\1[REDACTED]\3", masked)
        return masked
    elif isinstance(val, dict):
        return {
            k: ("[REDACTED]" if _is_sensitive_key(str(k)) else _sanitize_log_value(v))
            for k, v in val.items()
        }
    elif isinstance(val, (list, tuple, set)):
        return [_sanitize_log_value(item) for item in val]
    return val


def _sanitize_extras(kwargs: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize extra keyword arguments passed to logger."""
    cleaned = {}
    for k, v in kwargs.items():
        if _is_sensitive_key(str(k)):
            cleaned[k] = "[REDACTED]"
        else:
            cleaned[k] = _sanitize_log_value(v)
    return cleaned


def _sanitize_message(msg: str) -> str:
    """Scrub sensitive credentials/tokens embedded directly in log message text."""
    if not isinstance(msg, str):
        return str(msg)
    masked = BEARER_TOKEN_PATTERN.sub(r"\1[REDACTED]", msg)
    masked = JWT_PATTERN.sub("[REDACTED_JWT]", masked)
    masked = AUTH_HEADER_PATTERN.sub(r"\1[REDACTED]\3", masked)
    return masked


# ---------------------------------------------------------------------------
# Simple structured logger adapter with redaction guard
# ---------------------------------------------------------------------------

class StructuredLogger:
    """
    Thin wrapper around stdlib logging that adds keyword-argument support,
    producing sanitized key=value pairs appended to the log message.
    """

    def __init__(self, name: str) -> None:
        self._logger = logging.getLogger(name)

    def _format_extras(self, kwargs: dict[str, Any]) -> str:
        if not kwargs:
            return ""
        sanitized = _sanitize_extras(kwargs)
        parts = " ".join(f"{k}={v!r}" for k, v in sanitized.items())
        return f" | {parts}"

    def debug(self, msg: str, **kwargs: Any) -> None:
        self._logger.debug(_sanitize_message(msg) + self._format_extras(kwargs))

    def info(self, msg: str, **kwargs: Any) -> None:
        self._logger.info(_sanitize_message(msg) + self._format_extras(kwargs))

    def warning(self, msg: str, **kwargs: Any) -> None:
        self._logger.warning(_sanitize_message(msg) + self._format_extras(kwargs))

    def error(self, msg: str, **kwargs: Any) -> None:
        self._logger.error(_sanitize_message(msg) + self._format_extras(kwargs))

    def critical(self, msg: str, **kwargs: Any) -> None:
        self._logger.critical(_sanitize_message(msg) + self._format_extras(kwargs))

    def exception(self, msg: str, **kwargs: Any) -> None:
        self._logger.exception(_sanitize_message(msg) + self._format_extras(kwargs))


# ---------------------------------------------------------------------------
# Setup function — called once during application startup
# ---------------------------------------------------------------------------

def setup_logging(level: str = "INFO") -> None:
    """
    Configure the root logger.

    Call this exactly once at application startup (in the lifespan handler).
    Subsequent calls to get_logger() will inherit this configuration.

    Args:
        level: Logging level string (DEBUG, INFO, WARNING, ERROR, CRITICAL).
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)

    # Format: timestamp | level | logger name | message
    fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_fmt = "%Y-%m-%dT%H:%M:%S"

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=fmt, datefmt=date_fmt))

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Remove any existing handlers to avoid duplicate output
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # Quieten noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)


def get_logger(name: str) -> StructuredLogger:
    """
    Return a StructuredLogger for the given module name.

    Args:
        name: Typically __name__ of the calling module.

    Returns:
        StructuredLogger instance.
    """
    return StructuredLogger(name)
