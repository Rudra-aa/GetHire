"""
app/schemas/health.py
---------------------
Pydantic schemas for the health check endpoint response.

Keeping schemas in a dedicated file (not in the router) ensures they can be
imported by tests without pulling in route-handling logic.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class ServiceStatus(BaseModel):
    """Status of individual downstream dependencies."""

    database: str = Field(description="MongoDB connectivity: 'connected' | 'unreachable'")
    redis: str = Field(description="Redis connectivity: 'connected' | 'unreachable'")


class HealthResponse(BaseModel):
    """
    Health check response schema.

    Returned by GET /api/v1/health.
    """

    status: str = Field(
        description="Overall service status: 'healthy' | 'degraded' | 'unhealthy'"
    )
    service: str = Field(description="Application name")
    version: str = Field(description="Semantic version string")
    environment: str = Field(description="Runtime environment")
    uptime_seconds: float = Field(description="Seconds since the process started")
    timestamp: str = Field(description="ISO 8601 UTC timestamp of this response")
    services: ServiceStatus = Field(description="Individual dependency statuses")

    model_config = {"json_schema_extra": {
        "example": {
            "status": "healthy",
            "service": "GetHire",
            "version": "1.0.0",
            "environment": "development",
            "uptime_seconds": 42.7,
            "timestamp": "2026-08-09T10:30:00Z",
            "services": {
                "database": "connected",
                "redis": "connected",
            },
        }
    }}
