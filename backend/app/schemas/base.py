"""
app/schemas/base.py
-------------------
Standard GetHire API JSON response envelopes.
Every API response strictly adheres to:
  - Success: {"success": true, "message": "...", "data": {...}, "errors": []}
  - Error:   {"success": false, "message": "...", "data": null, "errors": [...]}
"""

from __future__ import annotations

from typing import Any, List, Optional
from pydantic import BaseModel, Field


class APIErrorItem(BaseModel):
    """
    Detailed error item inside the errors list.
    """
    code: str = Field(description="Machine-readable error classification code (e.g. DUPLICATE_EMAIL)")
    message: Optional[str] = Field(default=None, description="Detailed field or context message")
    field: Optional[str] = Field(default=None, description="The request field causing the issue")


class APIResponse(BaseModel):
    """
    Standard GetHire API Response Envelope.
    """
    success: bool = True
    message: str = "Operation completed successfully."
    data: Any = Field(default_factory=dict)
    errors: List[APIErrorItem] = Field(default_factory=list)


class APIErrorResponse(BaseModel):
    """
    Standard Error Response Envelope.
    """
    success: bool = False
    message: str
    data: Any = None
    errors: List[APIErrorItem] = Field(default_factory=list)
