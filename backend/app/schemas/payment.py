"""
app/schemas/payment.py
-----------------------
Pydantic v2 validation schemas for Payment and Checkout REST endpoints.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class CheckoutRequest(BaseModel):
    """Payload to initiate checkout or payment transaction."""
    amount: float = Field(..., gt=0.0, le=100000.0, description="Payment amount (greater than 0, max 100,000)")
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$", description="3-letter uppercase ISO currency code")
    plan_id: Optional[str] = Field(default="standard_plan", min_length=1, max_length=50, description="Subscription plan ID")
    payment_method: Optional[str] = Field(default="card", pattern=r"^(card|upi|netbanking)$", description="Payment method: card | upi | netbanking")


class PaymentCreateRequest(BaseModel):
    """Payload to create or process a payment transaction."""
    amount: float = Field(..., gt=0.0, le=100000.0, description="Payment amount (greater than 0, max 100,000)")
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$", description="3-letter uppercase ISO currency code")
    description: Optional[str] = Field(default=None, max_length=200, description="Optional payment description")
