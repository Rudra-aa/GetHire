"""
app/domains/candidate_graph/graph_service.py
---------------------------------------------
Candidate Intelligence Graph Service (V2.5 Core Brain Manager).
Manages unified candidate intelligence graph data aggregation across Resume, Assessment,
AI Interview, FaceSense, Integrity, Evaluation, HireScore, and Career Progress.

LOC Constraint: < 300 LOC
Single Responsibility: Candidate Intelligence Graph Operations & Persistence
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.logging import get_logger

logger = get_logger(__name__)


class CandidateGraphService:
    """Manages reading, mutating, and linking nodes in the Candidate Intelligence Graph."""

    async def get_candidate_graph(
        self, db: AsyncIOMotorDatabase, user_id: str
    ) -> Dict[str, Any]:
        """Fetches unified Candidate Intelligence Graph for a given user."""
        graph_doc = await db["candidate_intelligence_graphs"].find_one({"user_id": user_id})

        if not graph_doc:
            # Initialize new Candidate Intelligence Graph with default nodes
            graph_doc = {
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc),
                "last_updated": datetime.now(timezone.utc),
                "nodes": [
                    {"id": f"u_{user_id}", "label": "Candidate Node", "node_type": "user", "properties": {}},
                ],
                "edges": [],
            }
            await db["candidate_intelligence_graphs"].insert_one(graph_doc)

        graph_doc["id"] = str(graph_doc["_id"])
        graph_doc.pop("_id", None)
        return graph_doc

    async def update_graph_nodes(
        self, db: AsyncIOMotorDatabase, user_id: str, new_nodes: List[Dict[str, Any]], new_edges: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Appends or updates nodes and edges in the candidate graph."""
        await db["candidate_intelligence_graphs"].update_one(
            {"user_id": user_id},
            {
                "$set": {"last_updated": datetime.now(timezone.utc)},
                "$addToSet": {
                    "nodes": {"$each": new_nodes},
                    "edges": {"$each": new_edges},
                },
            },
            upsert=True,
        )
        logger.info("Candidate Intelligence Graph updated", user_id=user_id, added_nodes=len(new_nodes))
        return await self.get_candidate_graph(db, user_id)


# Singleton Instance
candidate_graph_service = CandidateGraphService()
