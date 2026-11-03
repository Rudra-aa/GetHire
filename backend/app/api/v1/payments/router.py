"""
app/api/v1/payments/router.py
-----------------------------
Payment, billing, and checkout REST endpoints.
"""

from fastapi import APIRouter, status
from app.schemas.base import APIResponse
from app.schemas.payment import CheckoutRequest, PaymentCreateRequest

payments_router = APIRouter()


@payments_router.post(
    "/checkout",
    response_model=APIResponse,
    summary="Process checkout or payment transaction",
)
async def process_checkout(payload: CheckoutRequest) -> APIResponse:
    return APIResponse(
        success=True,
        message="Payment processed successfully.",
        data={
            "transaction_id": "tx_mock_12345",
            "status": "succeeded",
            "amount": payload.amount,
            "currency": payload.currency,
        },
    )


@payments_router.post(
    "",
    response_model=APIResponse,
    summary="Create or process payment transaction",
)
async def create_payment(payload: PaymentCreateRequest) -> APIResponse:
    return APIResponse(
        success=True,
        message="Payment initiated successfully.",
        data={
            "payment_id": "pay_mock_12345",
            "status": "pending",
            "amount": payload.amount,
            "currency": payload.currency,
        },
    )
