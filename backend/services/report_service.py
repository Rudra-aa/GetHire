"""
report_service.py
-----------------
PDF Interview Report Generator for GetHire.

Uses PyMuPDF (fitz) — already in the project's venv — to render
an HTML-like styled report as a PDF without needing ReportLab.

The report contains:
- Candidate info and session details
- Score breakdown with component weights
- Per-question feedback
- Final recommendation
"""

from pathlib import Path
from datetime import datetime, timezone

import fitz  # PyMuPDF


# ---------------------------------------------------------------------------
# Directory setup
# ---------------------------------------------------------------------------

REPORTS_DIR = Path(__file__).resolve().parents[1] / "uploads" / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Color helpers
# ---------------------------------------------------------------------------

def _hex_to_rgb(hex_color: str) -> tuple[float, float, float]:
    """Convert #rrggbb to (r, g, b) floats in [0,1]."""
    hex_color = hex_color.lstrip("#")
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return r / 255, g / 255, b / 255


def _rec_color(recommendation: str) -> str:
    return {
        "Strong Hire": "#22c55e",
        "Hire":        "#3b82f6",
        "Maybe":       "#f59e0b",
        "No Hire":     "#ef4444",
    }.get(recommendation, "#6b7280")


def _diff_color(difficulty: str) -> str:
    return {"easy": "#22c55e", "medium": "#f59e0b", "hard": "#ef4444"}.get(
        difficulty.lower(), "#6b7280"
    )


def _score_bar_width(score: float, max_width: float) -> float:
    return max_width * (score / 100.0)


# ---------------------------------------------------------------------------
# Page drawing helpers
# ---------------------------------------------------------------------------

