"""
app/domains/candidate_graph/models.py
--------------------------------------
Candidate Intelligence Graph Node & Edge Schemas (V2.5 Core Brain).
"""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str
    label: str
    node_type: str  # skill, concept, resume, assessment, interview, behavior, evaluation, hirescore
    properties: Dict[str, Any] = Field(default_factory=dict)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class GraphEdge(BaseModel):
    source_id: str
    target_id: str
    relation: str  # extracts, identifies_weakness, correlates, evaluates, tracks
    weight: float = 1.0


class CandidateIntelligenceGraphModel(BaseModel):
    user_id: str
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
