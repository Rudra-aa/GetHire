"""
GetHire Root Application Entrypoint
====================================
Ensures the backend application can be served directly from repository root
regardless of cloud platform working directory configuration (Render, Railway, Heroku).

Usage:
    uvicorn main:app --host 0.0.0.0 --port $PORT
    uvicorn app.main:app --host 0.0.0.0 --port $PORT
"""

import sys
from pathlib import Path

# Add backend directory to Python sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Expose app for Uvicorn
from app.main import app  # noqa: E402, F401
