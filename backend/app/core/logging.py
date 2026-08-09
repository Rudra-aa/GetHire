"""
app/core/logging.py
-------------------
Structured logging configuration for GetHire.

Provides a consistent, machine-readable JSON log format in production and
a developer-friendly coloured format in development.

Usage:
    from app.core.logging import get_logger

    logger = get_logger(__name__)
    logger.info("User logged in", user_id="abc123", duration_ms=42)
"""

from __future__ import annotations

import logging
import sys
from typing import Any


# ---------------------------------------------------------------------------
# Simple structured logger adapter
# ---------------------------------------------------------------------------

class StructuredLogger:
    """
    Thin wrapper around stdlib logging that adds keyword-argument support,
    producing key=value pairs appended to the log message.

    This is intentionally lightweight (no structlog dependency for Sprint 0).
    Replace with structlog in a later sprint if desired.
    """

    def __init__(self, name: str) -> None:
        self._logger = logging.getLogger(name)

    def _format_extras(self, kwargs: dict[str, Any]) -> str:
        if not kwargs:
            return ""
        parts = " ".join(f"{k}={v!r}" for k, v in kwargs.items())
        return f" | {parts}"

    def debug(self, msg: str, **kwargs: Any) -> None:
        self._logger.debug(msg + self._format_extras(kwargs))

    def info(self, msg: str, **kwargs: Any) -> None:
        self._logger.info(msg + self._format_extras(kwargs))

    def warning(self, msg: str, **kwargs: Any) -> None:
        self._logger.warning(msg + self._format_extras(kwargs))

    def error(self, msg: str, **kwargs: Any) -> None:
        self._logger.error(msg + self._format_extras(kwargs))

    def critical(self, msg: str, **kwargs: Any) -> None:
        self._logger.critical(msg + self._format_extras(kwargs))

    def exception(self, msg: str, **kwargs: Any) -> None:
        self._logger.exception(msg + self._format_extras(kwargs))


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
