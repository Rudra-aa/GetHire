"""
main.py
-------
FastAPI application entry-point for GetHire.

Run with:
    uvicorn backend.main:app --reload
    
    (from the GetHire/ root directory)
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.resume import router as resume_router
from backend.api.interview import router as interview_router
from backend.api.evaluation import router as evaluation_router


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown hooks
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Ensure required directories exist before the app starts serving."""
    for subdir in ["uploads", "uploads/reports"]:
        (Path(__file__).resolve().parent / subdir).mkdir(parents=True, exist_ok=True)
    print("✅ GetHire API started — visit http://localhost:8000/docs")
    yield
    print("GetHire API shutting down.")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="GetHire API",
    description=(
        "**GetHire — AI-Powered Technical Interview Platform**\n\n"
        "Upload a PDF resume → Extract skills → Generate personalized interview questions → "
        "Evaluate answers → Score candidate → Generate PDF report.\n\n"
        "All endpoints documented below. Use `/docs` for interactive testing."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # Tighten to ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler returning a consistent JSON error envelope."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "detail": "An unexpected internal error occurred. Please try again later.",
        },
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(evaluation_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    response_description="Service health status",
)
async def health_check() -> dict[str, str]:
    """Return a simple health-check response."""
    return {
        "status": "healthy",
        "service": "GetHire API",
        "version": "1.0.0",
    }


@app.get(
    "/",
    tags=["System"],
    summary="API root",
    include_in_schema=False,
)
async def root() -> dict[str, str]:
    return {
        "message": "GetHire API is running. Visit /docs for the interactive API documentation.",
        "docs": "/docs",
        "health": "/health",
    }