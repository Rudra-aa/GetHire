"""
app/providers/base.py
---------------------
Abstract Base Class for Provider-Agnostic AI Models in GetHire V2.5.
Allows switching seamlessly between Gemini, OpenAI, Claude, DeepSeek, and Ollama.

LOC Constraint: < 300 LOC
Single Responsibility: Provider-Agnostic AI Interface Definition
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseAIProvider(ABC):
    """Abstract Base Class for all AI model provider adapters."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: str = "json",
    ) -> Dict[str, Any]:
        """
        Executes generation call to the underlying AI provider.
        Returns a structured Python dictionary response.
        """
        pass