class PDFReport:
    """Stateful PDF builder using PyMuPDF."""

    PAGE_W = 595   # A4 width in points
    PAGE_H = 842   # A4 height in points
    MARGIN = 40

    PRIMARY     = _hex_to_rgb("#6366f1")
    SECONDARY   = _hex_to_rgb("#8b5cf6")
    DARK_BG     = _hex_to_rgb("#1e1b4b")
    SURFACE     = _hex_to_rgb("#f8f7ff")
    BORDER      = _hex_to_rgb("#e0e7ff")
    TEXT_MAIN   = _hex_to_rgb("#1f2937")
    TEXT_MUTED  = _hex_to_rgb("#6b7280")
    WHITE       = (1, 1, 1)
    BLACK       = (0, 0, 0)

    def __init__(self):
        self.doc = fitz.open()
        self._new_page()

    def _new_page(self):
        self.page = self.doc.new_page(width=self.PAGE_W, height=self.PAGE_H)
        self.y = self.MARGIN

    def _check_page_break(self, needed: float = 60):
        if self.y + needed > self.PAGE_H - self.MARGIN:
            self._new_page()

    def _rect(self, x0, y0, x1, y1, fill=None, stroke=None, width=1):
        r = fitz.Rect(x0, y0, x1, y1)
        self.page.draw_rect(r, color=stroke, fill=fill, width=width)
        return r

    def _text(self, text: str, x: float, y: float, size: float = 10,
               color=None, bold: bool = False, align: int = 0) -> float:
        """Draw text and return new y position."""
        if color is None:
            color = self.TEXT_MAIN
        font = "Helvetica-Bold" if bold else "Helvetica"
        self.page.insert_text(
            (x, y + size),
            text,
            fontname=font,
            fontsize=size,
            color=color,
        )
        return y + size + 4

    def _wrapped_text(self, text: str, x: float, y: float, max_width: float,
                       size: float = 10, color=None, bold: bool = False) -> float:
        """Draw text wrapped to max_width, return new y."""
        if color is None:
            color = self.TEXT_MAIN
        font = "Helvetica-Bold" if bold else "Helvetica"
        rect = fitz.Rect(x, y, x + max_width, y + 500)
        extra = self.page.insert_textbox(
            rect,
            text,
            fontname=font,
            fontsize=size,
            color=color,
            align=0,
        )
        # Estimate height consumed
        chars_per_line = int(max_width / (size * 0.55))
        lines = max(1, (len(text) // chars_per_line) + text.count("\n") + 1)
        return y + lines * (size + 3)

    def _hr(self, color=None):
        if color is None:
            color = self.BORDER
        self._rect(self.MARGIN, self.y, self.PAGE_W - self.MARGIN, self.y + 0.5, fill=color)
        self.y += 8

    # -----------------------------------------------------------------------
    # Section builders
    # -----------------------------------------------------------------------

    def header(self):
        """Draw the GetHire branded header."""
        # Header background
        self._rect(0, 0, self.PAGE_W, 70, fill=self.DARK_BG)

        # Title
        self.page.insert_text((self.MARGIN, 32), "GetHire",
                               fontname="Helvetica-Bold", fontsize=22, color=(1, 1, 1))
        self.page.insert_text((self.MARGIN, 52), "AI-Powered Technical Interview Report",
                               fontname="Helvetica", fontsize=11, color=(0.8, 0.8, 1.0))

        # Version tag
        self.page.insert_text((self.PAGE_W - 120, 45), "v1.0  |  GetHire Platform",
                               fontname="Helvetica", fontsize=8, color=(0.6, 0.6, 0.9))
        self.y = 82

    def section_title(self, title: str):
        self._check_page_break(40)
        self.y += 10
        # Accent bar
        self._rect(self.MARGIN, self.y, self.MARGIN + 4, self.y + 18, fill=self.PRIMARY)
        self.page.insert_text(
            (self.MARGIN + 10, self.y + 13),
            title,
            fontname="Helvetica-Bold",
            fontsize=13,
            color=self.PRIMARY,
        )
        self.y += 26
        self._hr(self.BORDER)

    def info_row(self, label: str, value: str):
        self._check_page_break(20)
        lx = self.MARGIN
        vx = self.MARGIN + 130
        self.page.insert_text((lx, self.y + 11), label + ":",
                               fontname="Helvetica-Bold", fontsize=9, color=self.TEXT_MUTED)
        self.y = self._wrapped_text(value, vx, self.y, self.PAGE_W - vx - self.MARGIN,
                                     size=9, color=self.TEXT_MAIN)
        self.y += 2

    def score_row(self, label: str, score: float, weight: str, color_hex: str):
        self._check_page_break(28)
        bar_x = self.MARGIN
        bar_total = self.PAGE_W - self.MARGIN * 2

        # Background bar
        self._rect(bar_x, self.y, bar_x + bar_total, self.y + 18,
                   fill=self.SURFACE, stroke=self.BORDER, width=0.5)

        # Score bar (filled portion)
        fill_w = _score_bar_width(score, bar_total)
        rgb = _hex_to_rgb(color_hex)
        # Semi-transparent effect: lighter fill
        light_rgb = tuple(min(1.0, c + 0.5) for c in rgb)
        self._rect(bar_x, self.y, bar_x + fill_w, self.y + 18, fill=rgb)

        # Label
        self.page.insert_text((bar_x + 6, self.y + 12),
                               f"{label}  ({weight})",
                               fontname="Helvetica-Bold", fontsize=8, color=(1, 1, 1))

        # Score value on right
        score_text = f"{score:.0f}/100"
        self.page.insert_text((bar_x + bar_total - 45, self.y + 12),
                               score_text,
                               fontname="Helvetica-Bold", fontsize=8,
                               color=self.TEXT_MAIN if fill_w < bar_total * 0.85 else (1, 1, 1))
        self.y += 24

    def overall_box(self, overall: float, recommendation: str):
        self._check_page_break(55)
        self.y += 6
        rec_color = _hex_to_rgb(_rec_color(recommendation))

        # Left box — Overall Score
        self._rect(self.MARGIN, self.y, self.MARGIN + 240, self.y + 48, fill=self.PRIMARY)
        self.page.insert_text((self.MARGIN + 12, self.y + 18),
                               "Overall Score", fontname="Helvetica", fontsize=10, color=(1, 1, 1))
        self.page.insert_text((self.MARGIN + 12, self.y + 38),
                               f"{overall:.1f} / 100",
                               fontname="Helvetica-Bold", fontsize=16, color=(1, 1, 1))

        # Right box — Recommendation
        self._rect(self.MARGIN + 250, self.y, self.PAGE_W - self.MARGIN, self.y + 48,
                   fill=rec_color)
        self.page.insert_text((self.MARGIN + 262, self.y + 18),
                               "Recommendation", fontname="Helvetica", fontsize=10, color=(1, 1, 1))
        self.page.insert_text((self.MARGIN + 262, self.y + 38),
                               recommendation,
                               fontname="Helvetica-Bold", fontsize=16, color=(1, 1, 1))
        self.y += 58

    def question_block(self, index: int, answer: dict):
        q_text = answer.get("question_text", "N/A")
        skill = answer.get("skill", "")
        diff = answer.get("difficulty", "medium")
        tech = answer.get("technical_score", 0)
        comm = answer.get("communication_score", 0)
        feedback = answer.get("feedback", "")
        strengths = answer.get("strengths", [])
        improvements = answer.get("improvements", [])

        estimated_height = 90 + len(strengths) * 14 + len(improvements) * 14
        self._check_page_break(estimated_height)

        # Question header bar
        self._rect(self.MARGIN, self.y, self.PAGE_W - self.MARGIN, self.y + 20,
                   fill=self.SURFACE, stroke=self.BORDER, width=0.5)

        # Q number + skill
        self.page.insert_text(
            (self.MARGIN + 6, self.y + 13),
            f"Q{index}.  {skill}",
            fontname="Helvetica-Bold", fontsize=9, color=self.PRIMARY,
        )
        # Difficulty badge
        diff_rgb = _hex_to_rgb(_diff_color(diff))
        badge_x = self.PAGE_W - self.MARGIN - 55
        self._rect(badge_x, self.y + 4, badge_x + 48, self.y + 17, fill=diff_rgb)
        self.page.insert_text((badge_x + 4, self.y + 13),
                               diff.upper(), fontname="Helvetica-Bold", fontsize=7,
                               color=(1, 1, 1))
        self.y += 24

        # Question text
        self.y = self._wrapped_text(
            q_text, self.MARGIN, self.y,
            self.PAGE_W - self.MARGIN * 2, size=9, color=self.TEXT_MAIN, bold=True
        )
        self.y += 4

        # Scores inline
        self.page.insert_text(
            (self.MARGIN, self.y + 9),
            f"Technical Score: {tech:.0f}/100    Communication Score: {comm:.0f}/100",
            fontname="Helvetica", fontsize=8, color=self.TEXT_MUTED,
        )
        self.y += 14

        # Feedback
        if feedback:
            self.y = self._wrapped_text(
                f"Feedback: {feedback}", self.MARGIN, self.y,
                self.PAGE_W - self.MARGIN * 2, size=8, color=self.TEXT_MAIN,
            )
            self.y += 4

        # Strengths
        for s in strengths:
            self.y = self._wrapped_text(
                f"✓  {s}", self.MARGIN + 8, self.y,
                self.PAGE_W - self.MARGIN * 2 - 8, size=8,
                color=_hex_to_rgb("#166534"),
            )

        # Improvements
        for imp in improvements:
            self.y = self._wrapped_text(
                f"⚠  {imp}", self.MARGIN + 8, self.y,
                self.PAGE_W - self.MARGIN * 2 - 8, size=8,
                color=_hex_to_rgb("#92400e"),
            )

        self.y += 6
        self._hr()

    def footer(self):
        foot_y = self.PAGE_H - 28
        self._rect(0, foot_y - 4, self.PAGE_W, self.PAGE_H, fill=self.DARK_BG)
        self.page.insert_text(
            (self.MARGIN, foot_y + 10),
            "Generated by GetHire — AI-Powered Technical Interview Platform  |  For evaluation purposes only.",
            fontname="Helvetica", fontsize=7, color=(0.7, 0.7, 0.9),
        )

    def save(self, path: Path) -> Path:
        self.doc.save(str(path))
        self.doc.close()
        return path


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_report(
    session_id: str,
    candidate_name: str,
    skills_tested: list[str],
    answers: list[dict],
    score_data: dict,
) -> Path:
    """
    Generate a PDF interview report using PyMuPDF.

    Args:
        session_id:     Interview session ID (used for filename).
        candidate_name: Candidate's name.
        skills_tested:  Skills covered in the interview.
        answers:        List of evaluated answer dicts.
        score_data:     Final score dict.

    Returns:
        Path to the generated PDF file.
    """
    filename = f"report_{session_id[:8]}.pdf"
    output_path = REPORTS_DIR / filename

    rpt = PDFReport()

    # --- Header ---
    rpt.header()

    # --- Candidate Info ---
    rpt.section_title("Candidate Information")
    now = datetime.now(timezone.utc).strftime("%B %d, %Y  %H:%M UTC")
    rpt.info_row("Candidate Name", candidate_name)
    rpt.info_row("Interview Date", now)
    rpt.info_row("Session ID", session_id)
    rpt.info_row("Skills Assessed", ", ".join(skills_tested) if skills_tested else "General")
    rpt.info_row("Total Questions", str(len(answers)))

    # --- Score Summary ---
    rpt.section_title("Score Summary")
    rpt.score_row("Technical Knowledge", score_data.get("technical_score", 0), "50%", "#6366f1")
    rpt.y += 4
    rpt.score_row("Communication Quality", score_data.get("communication_score", 0), "20%", "#3b82f6")
    rpt.y += 4
    rpt.score_row("Face Emotion Confidence*", score_data.get("face_score", 0), "15%", "#8b5cf6")
    rpt.y += 4
    rpt.score_row("Voice Emotion Confidence*", score_data.get("voice_score", 0), "15%", "#a855f7")
    rpt.y += 8

    rpt.page.insert_text(
        (rpt.MARGIN, rpt.y + 9),
        "* Emotion scores from AI confidence analysis during interview session.",
        fontname="Helvetica", fontsize=7, color=rpt.TEXT_MUTED,
    )
    rpt.y += 18

    # Overall + Recommendation boxes
    rpt.overall_box(
        score_data.get("overall_score", 0),
        score_data.get("recommendation", "N/A"),
    )

    # --- Question Breakdown ---
    if answers:
        rpt.section_title("Question-by-Question Breakdown")
        for i, ans in enumerate(answers, 1):
            rpt.question_block(i, ans)

    # --- Footer on last page ---
    rpt.footer()

    return rpt.save(output_path)
