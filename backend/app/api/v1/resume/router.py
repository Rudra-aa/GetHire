"""
app/api/v1/resume/router.py
---------------------------
REST API endpoints for Resume Intelligence:
  - POST   /resume/upload
  - GET    /resume/latest
  - GET    /resume/{id}
  - GET    /resume/{id}/status
  - GET    /resume/{id}/preview
  - DELETE /resume/{id}
"""

from __future__ import annotations

import os
import re
import tempfile
from pathlib import Path
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Path as FastApiPath, UploadFile, status
from fastapi.responses import FileResponse

from app.db.mongo import mongo_manager
from app.dependencies.auth import get_current_active_user
from app.models.resume import ResumeModel
from app.models.user import UserModel
from app.schemas.base import APIResponse
from app.schemas.resume import (
    ParsedDataOut,
    ResumeDetailResponseData,
    ResumeStatusResponseData,
    ResumeUploadResponseData,
)
from app.services.resume_service import (
    UPLOADS_DIR,
    delete_resume,
    get_latest_resume_for_user,
    get_resume_by_id,
    process_and_store_resume,
)

resume_router = APIRouter()


def sanitize_download_filename(filename: Optional[str]) -> str:
    """Sanitize filename to prevent HTTP header injection in Content-Disposition."""
    if not filename:
        return "resume.pdf"
    clean = re.sub(r'[\r\n"\\;]', "_", filename).strip()
    if not clean:
        return "resume.pdf"
    if not clean.lower().endswith(".pdf"):
        clean = f"{clean}.pdf"
    return clean


def _validate_safe_file_path(file_path_str: Optional[str]) -> Path:
    """
    Validate that the file exists, is a regular file, and resides strictly
    within the application's intended uploads storage directory.
    """
    if not file_path_str:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Resume file not found.", "errors": [{"code": "FILE_NOT_FOUND"}]},
        )

    resolved_path = Path(file_path_str).resolve()
    if not resolved_path.exists() or not resolved_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Resume file not found.", "errors": [{"code": "FILE_NOT_FOUND"}]},
        )

    uploads_dir = UPLOADS_DIR.resolve()
    temp_dir = Path(tempfile.gettempdir()).resolve()

    if not (resolved_path.is_relative_to(uploads_dir) or resolved_path.is_relative_to(temp_dir)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": "Access to file outside authorized storage directory is denied.",
                "errors": [{"code": "PATH_TRAVERSAL_DETECTED"}],
            },
        )

    return resolved_path


def _format_resume_detail(resume: ResumeModel) -> ResumeDetailResponseData:
    """Helper to convert ResumeModel into standard API response data."""
    return ResumeDetailResponseData(
        id=str(resume.id),
        user_id=str(resume.user_id),
        version=resume.version,
        filename=resume.filename,
        file_size_bytes=resume.file_size_bytes,
        page_count=resume.page_count,
        status=resume.status,
        raw_text=resume.raw_text,
        parsed_data=ParsedDataOut(
            personal_info=resume.parsed_data.personal_info,
            skills=resume.parsed_data.skills,
            technologies=resume.parsed_data.technologies,
            experience=resume.parsed_data.experience,
            projects=resume.parsed_data.projects,
            education=resume.parsed_data.education,
            certifications=resume.parsed_data.certifications,
        ),
        quality_score=resume.quality_score,
        created_at=resume.created_at.isoformat(),
        updated_at=resume.updated_at.isoformat(),
    )


# ── POST /resume/upload ─────────────────────────────────────────────────────

