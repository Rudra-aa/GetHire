"""
app/api/v1/evaluations/__init__.py
----------------------------------
Evaluations endpoints package.
"""

from app.api.v1.evaluations.router import evaluations_router

__all__ = ["evaluations_router"]
