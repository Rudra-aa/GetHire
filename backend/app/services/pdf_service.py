"""
app/services/pdf_service.py
---------------------------
PyMuPDF-based text and metadata extraction from PDF files.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


@dataclass
class PDFExtractionResult:
    """Structured result returned by the PDF extraction service."""
    filename: str
    pages: int
    text: str


class PDFExtractionError(Exception):
    """Raised when PDF text extraction fails."""
    pass


class PDFService:
    """
    Service class responsible for extracting clean text from PDF documents.
    """

    def extract_text(self, file_path: Path) -> PDFExtractionResult:
        if not file_path.exists():
            raise FileNotFoundError(f"PDF file not found at path: {file_path}")

        if fitz is None:
            raise PDFExtractionError("PyMuPDF (fitz) is not installed. Please install PyMuPDF.")

        try:
            document: fitz.Document = fitz.open(str(file_path))
        except fitz.FileDataError as exc:
            raise PDFExtractionError(f"'{file_path.name}' is not a valid PDF or is corrupted.") from exc
        except Exception as exc:
            raise PDFExtractionError(f"Failed to open PDF '{file_path.name}': {exc}") from exc

        try:
            if document.is_encrypted:
                raise PDFExtractionError(f"'{file_path.name}' is password-protected and cannot be processed.")

            page_count: int = document.page_count
            if page_count == 0:
                raise PDFExtractionError(f"'{file_path.name}' contains no pages.")

            extracted_pages: list[str] = []
            for page_number in range(page_count):
                page: fitz.Page = document.load_page(page_number)
                page_text: str = page.get_text("text")
                if page_text and page_text.strip():
                    extracted_pages.append(page_text.strip())

            full_text: str = "\n\n".join(extracted_pages)
            if not full_text.strip():
                raise PDFExtractionError(
                    f"'{file_path.name}' appears to be a scanned or image-only PDF with no extractable text."
                )

            return PDFExtractionResult(
                filename=file_path.name,
                pages=page_count,
                text=full_text,
            )
        finally:
            document.close()
