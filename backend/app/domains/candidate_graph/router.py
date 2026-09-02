"""
app/domains/candidate_graph/router.py
--------------------------------------
REST API router for Candidate Intelligence Graph (V2.5 Core Brain).
Endpoints to fetch and mutate the candidate graph.
"""

from __future__ import annotations

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies.auth import get_current_user
from app.db.mongo import get_database
from app.models.user import UserModel
from app.domains.candidate_graph.graph_service import candidate_graph_service

graph_router = APIRouter()


def _extract_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("_id") or user.get("id"))
    if hasattr(user, "id"):
        return str(user.id)
    return str(user)


@graph_router.get("/me")
async def get_my_candidate_graph(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserModel = Depends(get_current_user),
) -> Dict[str, Any]:
    """Retrieves the full Candidate Intelligence Graph for active candidate."""
    user_id = _extract_user_id(current_user)
    return await candidate_graph_service.get_candidate_graph(db, user_id=user_id)
