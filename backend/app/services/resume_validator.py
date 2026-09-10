"""
app/services/resume_validator.py
---------------------------------
Multi-signal structural and semantic validation engine for Resume Intelligence.

Ensures only authentic resumes/CVs proceed to parsing and ATS quality scoring.
Discriminates resumes from invoices, homework assignments, research papers,
certificates, receipts, legal terms, articles, and random documents.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set

from app.core.logging import get_logger
from app.services.skill_extractor import extract_skills

logger = get_logger(__name__)

INVALID_RESUME_MESSAGE = "This document does not appear to be a resume/CV. Please upload a valid resume."


@dataclass
class ResumeValidationResult:
    """Structured validation report for an uploaded document."""
    is_valid: bool
    confidence_score: float
    reason: Optional[str] = None
    detected_sections: List[str] = field(default_factory=list)
    positive_signals: Dict[str, float] = field(default_factory=dict)
    negative_signals: Dict[str, float] = field(default_factory=dict)


# ── SECTION HEADER REGEX PATTERNS ───────────────────────────────────────────

SECTION_PATTERNS: Dict[str, str] = {
    "experience": r"(?im)^[ \t]*(?:#+\s*)?(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history|career\s+history|experience|internships|experience\s+summary|employment)[:\s]*$",
    "education": r"(?im)^[ \t]*(?:#+\s*)?(?:education|academic\s+background|academic\s+qualifications|educational\s+background|academic\s+history|qualifications|education\s*(?:&|and)\s*training)[:\s]*$",
    "skills": r"(?im)^[ \t]*(?:#+\s*)?(?:technical\s+skills|core\s+competencies|skills\s*(?:&|and)\s*(?:technologies|tools|proficiencies|abilities)|technical\s+proficiencies|key\s+skills|skills|technologies|proficiencies)[:\s]*$",
    "projects": r"(?im)^[ \t]*(?:#+\s*)?(?:technical\s+projects|academic\s+projects|personal\s+projects|selected\s+projects|key\s+projects|projects|portfolio)[:\s]*$",
    "summary": r"(?im)^[ \t]*(?:#+\s*)?(?:professional\s+summary|executive\s+summary|career\s+objective|career\s+summary|about\s+me|profile\s+summary|professional\s+profile|summary|profile|objective)[:\s]*$",
    "certifications": r"(?im)^[ \t]*(?:#+\s*)?(?:certifications|certificates|licenses|credentials|awards\s*(?:&|and)\s*certifications|certifications\s*(?:&|and)\s*licenses|honors\s*(?:&|and)\s*awards)[:\s]*$",
}

# ── RESUME CONTENT INDICATORS ───────────────────────────────────────────────

DEGREE_PATTERN = re.compile(
    r"(?i)\b(Bachelor(?:'s)?|Master(?:'s)?|Ph\.?D|Doctorate|B\.?S\.?|M\.?S\.?|B\.?Tech|M\.?Tech|"
    r"B\.?E\.?|B\.?A\.?|M\.?A\.?|M\.?B\.?A|Associate(?:'s)?|Diploma)\b"
)

DATE_RANGE_PATTERN = re.compile(
    r"(?i)\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|"
    r"January|February|March|April|May|June|July|August|September|October|November|December|\d{4})"
    r"\s*[-–—to]+\s*(?:Present|Current|Now|\d{4}|[A-Za-z]+\s+\d{4})\b"
)

JOB_TITLE_PATTERN = re.compile(
    r"(?i)\b(Software\s+(?:Engineer|Developer|Architect)|Frontend\s+Developer|Backend\s+Developer|"
    r"Full\s*Stack\s+Developer|Web\s+Developer|Mobile\s+(?:Developer|Engineer)|DevOps\s+Engineer|"
    r"Data\s+(?:Scientist|Analyst|Engineer)|System\s+Administrator|Cloud\s+Architect|"
    r"Product\s+Manager|Project\s+Manager|QA\s+Engineer|Engineering\s+Lead|Tech\s+Lead|"
    r"Solutions\s+Architect|Consultant|Analyst|Specialist|Associate|Intern|Administrator|"
    r"Designer|Researcher|Officer|Director|Coordinator)\b"
)

EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")
PHONE_PATTERN = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\+?\d{10,14}\b")
PROFILE_LINKS_PATTERN = re.compile(r"(?:linkedin\.com/in/|github\.com/|[a-z0-9_-]+\.(?:dev|io|me|portfolio))", re.IGNORECASE)

# ── NEGATIVE SIGNATURES (NON-RESUME INDICATORS) ─────────────────────────────

INVOICE_PATTERNS = [
    re.compile(r"(?i)\b(?:tax\s+)?invoice\s*(?:#|number|no|date|total)\b"),
    re.compile(r"(?i)\b(?:bill|ship)\s+to\s*:"),
    re.compile(r"(?i)\b(?:amount\s+due|total\s+due|balance\s+due|subtotal\s*:?|sub-total)\b"),
    re.compile(r"(?i)\b(?:payment\s+terms|due\s+date\s*:\s*\d|remit\s+to|purchase\s+order\s*#?)\b"),
    re.compile(r"(?i)\b(?:unit\s+price|item\s+description|qty\s+description|total\s+amount\s*:?\s*[\$€£₹])\b"),
]

ASSIGNMENT_PATTERNS = [
    re.compile(r"(?i)\b(?:homework\s*(?:assignment\s*)?\d+|assignment\s*#?\d+|problem\s+set\s*#?\d+)\b"),
    re.compile(r"(?i)\b(?:due\s+date\s*:|course\s+syllabus|instructor\s*:|professor\s*:|teaching\s+assistant)\b"),
    re.compile(r"(?i)\b(?:question\s*#?\d+\s*[:\)]|problem\s*#?\d+\s*[:\)]|exercise\s*#?\d+\s*[:\)])"),
    re.compile(r"(?i)\b(?:submit\s+(?:your\s+)?(?:solution|answers|code)|points?\s+possible|grading\s+rubric|total\s+marks\s*:)\b"),
]

RESEARCH_PAPER_PATTERNS = [
    re.compile(r"(?i)\babstract\b[\s\S]{10,300}\bintroduction\b"),
    re.compile(r"(?i)\breferences\s*\n\s*\[1\]"),
    re.compile(r"(?i)\b(?:arxiv:\s*\d+\.\d+|doi:\s*10\.\d+|proceedings\s+of\s+the|table\s+of\s+contents)\b"),
    re.compile(r"(?i)\b(?:literature\s+review|experimental\s+results|methodology\s+and\s+data|theorem\s+\d+|lemma\s+\d+)\b"),
]

CERTIFICATE_PATTERNS = [
    re.compile(r"(?i)\bcertificate\s+of\s+(?:completion|achievement|appreciation|excellence|attendance|participation)\b"),
    re.compile(r"(?i)\bthis\s+is\s+to\s+certify\s+that\b"),
    re.compile(r"(?i)\bhas\s+successfully\s+completed\s+(?:the\s+)?(?:course|training|program|workshop)\b"),
    re.compile(r"(?i)\bawarded\s+this\s+certificate\b"),
]

LEGAL_POLICY_PATTERNS = [
    re.compile(r"(?i)\bterms\s+(?:and|&)\s+conditions\b"),
    re.compile(r"(?i)\bprivacy\s+policy\b"),
    re.compile(r"(?i)\bnon-disclosure\s+agreement\b"),
    re.compile(r"(?i)\bhereinafter\s+referred\s+to\b"),
    re.compile(r"(?i)\bboarding\s+pass\b"),
]


def validate_resume_document(raw_text: str, page_count: int = 1) -> ResumeValidationResult:
    """
    Validate whether the extracted text represents a genuine resume/CV.

    Args:
        raw_text: Full clean text extracted from the PDF document.
        page_count: Total page count of the uploaded PDF.

    Returns:
        ResumeValidationResult with validity boolean, confidence score, and signals.
    """
    cleaned_text = raw_text.strip()
    words = cleaned_text.split()
    word_count = len(words)
    char_count = len(cleaned_text)

    # ── 1. Length & Density Sanity Checks ──────────────────────────────────
    if char_count < 80 or word_count < 20:
        return ResumeValidationResult(
            is_valid=False,
            confidence_score=0.0,
            reason="Document is too short to be a valid resume or CV.",
        )

    # Extremely long texts without resume structure (e.g. whole books/dissertations)
    if page_count > 15 and word_count > 5000:
        return ResumeValidationResult(
            is_valid=False,
            confidence_score=0.0,
            reason="Document exceeds typical resume/CV length and lacks resume structure.",
        )

    positive_signals: Dict[str, float] = {}
    negative_signals: Dict[str, float] = {}
    detected_sections: List[str] = []

    # ── 2. Negative Signal Evaluation (Non-Resume Signatures) ──────────────
    invoice_hits = sum(1 for pat in INVOICE_PATTERNS if pat.search(cleaned_text))
    if invoice_hits >= 2:
        negative_signals["invoice_signature"] = invoice_hits * 25.0

    assignment_hits = sum(1 for pat in ASSIGNMENT_PATTERNS if pat.search(cleaned_text))
    if assignment_hits >= 2:
        negative_signals["assignment_signature"] = assignment_hits * 20.0

    research_hits = sum(1 for pat in RESEARCH_PAPER_PATTERNS if pat.search(cleaned_text))
    if research_hits >= 1:
        negative_signals["research_paper_signature"] = research_hits * 25.0

    certificate_hits = sum(1 for pat in CERTIFICATE_PATTERNS if pat.search(cleaned_text))
    # Certificates are typically single-page awards with minimal text
    if certificate_hits >= 1 and word_count < 180:
        negative_signals["standalone_certificate"] = 40.0

    legal_hits = sum(1 for pat in LEGAL_POLICY_PATTERNS if pat.search(cleaned_text))
    if legal_hits >= 1:
        negative_signals["legal_or_policy"] = legal_hits * 30.0

    # ── 3. Positive Signal Evaluation (Resume Dimensions) ──────────────────

    # A. Contact Information (Max 25 pts)
    contact_score = 0.0
    has_email = bool(EMAIL_PATTERN.search(cleaned_text))
    has_phone = bool(PHONE_PATTERN.search(cleaned_text))
    has_links = bool(PROFILE_LINKS_PATTERN.search(cleaned_text))

    # Name indicator: Check top 5 lines for a candidate name (not a title/header)
    lines = [l.strip() for l in cleaned_text.split("\n") if l.strip()]
    has_name_header = False
    for line in lines[:5]:
        if not re.search(r"[@/\\:]|\b(resume|curriculum|vitae|page|invoice|assignment|chapter)\b", line, re.IGNORECASE):
            if 1 <= len(line.split()) <= 4 and len(line) <= 40:
                has_name_header = True
                break

    if has_email:
        contact_score += 12.0
    if has_phone:
        contact_score += 8.0
    if has_links:
        contact_score += 6.0
    if has_name_header:
        contact_score += 4.0

    positive_signals["contact_info"] = min(25.0, contact_score)

    # B. Resume Section Headers (Max 30 pts)
    for section_name, pattern in SECTION_PATTERNS.items():
        if re.search(pattern, cleaned_text):
            detected_sections.append(section_name)

    section_header_score = 0.0
    if "experience" in detected_sections:
        section_header_score += 10.0
    if "education" in detected_sections:
        section_header_score += 10.0
    if "skills" in detected_sections:
        section_header_score += 10.0
    if "projects" in detected_sections:
        section_header_score += 8.0
    if "summary" in detected_sections:
        section_header_score += 5.0
    if "certifications" in detected_sections:
        section_header_score += 5.0

    positive_signals["section_headers"] = min(30.0, section_header_score)

    # C. Experience / Employment Content Evidence (Max 20 pts)
    date_ranges = DATE_RANGE_PATTERN.findall(cleaned_text)
    job_titles = JOB_TITLE_PATTERN.findall(cleaned_text)
    bullet_points = len(re.findall(r"(?m)^[ \t]*[•\-\*]\s+[A-Za-z]", cleaned_text))

    experience_content_score = 0.0
    if len(date_ranges) >= 2:
        experience_content_score += 10.0
    elif len(date_ranges) >= 1:
        experience_content_score += 6.0

    if len(job_titles) >= 2:
        experience_content_score += 8.0
    elif len(job_titles) >= 1:
        experience_content_score += 4.0

    if bullet_points >= 3:
        experience_content_score += 6.0
    elif bullet_points >= 1:
        experience_content_score += 3.0

    positive_signals["experience_content"] = min(20.0, experience_content_score)

    # D. Education Content Evidence (Max 15 pts)
    degree_matches = DEGREE_PATTERN.findall(cleaned_text)
    has_university_term = bool(re.search(r"(?i)\b(University|College|Institute|School|Academy|Polytechnic)\b", cleaned_text))
    has_gpa_term = bool(re.search(r"(?i)\b(GPA|CGPA|Grade|Graduated|Graduation|Class of)\b", cleaned_text))

    education_content_score = 0.0
    if degree_matches:
        education_content_score += 8.0
    if has_university_term:
        education_content_score += 4.0
    if has_gpa_term:
        education_content_score += 3.0

    positive_signals["education_content"] = min(15.0, education_content_score)

    # E. Technical Skills & Depth Evidence (Max 15 pts)
    skill_res = extract_skills(cleaned_text)
    skill_count = skill_res.skill_count

    skills_score = 0.0
    if skill_count >= 8:
        skills_score = 15.0
    elif skill_count >= 4:
        skills_score = 10.0
    elif skill_count >= 2:
        skills_score = 5.0

    positive_signals["skills_depth"] = skills_score

    # F. Projects / Technical Artifacts (Max 10 pts)
    has_tech_in_parens = bool(re.search(r"(?m)^[^\n]{3,60}\((?:React|Python|Java|Node|Vue|FastAPI|SQL|AWS|Docker)[^\)\n]*\)", cleaned_text, re.IGNORECASE))
    projects_score = 0.0
    if "projects" in detected_sections and (has_tech_in_parens or bullet_points >= 2):
        projects_score += 10.0
    elif has_tech_in_parens:
        projects_score += 5.0

    positive_signals["projects_evidence"] = min(10.0, projects_score)

    # ── 4. Composite Score & Decision Matrix ───────────────────────────────
    total_positive = sum(positive_signals.values())
    total_negative = sum(negative_signals.values())
    net_score = max(0.0, total_positive - total_negative)
    confidence = min(1.0, round(net_score / 100.0, 2))

    section_breadth = len(detected_sections)
    has_contact = has_email or has_phone or has_links

    logger.info(
        "Resume validation evaluated",
        total_positive=total_positive,
        total_negative=total_negative,
        net_score=net_score,
        sections=detected_sections,
        has_contact=has_contact,
        skills_detected=skill_count,
    )

    # REJECTION RULE 1: Severe negative disqualifiers (Invoice, Assignment, Certificate, Legal)
    if total_negative >= 35.0:
        return ResumeValidationResult(
            is_valid=False,
            confidence_score=confidence,
            reason="Document contains strong non-resume indicators (e.g. invoice, assignment, or certificate).",
            detected_sections=detected_sections,
            positive_signals=positive_signals,
            negative_signals=negative_signals,
        )

    # REJECTION RULE 2: Insufficient structural breadth (Random articles, decoy keyword prose)
    # A genuine resume needs at least 2 distinct resume sections OR strong contact + 1 deep section
    if section_breadth < 2 and not (has_contact and (degree_matches or len(job_titles) >= 2 or skill_count >= 5)):
        return ResumeValidationResult(
            is_valid=False,
            confidence_score=confidence,
            reason="Document lacks standard resume sections and structure.",
            detected_sections=detected_sections,
            positive_signals=positive_signals,
            negative_signals=negative_signals,
        )

    # REJECTION RULE 3: Insufficient overall positive evidence (Threshold = 40.0)
    if net_score < 40.0:
        return ResumeValidationResult(
            is_valid=False,
            confidence_score=confidence,
            reason="Document does not meet the minimum threshold for resume signals.",
            detected_sections=detected_sections,
            positive_signals=positive_signals,
            negative_signals=negative_signals,
        )

    # ACCEPTED: Document possesses sufficient resume structure and signals
    return ResumeValidationResult(
        is_valid=True,
        confidence_score=confidence,
        reason=None,
        detected_sections=detected_sections,
        positive_signals=positive_signals,
        negative_signals=negative_signals,
    )