@resume_router.post(
    "/upload",
    response_model=APIResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and parse a PDF resume",
)
async def upload_resume(
    file: Annotated[UploadFile, File(description="PDF resume file (max 10MB)")],
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    resume = await process_and_store_resume(db, user_id, file)
    detail_data = _format_resume_detail(resume)

    return APIResponse(
        success=True,
        message="Resume uploaded and parsed successfully.",
        data=ResumeUploadResponseData(resume=detail_data).model_dump(),
    )


# ── GET /resume/latest ──────────────────────────────────────────────────────

@resume_router.get(
    "/latest",
    response_model=APIResponse,
    summary="Retrieve latest parsed resume for current user",
)
async def get_latest_resume(
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)

    resume = await get_latest_resume_for_user(db, user_id)
    if not resume:
        return APIResponse(
            success=True,
            message="No resume uploaded yet.",
            data={"resume": None},
        )

    return APIResponse(
        success=True,
        message="Latest resume retrieved successfully.",
        data={"resume": _format_resume_detail(resume).model_dump()},
    )


# ── GET /resume/{id} ────────────────────────────────────────────────────────

@resume_router.get(
    "/{resume_id}",
    response_model=APIResponse,
    summary="Retrieve specific parsed resume by ID",
)
async def get_resume(
    resume_id: str = FastApiPath(..., pattern=r"^[0-9a-fA-F]{24}$", description="Resume 24-hex ObjectId"),
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)
    is_admin = current_user.role == "admin"

    resume = await get_resume_by_id(db, resume_id, user_id, is_admin=is_admin)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Resume not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    return APIResponse(
        success=True,
        message="Resume details retrieved successfully.",
        data={"resume": _format_resume_detail(resume).model_dump()},
    )


# ── GET /resume/{id}/status ─────────────────────────────────────────────────

@resume_router.get(
    "/{resume_id}/status",
    response_model=APIResponse,
    summary="Poll parsing status and quality score for a resume",
)
async def get_resume_status(
    resume_id: str = FastApiPath(..., pattern=r"^[0-9a-fA-F]{24}$", description="Resume 24-hex ObjectId"),
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)
    is_admin = current_user.role == "admin"

    resume = await get_resume_by_id(db, resume_id, user_id, is_admin=is_admin)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Resume not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    status_data = ResumeStatusResponseData(
        id=str(resume.id),
        status=resume.status,
        quality_score=resume.quality_score.overall_score if resume.quality_score else None,
        error_message=resume.error_message,
    )
    return APIResponse(
        success=True,
        message="Resume status retrieved.",
        data=status_data.model_dump(),
    )


# ── GET /resume/{id}/preview ────────────────────────────────────────────────

@resume_router.get(
    "/{resume_id}/preview",
    summary="Stream raw PDF for inline browser preview",
)
async def preview_resume(
    resume_id: str = FastApiPath(..., pattern=r"^[0-9a-fA-F]{24}$", description="Resume 24-hex ObjectId"),
    current_user: UserModel = Depends(get_current_active_user),
) -> FileResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)
    is_admin = current_user.role == "admin"

    resume = await get_resume_by_id(db, resume_id, user_id, is_admin=is_admin)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Resume PDF file not found.", "errors": [{"code": "FILE_NOT_FOUND"}]},
        )

    file_path = _validate_safe_file_path(resume.file_path)
    preview_filename = sanitize_download_filename(resume.filename)

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=preview_filename,
        headers={"Content-Disposition": f'inline; filename="{preview_filename}"'},
    )


# ── GET /resume/{id}/download ───────────────────────────────────────────────

@resume_router.get(
    "/{resume_id}/download",
    summary="Download resume PDF file",
)
async def download_resume(
    resume_id: str = FastApiPath(..., pattern=r"^[0-9a-fA-F]{24}$", description="Resume 24-hex ObjectId"),
    current_user: UserModel = Depends(get_current_active_user),
) -> FileResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)
    is_admin = current_user.role == "admin"

    resume = await get_resume_by_id(db, resume_id, user_id, is_admin=is_admin)
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Resume not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    file_path = _validate_safe_file_path(resume.file_path)
    download_filename = sanitize_download_filename(resume.filename)

    return FileResponse(
        path=str(file_path),
        media_type="application/pdf",
        filename=download_filename,
        headers={"Content-Disposition": f'attachment; filename="{download_filename}"'},
    )


# ── DELETE /resume/{id} ─────────────────────────────────────────────────────

@resume_router.delete(
    "/{resume_id}",
    response_model=APIResponse,
    summary="Delete a resume record and its PDF storage",
)
async def remove_resume(
    resume_id: str = FastApiPath(..., pattern=r"^[0-9a-fA-F]{24}$", description="Resume 24-hex ObjectId"),
    current_user: UserModel = Depends(get_current_active_user),
) -> APIResponse:
    db = mongo_manager.get_database()
    user_id = str(current_user.id)
    is_admin = current_user.role == "admin"

    deleted = await delete_resume(db, resume_id, user_id, is_admin=is_admin)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "message": "Resume not found.", "errors": [{"code": "NOT_FOUND"}]},
        )

    return APIResponse(
        success=True,
        message="Resume deleted successfully.",
        data={"deleted": True},
    )
