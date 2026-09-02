"""
app/api/v1/interview/__init__.py
-------------------------------
Interview endpoints package.
"""

from app.api.v1.interview.router import interview_router

__all__ = ["interview_router"]
