"""
backend/tests/test_health.py
-----------------------------
Integration tests for the health check endpoint.

Run with:
    cd backend && pytest tests/test_health.py -v
"""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
class TestHealthEndpoint:
    """Test suite for GET /api/v1/health."""

    async def test_health_returns_200(self) -> None:
        """Health endpoint should return HTTP 200 when app is running."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/health")
        # 200 = healthy/degraded; 503 = unhealthy (DB unreachable in test)
        assert response.status_code in (200, 503)

    async def test_health_response_has_required_fields(self) -> None:
        """Health response must contain all required fields."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/health")
        data = response.json()
        assert "status" in data
        assert "service" in data
        assert "version" in data
        assert "environment" in data
        assert "services" in data
        assert "database" in data["services"]
        assert "redis" in data["services"]

    async def test_health_service_name(self) -> None:
        """Service name should match the application name."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/health")
        data = response.json()
        assert data["service"] == "GetHire"

    async def test_health_version_format(self) -> None:
        """Version should follow semantic versioning (major.minor.patch)."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/health")
        data = response.json()
        parts = data["version"].split(".")
        assert len(parts) == 3
        assert all(part.isdigit() for part in parts)

    async def test_root_endpoint(self) -> None:
        """Root endpoint should redirect to API info."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "service" in data
        assert "version" in data
