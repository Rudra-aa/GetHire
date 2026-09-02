"""
app/services/resume_service.py
------------------------------
Orchestrator for resume upload, PDF text extraction, structured parsing,
database persistence, and retrieval.
"""

from __future__ import annotations

import os
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

logger = get_logger(__name__)

MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
UPLOADS_DIR: Path = Path(__file__).resolve().parents[2] / "uploads" / "resumes"
_pdf_service = PDFService()


def _ensure_upload_dir(user_id: str) -> Path:
    """Ensure user-specific uploads directory exists."""
    user_dir = UPLOADS_DIR / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir


async def process_and_store_resume(
    db: AsyncIOMotorDatabase,
    user_id: str,
    file: UploadFile,
) -> ResumeModel:
    """
    Validate, stream to disk, extract text, parse sections, calculate quality score,
    and persist in MongoDB.
    """
    # 1. Validation
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "No file attached.", "errors": [{"code": "EMPTY_FILENAME"}]},
        )

    suffix = Path(file.filename).suffix.lower()
    if suffix != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail={"success": False, "message": "Only PDF documents (.pdf) are supported.", "errors": [{"code": "INVALID_FILE_TYPE"}]},
        )

    user_dir = _ensure_upload_dir(user_id)
    safe_filename = f"{uuid.uuid4().hex[:12]}_{Path(file.filename).name}"
    destination = user_dir / safe_filename

    # 2. Stream to disk enforcing 10MB limit
    total_bytes = 0
    try:
        with destination.open("wb") as out_file:
            while True:
                chunk = file.file.read(64 * 1024)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    out_file.close()
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail={"success": False, "message": "File exceeds the 10MB limit.", "errors": [{"code": "FILE_TOO_LARGE"}]},
                    )
                out_file.write(chunk)
    except HTTPException:
        raise
    except Exception as exc:
        destination.unlink(missing_ok=True)
        logger.error("Failed writing uploaded resume file", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": "Failed to save file to disk.", "errors": [{"code": "DISK_WRITE_ERROR"}]},
        )

    # 3. Extract text via PDFService
    try:
        extraction_result = _pdf_service.extract_text(destination)
        raw_text = extraction_result.text
        page_count = extraction_result.pages
    except PDFExtractionError as exc:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"success": False, "message": str(exc), "errors": [{"code": "PDF_EXTRACTION_ERROR"}]},
        )

    # 4. Parse structured entities
    parsed_data: ParsedResumeData = parse_resume_text(raw_text)

    # 5. Compute Quality Score
    quality_score: QualityScoreBreakdown = calculate_resume_quality_score(
        raw_text,
        parsed_data,
        page_count=page_count,
    )

    # 6. Calculate version number
    count = await db["resumes"].count_documents({"user_id": user_id})
    version = count + 1

    now = datetime.now(timezone.utc)
    resume = ResumeModel(
        user_id=user_id,
        version=version,
        filename=file.filename,
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

    # 7. Insert into MongoDB
    res = await db["resumes"].insert_one(resume.model_dump(by_alias=True, exclude_none=True))
    resume.id = str(res.inserted_id)

    # 8. Update UserModel.resume_uploaded = True
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"resume_uploaded": True, "updated_at": now}},
    )

    # 9. Audit Log
    try:
        audit = AuditLogModel(
            event="RESUME_UPLOADED",
            module="resume",
            user_id=user_id,
            metadata={"resume_id": resume.id, "filename": file.filename, "score": quality_score.overall_score},
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
) -> Optional[ResumeModel]:
    """Retrieve a specific resume ensuring user ownership."""
    if not ObjectId.is_valid(resume_id):
        return None
    doc = await db["resumes"].find_one({"_id": ObjectId(resume_id), "user_id": user_id})
    return ResumeModel(**doc) if doc else None


async def delete_resume(
    db: AsyncIOMotorDatabase,
    resume_id: str,
    user_id: str,
) -> bool:
    """Delete a resume document and its disk file."""
    if not ObjectId.is_valid(resume_id):
        return False

    doc = await db["resumes"].find_one({"_id": ObjectId(resume_id), "user_id": user_id})
    if not doc:
        return False

    # Remove file from disk
    file_path = doc.get("file_path")
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    # Delete record
    await db["resumes"].delete_one({"_id": ObjectId(resume_id)})

    # If user has no more resumes, update flag
    remaining = await db["resumes"].count_documents({"user_id": user_id})
    if remaining == 0:
        await db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"resume_uploaded": False, "updated_at": datetime.now(timezone.utc)}},
        )

    return True
