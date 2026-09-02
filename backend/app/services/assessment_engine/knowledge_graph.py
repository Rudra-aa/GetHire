"""
app/services/assessment_engine/knowledge_graph.py
---------------------------------------------------
Knowledge Graph & Skill Mastery Builder for Assessment Engine.
Maps candidate technical strengths, concept mastery %, and skill gap relationships.

LOC Constraint: < 300 LOC
Single Responsibility: Technical Knowledge Graph Generation
"""

from __future__ import annotations

from typing import Dict, Any, List


class KnowledgeGraphBuilder:
    """Generates structured Knowledge Graph nodes and edge relationships for candidates."""

    def build_knowledge_graph(
        self,
        strong_concepts: List[str],
        weak_concepts: List[str],
        overall_assessment_score: int,
    ) -> Dict[str, Any]:
        """
        Creates knowledge graph nodes (concepts) and mastery percentages.
        """
        nodes = [
            {"id": "c_ds", "name": "Data Structures", "mastery": 85 if "Algorithms" in strong_concepts else 65},
            {"id": "c_sys", "name": "System Design", "mastery": 88 if "Distributed Systems" in strong_concepts else 60},
            {"id": "c_api", "name": "API Security", "mastery": 90 if "Backend APIs" in strong_concepts else 70},
            {"id": "c_db", "name": "SQL & Databases", "mastery": 80 if "PostgreSQL / MongoDB" in strong_concepts else 55},
        ]

        edges = [
            {"source": "c_ds", "target": "c_sys", "relation": "prerequisite"},
            {"source": "c_api", "target": "c_sys", "relation": "component"},
            {"source": "c_db", "target": "c_sys", "relation": "persistence"},
        ]

        return {
            "overall_readiness_pct": overall_assessment_score,
            "nodes": nodes,
            "edges": edges,
            "strong_concepts": strong_concepts,
            "weak_concepts": weak_concepts,
        }


# Singleton instance
knowledge_graph_builder = KnowledgeGraphBuilder()
