import fitz  # PyMuPDF
from pathlib import Path
from dataclasses import dataclass


@dataclass
class PDFExtractionResult:
    """Structured result returned by the PDF extraction service."""

    filename: str
    pages: int
    text: str


class PDFExtractionError(Exception):
    """Raised when PDF text extraction fails for any reason."""
    pass


class PDFService:
    """
    Service class responsible for extracting text from PDF files.

    Responsibilities:
        - Open and validate PDF documents
        - Extract all readable text page-by-page
        - Return structured extraction results
        - Raise domain-specific exceptions on failure

    Usage:
        service = PDFService()
        result = service.extract_text(Path("/path/to/resume.pdf"))
    """

    def extract_text(self, file_path: Path) -> PDFExtractionResult:
        """
        Extract all text content from a PDF file.

        Args:
            file_path (Path): Absolute path to the PDF file on disk.

        Returns:
            PDFExtractionResult: Dataclass containing filename, page count, and extracted text.

        Raises:
            PDFExtractionError: If the file is not a valid PDF, is encrypted,
                                 is empty, or text extraction fails.
            FileNotFoundError: If the provided file path does not exist.
        """
        if not file_path.exists():
            raise FileNotFoundError(f"PDF file not found at path: {file_path}")

        try:
            document: fitz.Document = fitz.open(str(file_path))
        except fitz.FileDataError as exc:
            raise PDFExtractionError(
                f"'{file_path.name}' is not a valid PDF or is corrupted."
            ) from exc
        except Exception as exc:
            raise PDFExtractionError(
                f"Failed to open PDF '{file_path.name}': {exc}"
            ) from exc

        try:
            if document.is_encrypted:
                raise PDFExtractionError(
                    f"'{file_path.name}' is password-protected and cannot be processed."
                )

            page_count: int = document.page_count

            if page_count == 0:
                raise PDFExtractionError(
                    f"'{file_path.name}' contains no pages."
                )

            extracted_pages: list[str] = []

            for page_number in range(page_count):
                page: fitz.Page = document.load_page(page_number)
                page_text: str = page.get_text("text")
                extracted_pages.append(page_text.strip())

            full_text: str = "\n\n".join(
                text for text in extracted_pages if text
            )

            if not full_text.strip():
                raise PDFExtractionError(
                    f"'{file_path.name}' appears to be a scanned/image-only PDF "
                    "with no extractable text."
                )

            return PDFExtractionResult(
                filename=file_path.name,
                pages=page_count,
                text=full_text,
            )

        finally:
            document.close()
