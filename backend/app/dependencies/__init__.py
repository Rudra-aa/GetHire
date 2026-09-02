"""
app/dependencies/__init__.py
----------------------------
Dependencies package for GetHire.
"""

from app.dependencies.auth import (
    get_current_active_user,
    get_current_session_info,
    get_current_user,
    oauth2_scheme,
    require_roles,
)

__all__ = [
    "get_current_user",
    "get_current_active_user",
    "require_roles",
    "get_current_session_info",
    "oauth2_scheme",
]
