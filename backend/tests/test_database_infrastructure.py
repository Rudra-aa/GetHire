"""
backend/tests/test_database_infrastructure.py
---------------------------------------------
Comprehensive tests for MongoDB Atlas and Redis infrastructure:
- Real MongoDB Atlas connection, ping, registration, login, and cleanup
- Database unavailable behavior (no misleading fallback, fail-fast in prod)
- Redis URL sanitization (Upstash rediss://, redis-cli command stripping)
- Redis optional / degraded mode without silent localhost fallback
- Safe credential redaction in logs and connection managers
- Lifespan startup and shutdown
"""

import asyncio
import os
import unittest
import uuid
from unittest.mock import PropertyMock, patch

from httpx import ASGITransport, AsyncClient
from pymongo.errors import ConnectionFailure

from app.core.config import Settings, settings
from app.core.exceptions import ServiceUnavailableError
from app.db.mongo import MongoManager, _redact_mongo_uri, mongo_manager
from app.db.redis_client import RedisManager, _redact_redis_url, redis_manager
from app.main import app


class TestMongoDBInfrastructure(unittest.IsolatedAsyncioTestCase):
    """Integration and failure tests for MongoDB Atlas infrastructure."""

    async def asyncSetUp(self) -> None:
        # Re-ensure mongo_manager is connected before test if needed
        if not await mongo_manager.ping():
            await mongo_manager.connect()

    async def test_01_atlas_connection_and_ping(self) -> None:
        """Verify real connection to MongoDB Atlas and ping response."""
        is_alive = await mongo_manager.ping()
        self.assertTrue(is_alive, "MongoDB Atlas ping should return True")

        db = mongo_manager.get_database()
        self.assertIsNotNone(db, "get_database() must return an active database")
        self.assertEqual(db.name, settings.MONGODB_DB_NAME.lower())

    async def test_02_atlas_real_registration_login_and_cleanup(self) -> None:
        """Verify candidate registration, login, and clean database removal against Atlas."""
        unique_id = uuid.uuid4().hex[:8]
        test_email = f"atlas_test_{unique_id}@example.com"
        test_password = "Password123!"

        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            # 1. Register candidate
            reg_payload = {
                "email": test_email,
                "password": test_password,
                "full_name": f"Atlas Candidate {unique_id}",
                "target_role": "Backend Developer",
                "experience_level": "mid",
            }
            reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
            self.assertEqual(
                reg_res.status_code,
                201,
                f"Registration failed: {reg_res.text}",
            )
            reg_data = reg_res.json()
            self.assertTrue(reg_data["success"])
            self.assertEqual(reg_data["data"]["user"]["email"], test_email)

            # 2. Login with newly created user
            login_payload = {
                "email": test_email,
                "password": test_password,
            }
            login_res = await client.post("/api/v1/auth/login", json=login_payload)
            self.assertEqual(
                login_res.status_code,
                200,
                f"Login failed: {login_res.text}",
            )
            login_data = login_res.json()
            self.assertTrue(login_data["success"])
            self.assertIn("access_token", login_data["data"])
            self.assertEqual(login_data["data"]["user"]["email"], test_email)

        # 3. Clean up from Atlas database
        db = mongo_manager.get_database()
        del_result = await db.users.delete_one({"email": test_email})
        self.assertEqual(
            del_result.deleted_count,
            1,
            "Cleaned up candidate should have deleted exactly 1 record",
        )

    async def test_03_database_unavailable_in_development(self) -> None:
        """When MongoDB cannot be reached in development, report error without localhost fallback."""
        isolated_mgr = MongoManager()
        bad_uri = "mongodb://127.0.0.1:27099/?serverSelectionTimeoutMS=500"

        with patch.object(settings, "MONGODB_URI", bad_uri):
            with patch.object(Settings, "is_production", new_callable=PropertyMock, return_value=False):
                await isolated_mgr.connect()
                # Must be disconnected, not pointing to localhost:27017
                self.assertFalse(await isolated_mgr.ping())
                with self.assertRaises(ServiceUnavailableError) as ctx:
                    isolated_mgr.get_database()
                self.assertEqual(ctx.exception.code, "DATABASE_NOT_CONNECTED")
        await isolated_mgr.disconnect()

    async def test_04_database_unavailable_in_production(self) -> None:
        """In production, startup must fail fast with ConnectionFailure and no localhost fallback."""
        isolated_mgr = MongoManager()
        bad_uri = "mongodb://127.0.0.1:27099/?serverSelectionTimeoutMS=500"

        with patch.object(settings, "MONGODB_URI", bad_uri):
            with patch.object(Settings, "is_production", new_callable=PropertyMock, return_value=True):
                with self.assertRaises(ConnectionFailure):
                    await isolated_mgr.connect()
                self.assertFalse(await isolated_mgr.ping())
        await isolated_mgr.disconnect()

    def test_05_redacted_mongo_uri(self) -> None:
        """Credentials in MongoDB URIs must be safely redacted for logs."""
        raw_uri = "mongodb+srv://admin_user:secretPass123@cluster0.mongodb.net/gethire?retryWrites=true"
        redacted = _redact_mongo_uri(raw_uri)
        self.assertNotIn("secretPass123", redacted)
        self.assertIn("admin_user:***@cluster0.mongodb.net", redacted)

    async def test_06_mongodb_uri_write_concern_whitespace_and_newline_normalization(self) -> None:
        """Verify write concern parameters with trailing newlines or spaces are cleaned."""
        raw_uris = [
            "mongodb+srv://user:pass@cluster.mongodb.net/gethire?retryWrites=true&w=majority\n",
            "mongodb+srv://user:pass@cluster.mongodb.net/gethire?retryWrites=true&w=majority\r\n",
            r"mongodb+srv://user:pass@cluster.mongodb.net/gethire?retryWrites=true&w=majority\n",
            "mongodb+srv://user:pass@cluster.mongodb.net/gethire?w=majority%0A&retryWrites=true",
            "mongodb+srv://user:pass@cluster.mongodb.net/gethire?retryWrites=true&w= majority ",
        ]
        for raw in raw_uris:
            cleaned = Settings.sanitize_mongodb_uri(raw)
            self.assertNotIn("\n", cleaned)
            self.assertNotIn("\r", cleaned)
            self.assertNotIn(r"\n", cleaned)
            self.assertIn("w=majority", cleaned)

        # Verify real index initialization succeeds with trailing newline in raw URI
        from motor.motor_asyncio import AsyncIOMotorClient
        import certifi
        from app.utils.db_indexes import init_db_indexes

        raw_atlas = settings.MONGODB_URI.strip() + "\n"
        cleaned_atlas = Settings.sanitize_mongodb_uri(raw_atlas)
        client = AsyncIOMotorClient(cleaned_atlas, tls=True, tlsCAFile=certifi.where(), w="majority")
        db = client[settings.MONGODB_DB_NAME.lower()]
        # Should execute without UnknownReplWriteConcern 'majority\n' error
        await init_db_indexes(db)
        client.close()

    async def test_07_real_atlas_indexes_verified(self) -> None:
        """Verify all essential collection indexes are present on the Atlas database."""
        db = mongo_manager.get_database()
        expected_indexes = {
            "users": ["idx_users_email_unique", "idx_users_created_at"],
            "auth_refresh_tokens": ["idx_refresh_tokens_jti_unique", "idx_refresh_tokens_family"],
            "user_sessions": ["idx_user_sessions_user_active"],
            "resumes": ["idx_resumes_user_created"],
            "interview_sessions": ["idx_interview_sessions_user_created", "idx_interview_sessions_status"],
            "interview_answers": ["idx_interview_answers_session_question", "idx_interview_answers_session_created"],
            "evaluations": ["idx_evaluations_session_question", "idx_evaluations_user_created", "idx_evaluations_session_created"],
        }
        for coll_name, idx_names in expected_indexes.items():
            info = await db[coll_name].index_information()
            for idx in idx_names:
                self.assertIn(idx, info, f"Index {idx} missing on collection {coll_name}")


