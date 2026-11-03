"""
app/services/resume_service.py
------------------------------
Orchestrator for resume upload, PDF text extraction, structured parsing,
database persistence, and retrieval.
"""

from __future__ import annotations

import os
import re
import tempfile
import urllib.parse
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from bson import ObjectId
from fastapi import HTTPException, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logging import get_logger
from app.models.resume import (
    ParsedResumeData,
    QualityScoreBreakdown,
    ResumeModel,
)
from app.models.token import AuditLogModel
from app.services.pdf_service import PDFExtractionError, PDFService
from app.services.resume_parser import parse_resume_text
from app.services.resume_scorer import calculate_resume_quality_score
from app.services.resume_validator import INVALID_RESUME_MESSAGE, validate_resume_document

logger = get_logger(__name__)

ALLOWED_EXTENSIONS: set[str] = {".pdf"}
ALLOWED_MIME_TYPES: set[str] = {
    "application/pdf",
    "application/x-pdf",
}
MAX_FILE_SIZE_BYTES: int = getattr(settings, "max_upload_size_bytes", 10 * 1024 * 1024)  # 10 MB
UPLOADS_DIR: Path = (Path(__file__).resolve().parents[2] / "uploads" / "resumes").resolve()
_pdf_service = PDFService()


def sanitize_filename(filename: Optional[str]) -> str:
    """
    Sanitize an uploaded filename and prevent directory traversal or malicious characters.

    Enforces:
      - Non-empty filename string.
      - Rejection of null bytes and ASCII control characters.
      - Rejection of directory traversal components ('..', '/', '\\').
      - Allowed extension strictly in ALLOWED_EXTENSIONS (.pdf).
      - Rejection of empty stems (e.g. '.pdf', '...pdf').
      - Sanitization of stem to alphanumeric characters, dashes, underscores, and periods.
      - Truncation of stem to a safe maximum length of 64 characters.
    """
    if not filename or not isinstance(filename, str) or not filename.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Filename cannot be empty.",
                "errors": [{"code": "INVALID_FILENAME"}],
            },
        )

    # Check for null bytes, %00, or ASCII control characters
    unquoted = urllib.parse.unquote(filename)
    if (
        "%00" in filename.lower()
        or "\x00" in filename
        or "\x00" in unquoted
        or any(ord(c) < 32 or ord(c) == 127 for c in filename)
        or any(ord(c) < 32 or ord(c) == 127 for c in unquoted)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Filename contains invalid control characters or null bytes.",
                "errors": [{"code": "INVALID_FILENAME"}],
            },
        )

    # Detect directory traversal or path separators explicitly (raw and unquoted)
    normalized = unquoted.replace("\\", "/")
    if ".." in normalized or "/" in normalized or ".." in filename.replace("\\", "/") or "/" in filename.replace("\\", "/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Filename cannot contain directory path components or traversal sequences.",
                "errors": [{"code": "INVALID_FILENAME"}],
            },
        )

    base = normalized.strip()
    if base.startswith("."):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Filename does not contain a valid stem name.",
                "errors": [{"code": "INVALID_FILENAME"}],
            },
        )

    p = Path(base)
    suffix = p.suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={
                "success": False,
                "message": f"Only PDF documents (.pdf) are supported. Received extension: '{suffix}'.",
                "errors": [{"code": "INVALID_FILE_TYPE"}],
            },
        )

    stem = p.stem.strip()
    safe_stem = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", stem).strip(" ._-")
    if not safe_stem:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Filename does not contain a valid stem name.",
                "errors": [{"code": "INVALID_FILENAME"}],
            },
        )

    safe_stem = safe_stem[:64]
    return f"{safe_stem}{suffix}"


def _ensure_upload_dir(user_id: str) -> Path:
    """Ensure user-specific uploads directory exists strictly inside UPLOADS_DIR."""
    safe_user_id = re.sub(r"[^a-zA-Z0-9_\-]", "", str(user_id))
    if not safe_user_id:
        safe_user_id = "default"
    user_dir = (UPLOADS_DIR / safe_user_id).resolve()
    if not user_dir.is_relative_to(UPLOADS_DIR):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Invalid user storage path.",
                "errors": [{"code": "PATH_TRAVERSAL_DETECTED"}],
            },
        )
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


