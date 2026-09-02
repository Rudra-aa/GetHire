"""
app/providers/gemini.py
-----------------------
Gemini AI Provider Adapter implementing BaseAIProvider.
Wraps Google Gemini API calls with structured parsing and error logging.

LOC Constraint: < 300 LOC
Single Responsibility: Gemini AI Provider Implementation
"""

from __future__ import annotations

from typing import Dict, Any, Optional
import json
import os
import asyncio

from app.providers.base import BaseAIProvider
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class GeminiAIProvider(BaseAIProvider):
    """Google Gemini AI Provider implementation using gemini-3.6-flash model."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        raw_key = api_key or settings.GEMINI_API_KEY
        self.api_key = raw_key.strip() if raw_key else ""

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        response_format: str = "json",
    ) -> Dict[str, Any]:
        """Executes Gemini generation call using active Gemini API model."""
        active_key = self.api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        active_key = active_key.strip()
        
        logger.info("Gemini provider check", GEMINI_API_KEY_PRESENT=bool(active_key), GEMINI_MODEL="gemini-3.6-flash")

        if not active_key:
            logger.error("Gemini API Key is missing")
            return {"status": "error", "error": "Gemini API key is missing from runtime environment."}

        models_to_try = [
            "gemini-3.5-flash-lite",
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.6-flash",
        ]
        last_error = None

        for model_name in models_to_try:
            try:
                import google.generativeai as genai
                genai.configure(api_key=active_key, transport="rest")
                model = genai.GenerativeModel(model_name)

                full_prompt = f"System Instruction: {system_instruction}\n\nUser Prompt: {prompt}" if system_instruction else prompt

                logger.info(f"[INTERVIEW_RUNTIME] provider_called model={model_name} transport=rest")
                t_start = asyncio.get_event_loop().time()

                loop = asyncio.get_running_loop()
                response = await loop.run_in_executor(
                    None, 
                    lambda: model.generate_content(full_prompt, request_options={"timeout": 20.0})
                )

                t_elapsed = round((asyncio.get_event_loop().time() - t_start) * 1000, 2)
                logger.info("[INTERVIEW_RUNTIME] provider_returned", model=model_name, elapsed_ms=t_elapsed)

                response_text = response.text.strip() if response and hasattr(response, "text") else ""

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
                logger.warning(f"Gemini generation with {model_name} failed: {err}, trying next model...")

        logger.error("All Gemini provider models failed", error=str(last_error))
        return {"status": "error", "error": str(last_error), "message": "Failed to generate AI response from Gemini provider."}


# Singleton instance
gemini_provider = GeminiAIProvider()
