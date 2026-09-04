"""
Root app.main shim allowing `uvicorn app.main:app` from the repo root.
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the FastAPI application instance from backend/app/main.py
from backend.app.main import app, lifespan, create_application  # noqa: F401