async def process_and_store_resume(
    db: AsyncIOMotorDatabase,
    user_id: str,
    file: UploadFile,
) -> ResumeModel:
    """
    Validate, stream to disk, extract text, parse sections, calculate quality score,
    and persist in MongoDB with strict file and path validations.
    """
    # 1. Filename validation and sanitization
    safe_filename = sanitize_filename(file.filename)

    # 2. MIME type validation
    content_type = getattr(file, "content_type", None)
    if content_type is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={
                "success": False,
                "message": "Missing file MIME type. Only PDF documents ('application/pdf') are permitted.",
                "errors": [{"code": "INVALID_MIME_TYPE"}],
            },
        )
    elif isinstance(content_type, str):
        clean_mime = content_type.split(";")[0].strip().lower()
        if clean_mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail={
                    "success": False,
                    "message": f"Unsupported MIME type '{content_type}'. Only PDF documents are allowed.",
                    "errors": [{"code": "INVALID_MIME_TYPE"}],
                },
            )

    # 3. Check early declared file size if provided
    declared_size = getattr(file, "size", None)
    if declared_size is not None and isinstance(declared_size, int):
        if declared_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail={
                    "success": False,
                    "message": f"File exceeds the maximum upload limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
                    "errors": [{"code": "FILE_TOO_LARGE"}],
                },
            )
        if declared_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Uploaded file is empty.",
                    "errors": [{"code": "EMPTY_FILE"}],
                },
            )

    # 4. Prepare safe storage location
    user_dir = _ensure_upload_dir(user_id)
    stored_filename = f"{uuid.uuid4().hex}_{safe_filename}"
    destination = (user_dir / stored_filename).resolve()

    # Path containment validation
    if not destination.is_relative_to(UPLOADS_DIR):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Storage path traversal detected.",
                "errors": [{"code": "PATH_TRAVERSAL_DETECTED"}],
            },
        )

    # 5. Stream to disk enforcing MAX_FILE_SIZE_BYTES, empty file check, and PDF magic bytes
    total_bytes = 0
    first_chunk = True
    try:
        with destination.open("wb") as out_file:
            while True:
                chunk = file.file.read(64 * 1024)
                if not chunk:
                    break
                if first_chunk:
                    first_chunk = False
                    # Verify PDF magic signature (%PDF)
                    if not chunk.startswith(b"%PDF"):
                        out_file.close()
                        destination.unlink(missing_ok=True)
                        raise HTTPException(
                            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail={
                                "success": False,
                                "message": "File content does not match a valid PDF header signature.",
                                "errors": [{"code": "INVALID_MIME_TYPE"}],
                            },
                        )
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    out_file.close()
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail={
                            "success": False,
                            "message": f"File exceeds the maximum upload limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
                            "errors": [{"code": "FILE_TOO_LARGE"}],
                        },
                    )
                out_file.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        destination.unlink(missing_ok=True)
        logger.error("Failed writing uploaded resume file", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "success": False,
                "message": "Failed to save file to disk.",
                "errors": [{"code": "DISK_WRITE_ERROR"}],
            },
        )

    # 6. Reject empty files (0 bytes)
    if total_bytes == 0:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Uploaded file is empty.",
                "errors": [{"code": "EMPTY_FILE"}],
            },
        )

    # 7. Extract text via PDFService with corrupted file handling
    try:
        extraction_result = _pdf_service.extract_text(destination)
        raw_text = extraction_result.text
        page_count = extraction_result.pages
    except PDFExtractionError as exc:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "success": False,
                "message": f"Corrupted or unreadable PDF document: {str(exc)}",
                "errors": [{"code": "CORRUPTED_PDF", "detail": str(exc)}],
            },
        )

    # 8. Validate resume authenticity before parsing or scoring
    validation_result = validate_resume_document(raw_text, page_count=page_count)
    if not validation_result.is_valid:
        destination.unlink(missing_ok=True)
        logger.warning(
            "Resume validation rejected document",
            user_id=user_id,
            filename=safe_filename,
            reason=validation_result.reason,
            confidence=validation_result.confidence_score,
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "success": False,
                "message": INVALID_RESUME_MESSAGE,
                "errors": [
                    {
                        "code": "INVALID_RESUME_DOCUMENT",
                        "message": INVALID_RESUME_MESSAGE,
                    }
                ],
            },
        )

    # 9. Parse structured entities
    parsed_data: ParsedResumeData = parse_resume_text(raw_text)

    # 10. Compute Quality Score
    quality_score: QualityScoreBreakdown = calculate_resume_quality_score(
        raw_text,
        parsed_data,
        page_count=page_count,
    )

    # 11. Calculate version number
    count = await db["resumes"].count_documents({"user_id": user_id})
    version = count + 1

    now = datetime.now(timezone.utc)
    resume = ResumeModel(
        user_id=user_id,
        version=version,
        filename=safe_filename,
        file_path=str(destination),
        file_size_bytes=total_bytes,
        page_count=page_count,
        raw_text=raw_text,
        status="completed",
        parsed_data=parsed_data,
        quality_score=quality_score,
        created_at=now,
        updated_at=now,
    )

    # 12. Insert into MongoDB
    res = await db["resumes"].insert_one(resume.model_dump(by_alias=True, exclude_none=True))
    resume.id = str(res.inserted_id)

    # 13. Update UserModel.resume_uploaded = True
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"resume_uploaded": True, "updated_at": now}},
    )

    # 14. Audit Log
    try:
        audit = AuditLogModel(
            event="RESUME_UPLOADED",
            module="resume",
            user_id=user_id,
            metadata={"resume_id": resume.id, "filename": safe_filename, "score": quality_score.overall_score},
        )
        await db["audit_logs"].insert_one(audit.model_dump(by_alias=True, exclude_none=True))
    except Exception as exc:
        logger.warning("Failed writing resume audit log", error=str(exc))

    return resume