class TestRedisInfrastructure(unittest.IsolatedAsyncioTestCase):
    """Tests for Redis configuration, URL sanitization, and optional degraded mode."""

    def test_01_redis_url_sanitization(self) -> None:
        """Settings should parse redis-cli commands and auto-detect Upstash TLS requirements."""
        # Case A: User pasted a redis-cli CLI command from Upstash
        cli_input = "redis-cli --tls -u rediss://default:upstashSecret@useful-grubworm-106332.upstash.io:6379"
        sanitized = Settings.sanitize_redis_url(cli_input)
        self.assertEqual(
            sanitized,
            "rediss://default:upstashSecret@useful-grubworm-106332.upstash.io:6379",
        )

        # Case B: Plain redis:// provided for an Upstash host -> auto-upgrade to rediss://
        upstash_plain = "redis://default:upstashSecret@useful-grubworm-106332.upstash.io:6379"
        sanitized_upstash = Settings.sanitize_redis_url(upstash_plain)
        self.assertTrue(sanitized_upstash.startswith("rediss://"))

        # Case C: Localhost plain redis
        local_redis = "redis://localhost:6379/0"
        self.assertEqual(Settings.sanitize_redis_url(local_redis), local_redis)

        # Case D: Empty / None
        self.assertEqual(Settings.sanitize_redis_url(""), "")
        self.assertEqual(Settings.sanitize_redis_url(None), "")

    async def test_02_redis_unreachable_degraded_mode(self) -> None:
        """When Redis is unreachable, app stays operational in degraded mode without localhost fallback."""
        isolated_redis = RedisManager()
        unreachable_url = "redis://127.0.0.1:6399/0"

        with patch.object(settings, "REDIS_URL", unreachable_url):
            # Connect should not raise
            await isolated_redis.connect()
            self.assertFalse(await isolated_redis.ping())
            with self.assertRaises(RuntimeError):
                isolated_redis.get_client()
        await isolated_redis.disconnect()

    async def test_03_health_check_reflects_degraded_status_when_redis_offline(self) -> None:
        """When MongoDB is connected but Redis is offline, health endpoint returns 200 degraded."""
        with patch.object(redis_manager, "ping", return_value=False):
            with patch.object(mongo_manager, "ping", return_value=True):
                async with AsyncClient(
                    transport=ASGITransport(app=app), base_url="http://test"
                ) as client:
                    res = await client.get("/api/v1/health")
                    self.assertEqual(res.status_code, 200)
                    data = res.json()
                    self.assertEqual(data["status"], "degraded")
                    self.assertEqual(data["services"]["database"], "connected")
                    self.assertEqual(data["services"]["redis"], "unreachable")

    def test_04_redacted_redis_url(self) -> None:
        """Credentials in Redis URLs must be safely redacted for logs."""
        raw_url = "rediss://default:superSecretToken@useful-grubworm-106332.upstash.io:6379"
        redacted = _redact_redis_url(raw_url)
        self.assertNotIn("superSecretToken", redacted)
        self.assertIn("default:***@useful-grubworm-106332.upstash.io:6379", redacted)

    async def test_05_redis_unset_skips_initialization_entirely(self) -> None:
        """When REDIS_URL is unset or empty, connect() skips initialization immediately."""
        isolated_redis = RedisManager()
        with patch.object(settings, "REDIS_URL", ""):
            await isolated_redis.connect()
            self.assertIsNone(isolated_redis._client)
            self.assertFalse(await isolated_redis.ping())
            with self.assertRaises(RuntimeError):
                isolated_redis.get_client()

    async def test_06_redis_localhost_in_production_skipped(self) -> None:
        """In production, localhost REDIS_URL is skipped to avoid silent connection errors."""
        isolated_redis = RedisManager()
        with patch.object(settings, "REDIS_URL", "redis://localhost:6379/0"):
            with patch.object(Settings, "is_production", new_callable=PropertyMock, return_value=True):
                await isolated_redis.connect()
                self.assertIsNone(isolated_redis._client)
                self.assertFalse(await isolated_redis.ping())


if __name__ == "__main__":
    unittest.main()

