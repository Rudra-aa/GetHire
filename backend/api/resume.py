"""
resume.py
---------
FastAPI router for the GetHire Resume Upload endpoint.
Handles file validation, storage, and delegates PDF extraction to PDFService.
"""

import uuid
import shutil
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from backend.services.pdf_service import PDFExtractionError, PDFService
from backend.services.skill_extractor import extract_skills

# ---------------------------------------------------------------------------
# Router setup
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/api/v1", tags=["Resume"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES: frozenset[str] = frozenset({"application/pdf"})
UPLOADS_DIR: Path = Path(__file__).resolve().parents[1] / "uploads"

# Ensure the uploads directory exists at import time
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Dependency: shared PDFService instance
# ---------------------------------------------------------------------------

_pdf_service = PDFService()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_pdf_upload(file: UploadFile) -> None:
    """
    Validate that the uploaded file meets all acceptance criteria.

    Args:
        file (UploadFile): The incoming multipart upload from the client.

    Raises:
        HTTPException 400: If the file has no name, is not a PDF by extension,
                           or has an unexpected MIME type.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided. Please attach a PDF file.",
        )

    suffix = Path(file.filename).suffix.lower()
    if suffix != ".pdf":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Invalid file extension '{suffix}'. Only '.pdf' files are accepted.",
        )

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Invalid MIME type '{file.content_type}'. "
                "Only 'application/pdf' is accepted."
            ),
        )


def _save_upload(file: UploadFile) -> Path:
    """
    Stream the uploaded file to disk, enforcing the size limit.

    A UUID prefix is prepended to the original filename to avoid collisions
    while keeping the original name visible for debugging.

    Args:
        file (UploadFile): The validated multipart upload.

    Returns:
        Path: Absolute path of the saved file.

    Raises:
        HTTPException 413: If the file exceeds MAX_FILE_SIZE_BYTES.
        HTTPException 500: If an I/O error occurs while writing to disk.
    """
    safe_name = f"{uuid.uuid4().hex}_{Path(file.filename).name}"  # type: ignore[arg-type]
    destination: Path = UPLOADS_DIR / safe_name

    try:
        total_bytes: int = 0
        chunk_size: int = 64 * 1024  # 64 KB chunks

        with destination.open("wb") as out_file:
            while True:
                chunk: bytes = file.file.read(chunk_size)
                if not chunk:
                    break
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    out_file.close()
                    destination.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=(
                            f"File size exceeds the 10 MB limit "
                            f"(received > {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB)."
                        ),
                    )
                out_file.write(chunk)

    except HTTPException:
        raise
    except OSError as exc:
        destination.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {exc}",
        ) from exc

    return destination


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post(
    "/upload-resume",
    summary="Upload a PDF resume, extract text, and identify skills",
    response_description="Extracted text, metadata, and identified skills",
    status_code=status.HTTP_200_OK,
)
async def upload_resume(
    file: Annotated[UploadFile, File(description="A PDF resume file (max 10 MB)")],
) -> JSONResponse:
    """
    **Upload a resume PDF, extract text, and identify technical skills.**

    ### Validation
    - File must exist and have a `.pdf` extension.
    - MIME type must be `application/pdf`.
    - File size must not exceed **10 MB**.

    ### Processing
    1. The PDF is saved to the `uploads/` directory.
    2. Text is extracted from every page via `PDFService`.
    3. Technical skills are identified via the `SkillExtractor` engine.

    ### Response
    ```json
    {
      "success": true,
      "filename": "resume.pdf",
      "pages": 2,
      "text": "Full extracted resume text...",
      "skills": ["Python", "React", "SQL"],
      "skill_count": 3
    }
    ```

    ### Error Codes
    | Code | Reason |
    |------|--------|
    | 400  | Missing or invalid filename |
    | 413  | File exceeds 10 MB |
    | 415  | Non-PDF file type |
    | 422  | Invalid PDF content / empty PDF |
    | 500  | Server-side I/O or extraction failure |
    """
    # Step 1 — structural validation
    _validate_pdf_upload(file)

    # Step 2 — persist to disk (size limit enforced during streaming)
    saved_path: Path = _save_upload(file)

    # Step 3 — extract text via service layer
    try:
        result = _pdf_service.extract_text(saved_path)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc
    except PDFExtractionError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during PDF extraction: {exc}",
        ) from exc

    # Step 4 — extract skills from resume text
    skill_result = extract_skills(result.text)

    # Step 5 — return structured response
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "success": True,
            "filename": result.filename,
            "pages": result.pages,
            "text": result.text,
            "skills": skill_result.skills,
            "skill_count": skill_result.skill_count,
        },
    )