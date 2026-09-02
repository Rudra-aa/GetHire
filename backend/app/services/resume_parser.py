"""
app/services/resume_parser.py
-----------------------------
Structured multi-section parsing engine for PDF resume text.
Extracts Personal Info, Skills, Technologies, Experience, Projects, Education, and Certifications.
"""

from __future__ import annotations

import re
from typing import List, Tuple

from app.models.resume import (
    CertificationItem,
    EducationItem,
    ExperienceItem,
    ParsedResumeData,
    PersonalInfo,
    ProjectItem,
)
from app.services.skill_extractor import extract_skills


def _extract_personal_info(text: str) -> PersonalInfo:
    """Extract candidate contact details from header lines."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    header_text = "\n".join(lines[:10])

    # Name: First non-empty line that doesn't look like an email or URL
    name = None
    for line in lines[:5]:
        if not re.search(r"[@/\\:]|\b(resume|curriculum|vitae|page)\b", line, re.IGNORECASE) and len(line.split()) <= 4:
            name = line.strip()
            break

    # Email
    email_match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b", text)
    email = email_match.group(0) if email_match else None

    # Phone
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
    phone = phone_match.group(0) if phone_match else None

    # Links
    linkedin_match = re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/([A-Za-z0-9_-]+)", text, re.IGNORECASE)
    linkedin = f"https://linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else None

    github_match = re.search(r"(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9_-]+)", text, re.IGNORECASE)
    github = f"https://github.com/{github_match.group(1)}" if github_match else None

    portfolio_match = re.search(r"(?:https?://)?(www\.)?([A-Za-z0-9_-]+\.(?:dev|io|me|com))", text, re.IGNORECASE)
    portfolio = portfolio_match.group(0) if portfolio_match else None

    return PersonalInfo(
        name=name or "Candidate",
        email=email,
        phone=phone,
        linkedin=linkedin,
        github=github,
        portfolio=portfolio,
    )


def _split_sections(text: str) -> dict[str, str]:
    """Split resume into major standard sections based on uppercase headers."""
    section_patterns = {
        "experience": r"(?:work\s+experience|professional\s+experience|employment\s+history|experience)",
        "projects": r"(?:projects|technical\s+projects|academic\s+projects|personal\s+projects)",
        "education": r"(?:education|academic\s+background|qualifications)",
        "skills": r"(?:technical\s+skills|skills\s*(?:&|and)\s*technologies|skills\s*(?:&|and)\s*tools|skills)",
        "certifications": r"(?:certifications|certificates|licenses|courses)",
    }

    # Combined regex
    regex_pattern = r"(?i)^[ \t]*(?:#+\s*)?(" + "|".join(section_patterns.values()) + r")[:\s]*$"
    matches = list(re.finditer(regex_pattern, text, re.MULTILINE))

    sections: dict[str, str] = {}
    if not matches:
        return {"body": text}

    for i, match in enumerate(matches):
        raw_header = match.group(1).lower().strip()
        matched_key = "body"
        for key, pat in section_patterns.items():
            if re.search(pat, raw_header, re.IGNORECASE):
                matched_key = key
                break

        start_pos = match.end()
        end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[matched_key] = text[start_pos:end_pos].strip()

    return sections


def _extract_experience(text: str) -> List[ExperienceItem]:
    """Extract job roles, companies, and achievements."""
    items: List[ExperienceItem] = []
    blocks = [b.strip() for b in text.split("\n\n") if b.strip()]

    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if not lines:
            continue

        first_line = lines[0]
        duration_match = re.search(
            r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December|\d{4})\s*[-–—to]\s*(?:Present|Current|\d{4}|[A-Za-z]+ \d{4}))",
            block,
            re.IGNORECASE,
        )
        duration = duration_match.group(0) if duration_match else None

        # Split role and company (e.g. "Software Engineer | Google" or "Google — Senior Developer")
        parts = re.split(r"[|—–-]\s*", first_line)
        if len(parts) >= 2:
            role, company = parts[0].strip(), parts[1].strip()
        else:
            role = first_line
            company = lines[1] if len(lines) > 1 and not lines[1].startswith("•") and not lines[1].startswith("-") else "Organization"

        bullets = [l.lstrip("•-* ").strip() for l in lines[1:] if l.startswith(("•", "-", "*")) or len(l) > 30]

        items.append(
            ExperienceItem(
                company=company,
                role=role,
                duration=duration,
                bullets=bullets[:6],
            )
        )

    return items[:8]


def _extract_projects(text: str) -> List[ProjectItem]:
    """Extract project titles, technologies, and bullet points."""
    items: List[ProjectItem] = []
    blocks = [b.strip() for b in text.split("\n\n") if b.strip()]

    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if not lines:
            continue

        first_line = lines[0]
        # Check tech in parentheses e.g. "GetHire (React, FastAPI, MongoDB)"
        tech_match = re.search(r"\((.*?)\)|\[(.*?)\]", first_line)
        tech_list = []
        title = first_line
        if tech_match:
            raw_tech = tech_match.group(1) or tech_match.group(2)
            tech_list = [t.strip() for t in re.split(r"[,|/]", raw_tech) if t.strip()]
            title = re.sub(r"\(.*?\)|\[.*?\]", "", first_line).strip()

        bullets = [l.lstrip("•-* ").strip() for l in lines[1:] if l.startswith(("•", "-", "*")) or len(l) > 20]

        items.append(
            ProjectItem(
                title=title,
                description=bullets[0] if bullets else None,
                technologies=tech_list,
                bullets=bullets[:5],
            )
        )

    return items[:8]


def _extract_education(text: str) -> List[EducationItem]:
    """Extract degrees, institutions, and graduation years."""
    items: List[EducationItem] = []
    blocks = [b.strip() for b in text.split("\n\n") if b.strip()]

    degree_patterns = r"(?i)\b(Bachelor|Master|Ph\.?D|B\.?S|M\.?S|B\.?Tech|M\.?Tech|B\.?E|Associate|Diploma)\b"

    for block in blocks:
        lines = [l.strip() for l in block.split("\n") if l.strip()]
        if not lines:
            continue

        year_match = re.search(r"\b(19\d{2}|20\d{2})\b", block)
        gpa_match = re.search(r"(?i)gpa[:\s]*([0-4]\.\d{1,2}|[0-9]\.\d{1,2}/[0-9]\.\d{1,2})", block)

        institution = lines[0]
        degree = "Bachelor of Science in Computer Science"
        for line in lines:
            if re.search(degree_patterns, line):
                degree = line
                break

        items.append(
            EducationItem(
                institution=institution,
                degree=degree,
                graduation_year=year_match.group(0) if year_match else None,
                gpa=gpa_match.group(1) if gpa_match else None,
            )
        )

    return items[:4]


def _extract_certifications(text: str) -> List[CertificationItem]:
    """Extract professional certifications and licenses."""
    items: List[CertificationItem] = []
    lines = [l.lstrip("•-* ").strip() for l in text.split("\n") if l.strip()]

    for line in lines:
        if len(line) < 4 or len(line) > 120:
            continue
        year_match = re.search(r"\b(20\d{2})\b", line)
        name = re.sub(r"\b(20\d{2})\b", "", line).strip(" -|()[],")
        items.append(
            CertificationItem(
                name=name or line,
                year=year_match.group(0) if year_match else None,
            )
        )

    return items[:8]


def parse_resume_text(raw_text: str) -> ParsedResumeData:
    """
    Main entry point: Parse raw resume text into structured domain entities.
    """
    personal_info = _extract_personal_info(raw_text)
    sections = _split_sections(raw_text)

    # 1. Skills
    skill_result = extract_skills(raw_text)
    skills = skill_result.skills

    # 2. Experience
    exp_text = sections.get("experience", "")
    experience = _extract_experience(exp_text) if exp_text else []

    # 3. Projects
    proj_text = sections.get("projects", "")
    projects = _extract_projects(proj_text) if proj_text else []

    # 4. Education
    edu_text = sections.get("education", "")
    education = _extract_education(edu_text) if edu_text else []

    # 5. Certifications
    cert_text = sections.get("certifications", "")
    certifications = _extract_certifications(cert_text) if cert_text else []

    # Technologies: Combine skills with project/exp detected tools
    technologies = list(dict.fromkeys(skills + [t for p in projects for t in p.technologies]))

    return ParsedResumeData(
        personal_info=personal_info,
        skills=skills,
        technologies=technologies,
        experience=experience,
        projects=projects,
        education=education,
        certifications=certifications,
    )
