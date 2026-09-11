"""
app/providers/gemini.py
-----------------------
Gemini AI Provider Adapter implementing BaseAIProvider.
Wraps Google Gemini API calls via the google-genai SDK with REST transport
to avoid gRPC DNS failures in containerised environments (Render, Docker).

LOC Constraint: < 300 LOC
Single Responsibility: Gemini AI Provider Implementation
"""

from __future__ import annotations

from typing import Dict, Any, Optional
import json
import asyncio

from app.providers.base import BaseAIProvider
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)

# Valid, currently active models — tried in priority order (fastest first)
_MODELS_TO_TRY = [
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
]


class GeminiAIProvider(BaseAIProvider):
    """Google Gemini AI Provider using the google-genai SDK with REST transport."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        raw_key = api_key or settings.GEMINI_API_KEY
        self.api_key = raw_key.strip() if raw_key else ""

    def _get_client(self, api_key: str):
        """Returns a configured google.genai client using REST (HTTP/1.1) transport.

        REST transport avoids gRPC DNS resolution failures in containerised
        environments such as Render and Docker where gRPC cannot resolve
        external hostnames at startup.
        """
        from google import genai
        from google.genai import types as genai_types  # noqa: F401 – ensure types are importable

        client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})
        return client

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: str = "json",
    ) -> Dict[str, Any]:
        """Executes a Gemini generation call, trying models in priority order."""
        active_key = (self.api_key or settings.GEMINI_API_KEY or "").strip()

        logger.info(
            "Gemini provider generate",
            key_present=bool(active_key),
            response_format=response_format,
        )

        if not active_key:
            logger.error("Gemini API Key is missing from runtime environment")
            return {"status": "error", "error": "Gemini API key is missing from runtime environment."}

        full_prompt = (
            f"System Instruction: {system_instruction}\n\nUser Prompt: {prompt}"
            if system_instruction
            else prompt
        )

        last_error: Exception | None = None

        for model_name in _MODELS_TO_TRY:
            try:
                from google import genai
                from google.genai import types as genai_types

                client = self._get_client(active_key)

                logger.info(
                    "[INTERVIEW_RUNTIME] provider_called",
                    model=model_name,
                    transport="rest",
                )

                t_start = asyncio.get_event_loop().time()

                # Run blocking generate in executor to avoid blocking the event loop
                loop = asyncio.get_running_loop()
                response = await loop.run_in_executor(
                    None,
                    lambda m=model_name: client.models.generate_content(
                        model=m,
                        contents=full_prompt,
                        config=genai_types.GenerateContentConfig(
                            temperature=temperature,
                            max_output_tokens=max_tokens,
                        ),
                    ),
                )

                t_elapsed = round((asyncio.get_event_loop().time() - t_start) * 1000, 2)
                logger.info(
                    "[INTERVIEW_RUNTIME] provider_returned",
                    model=model_name,
                    elapsed_ms=t_elapsed,
                )

                response_text = ""
                if response and response.candidates:
                    for candidate in response.candidates:
                        if candidate.content and candidate.content.parts:
                            response_text = "".join(
                                part.text for part in candidate.content.parts if hasattr(part, "text")
                            ).strip()
                            break

                if response_format == "json":
                    try:
                        cleaned = response_text
                        if cleaned.startswith("```json"):
                            cleaned = cleaned[7:]
                        if cleaned.startswith("```"):
                            cleaned = cleaned[3:]
                        if cleaned.endswith("```"):
                            cleaned = cleaned[:-3]
                        return json.loads(cleaned.strip())
                    except Exception:
                        return {"status": "success", "raw_text": response_text, "content": response_text}

                return {"status": "success", "content": response_text}

            except Exception as err:
                last_error = err
                logger.warning(
                    f"Gemini generation with {model_name} failed: {err!r}, trying next model..."
                )
                continue

        logger.error("All Gemini models failed", error=str(last_error))
        return {
            "status": "error",
            "error": str(last_error),
            "message": "Failed to generate AI response from Gemini provider.",
        }


# Singleton instance
gemini_provider = GeminiAIProvider()
