"""
app/utils/db_indexes.py
-----------------------
Idempotent MongoDB index initialization for GetHire collections.
Ensures unique email and fast lookups on startup.
"""

from pymongo import ASCENDING, DESCENDING
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.logging import get_logger

logger = get_logger(__name__)


async def init_db_indexes(db: AsyncIOMotorDatabase) -> None:
    """
    Ensures all essential database indexes are created on MongoDB collections.
    """
    try:
        # 1. Users collection indexes
        # - unique email
        # - created_at for sorting / pagination
        await db["users"].create_index(
            [("email", ASCENDING)],
            unique=True,
            name="idx_users_email_unique",
        )
        await db["users"].create_index(
            [("created_at", DESCENDING)],
            name="idx_users_created_at",
        )

        # 2. Auth Refresh Tokens collection indexes
        # - unique jti
        # - token_family for rotation lookups
        # - expires_at TTL index
        await db["auth_refresh_tokens"].create_index(
            [("jti", ASCENDING)],
            unique=True,
            name="idx_refresh_tokens_jti_unique",
        )
        await db["auth_refresh_tokens"].create_index(
            [("token_family", ASCENDING)],
            name="idx_refresh_tokens_family",
        )

        # 3. User Sessions collection indexes
        # - user_id + is_active
        await db["user_sessions"].create_index(
            [("user_id", ASCENDING), ("is_active", ASCENDING)],
            name="idx_user_sessions_user_active",
        )

        # 4. Resumes collection indexes
        # - user_id + created_at
        await db["resumes"].create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_resumes_user_created",
        )

        # 5. Interview Sessions collection indexes
        # - user_id + created_at
        # - status + user_id
        await db["interview_sessions"].create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_interview_sessions_user_created",
        )
        await db["interview_sessions"].create_index(
            [("status", ASCENDING), ("user_id", ASCENDING)],
            name="idx_interview_sessions_status",
        )

        # 6. Interview Answers collection indexes
        # - session_id + question_id (unique)
        # - session_id + created_at
        await db["interview_answers"].create_index(
            [("session_id", ASCENDING), ("question_id", ASCENDING)],
            unique=True,
            name="idx_interview_answers_session_question",
        )
        await db["interview_answers"].create_index(
            [("session_id", ASCENDING), ("created_at", ASCENDING)],
            name="idx_interview_answers_session_created",
        )

        # 7. Evaluations collection indexes
        # - session_id + question_id (unique)
        # - user_id + created_at
        # - session_id + created_at
        await db["evaluations"].create_index(
            [("session_id", ASCENDING), ("question_id", ASCENDING)],
            unique=True,
            name="idx_evaluations_session_question",
        )
        await db["evaluations"].create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_evaluations_user_created",
        )
        await db["evaluations"].create_index(
            [("session_id", ASCENDING), ("created_at", ASCENDING)],
            name="idx_evaluations_session_created",
        )

        logger.info("Database indexes initialized successfully.")
    except Exception as exc:
        logger.error("Failed to initialize database indexes", error=str(exc))