async def get_latest_resume_for_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> Optional[ResumeModel]:
    """Retrieve the latest resume for the given user."""
    doc = await db["resumes"].find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)],
    )
    return ResumeModel(**doc) if doc else None


async def get_resume_by_id(
    db: AsyncIOMotorDatabase,
    resume_id: str,
    user_id: str,
    is_admin: bool = False,
) -> Optional[ResumeModel]:
    """Retrieve a specific resume ensuring user ownership or administrator access."""
    if not ObjectId.is_valid(resume_id):
        return None
    query = {"_id": ObjectId(resume_id)}
    if not is_admin:
        query["user_id"] = user_id
    doc = await db["resumes"].find_one(query)
    return ResumeModel(**doc) if doc else None


async def delete_resume(
    db: AsyncIOMotorDatabase,
    resume_id: str,
    user_id: str,
    is_admin: bool = False,
) -> bool:
    """Delete a resume document and its disk file ensuring user ownership or administrator access."""
    if not ObjectId.is_valid(resume_id):
        return False

    query = {"_id": ObjectId(resume_id)}
    if not is_admin:
        query["user_id"] = user_id

    doc = await db["resumes"].find_one(query)
    if not doc:
        return False

    # Remove file from disk with safe containment check
    file_path_str = doc.get("file_path")
    if file_path_str:
        try:
            file_path = Path(file_path_str).resolve()
            temp_dir = Path(tempfile.gettempdir()).resolve()
            if file_path.exists() and file_path.is_file() and (file_path.is_relative_to(UPLOADS_DIR) or file_path.is_relative_to(temp_dir)):
                file_path.unlink(missing_ok=True)
        except OSError:
            pass

    # Delete record using exact query
    await db["resumes"].delete_one(query)

    # If user has no more resumes, update flag
    owner_id = str(doc.get("user_id"))
    remaining = await db["resumes"].count_documents({"user_id": owner_id})
    if remaining == 0 and ObjectId.is_valid(owner_id):
        await db["users"].update_one(
            {"_id": ObjectId(owner_id)},
            {"$set": {"resume_uploaded": False, "updated_at": datetime.now(timezone.utc)}},
        )

    return True
