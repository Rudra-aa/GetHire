"""
app/providers/interview_base.py
--------------------------------
Abstract Base Class for Provider-Agnostic Voice & Conversational Interview Models.
Allows switching seamlessly between Gemini Live, OpenAI Realtime, Claude, and LiveKit.

LOC Constraint: < 150 LOC
Single Responsibility: Voice Provider Interface Definition
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class BaseInterviewProvider(ABC):
    """Abstract Base Class for all Voice & Conversational Interview Providers."""

    @abstractmethod
    async def initialize_session(
        self,
        session_id: str,
        candidate_context: Dict[str, Any],
        blueprint: Dict[str, Any],
        persona: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Initializes the provider conversation state with candidate context & blueprint."""
        pass

    @abstractmethod
    async def generate_turn_response(
        self,
        session_id: str,
        current_prompt: str,
        candidate_transcript: str,
        conversation_history: List[Dict[str, Any]],
        context_payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generates AI speech/text response turn based on prompt and context payload."""
        pass

    @abstractmethod
    async def evaluate_turn_quality(
        self,
        candidate_transcript: str,
        expected_skills: List[str],
        rubric: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Evaluates candidate response turn for technical accuracy and evidence extraction."""
        pass
