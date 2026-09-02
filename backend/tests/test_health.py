"""
backend/tests/test_health.py
-----------------------------
Integration tests for the health check endpoint.
"""

import unittest
from httpx import AsyncClient, ASGITransport
from app.main import app


class TestHealthEndpoint(unittest.IsolatedAsyncioTestCase):
    """Test suite for GET /api/v1/health."""

    async def test_health_returns_200(self) -> None:
        """Health endpoint should return HTTP 200 or 503 depending on database reachability."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/health")
        self.assertIn(response.status_code, (200, 503))

    async def test_health_response_has_required_fields(self) -> None:
        """Health response must contain all required fields."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/health")
        data = response.json()
        self.assertIn("status", data)
        self.assertIn("service", data)
        self.assertIn("version", data)
        self.assertIn("environment", data)
        self.assertIn("services", data)
        self.assertIn("database", data["services"])
        self.assertIn("redis", data["services"])

    async def test_health_service_name(self) -> None:
        """Service name should match the application name."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/api/v1/health")
        data = response.json()
        self.assertEqual(data["service"], "GetHire")

    async def test_root_endpoint(self) -> None:
        """Root endpoint should redirect to API info."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("service", data)
        self.assertIn("version", data)


if __name__ == "__main__":
    unittest.main()
