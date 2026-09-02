"""
app/services/skill_extractor.py
-------------------------------
Deterministic Resume Skill Extraction Engine for GetHire.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class SkillExtractionResult:
    skills: List[str]
    skill_count: int


SKILL_DATABASE: Dict[str, Dict[str, List[str]]] = {
    "Programming Languages": {
        "Python": ["python"], "JavaScript": ["javascript", "js"], "TypeScript": ["typescript", "ts"],
        "Java": ["java"], "C": ["\\bc\\b"], "C++": ["c\\+\\+", "cpp"], "C#": ["c#", "csharp"],
        "Go": ["golang", "\\bgo\\b"], "Rust": ["rust"], "Ruby": ["ruby"], "PHP": ["php"],
        "Swift": ["swift"], "Kotlin": ["kotlin"], "Scala": ["scala"], "R": ["\\br\\b"],
        "Dart": ["dart"], "Shell/Bash": ["bash", "shell\\s?script", "\\bsh\\b", "zsh"],
        "SQL": ["\\bsql\\b"], "HTML": ["html", "html5"], "CSS": ["\\bcss\\b", "css3"],
    },
    "Web Technologies": {
        "React": ["react", "react\\.?js", "reactjs"], "Angular": ["angular"], "Vue.js": ["vue", "vuejs"],
        "Next.js": ["next\\.?js", "nextjs"], "Node.js": ["node\\.?js", "nodejs"], "Express.js": ["express\\.?js", "expressjs"],
        "Django": ["django"], "Flask": ["flask"], "FastAPI": ["fastapi"], "Spring Boot": ["spring\\s?boot"],
        "Ruby on Rails": ["rails", "ruby\\s?on\\s?rails"], "Tailwind CSS": ["tailwind", "tailwindcss"],
        "REST API": ["rest\\s?api", "restful"], "GraphQL": ["graphql"], "gRPC": ["grpc"], "WebSocket": ["websocket"],
    },
    "Databases": {
        "PostgreSQL": ["postgres", "postgresql"], "MySQL": ["mysql"], "SQLite": ["sqlite"],
        "MongoDB": ["mongodb", "mongo"], "Redis": ["redis"], "Elasticsearch": ["elasticsearch"],
        "Cassandra": ["cassandra"], "DynamoDB": ["dynamodb"], "Supabase": ["supabase"], "Firebase": ["firebase"],
    },
    "Cloud & Infrastructure": {
        "AWS": ["\\baws\\b", "amazon\\s?web\\s?services"], "Azure": ["azure"], "Google Cloud (GCP)": ["\\bgcp\\b", "google\\s?cloud"],
        "Docker": ["docker"], "Kubernetes": ["kubernetes", "\\bk8s\\b"], "Terraform": ["terraform"],
        "Ansible": ["ansible"], "Nginx": ["nginx"], "Linux": ["linux"], "CI/CD": ["ci/?cd", "continuous\\s?integration"],
        "GitHub Actions": ["github\\s?actions"], "Vercel": ["vercel"],
    },
    "AI & Machine Learning": {
        "Machine Learning": ["machine\\s?learning", "\\bml\\b"], "Deep Learning": ["deep\\s?learning", "\\bdl\\b"],
        "TensorFlow": ["tensorflow"], "PyTorch": ["pytorch"], "Scikit-learn": ["scikit[\\-\\s]?learn", "sklearn"],
        "NLP": ["\\bnlp\\b", "natural\\s?language\\s?processing"], "LLM": ["\\bllm\\b", "large\\s?language\\s?model"],
        "LangChain": ["langchain"], "Generative AI": ["generative\\s?ai", "gen\\s?ai"], "RAG": ["\\brag\\b"],
        "Pandas": ["pandas"], "NumPy": ["numpy"], "Apache Kafka": ["kafka"], "Apache Spark": ["\\bspark\\b"],
    },
    "Tools & Testing": {
        "Git": ["\\bgit\\b"], "GitHub": ["github"], "Jira": ["jira"], "Postman": ["postman"],
        "Figma": ["figma"], "Unit Testing": ["unit\\s?test"], "pytest": ["pytest"], "Jest": ["\\bjest\\b"],
        "Cypress": ["cypress"], "Playwright": ["playwright"], "OAuth": ["oauth", "oauth2"], "JWT": ["\\bjwt\\b"],
        "Microservices": ["microservice"], "System Design": ["system\\s?design"], "Agile": ["agile"], "Scrum": ["scrum"],
    },
}


@dataclass
class _SkillPattern:
    canonical_name: str
    pattern: re.Pattern[str]


def _build_registry() -> List[_SkillPattern]:
    registry: List[_SkillPattern] = []
    for _cat, skills in SKILL_DATABASE.items():
        for name, patterns in skills.items():
            for p in patterns:
                compiled = re.compile(rf"(?<![a-zA-Z]){p}(?![a-zA-Z])", re.IGNORECASE)
                registry.append(_SkillPattern(canonical_name=name, pattern=compiled))
    registry.sort(key=lambda sp: len(sp.canonical_name), reverse=True)
    return registry


_REGISTRY = _build_registry()


def extract_skills(text: str) -> SkillExtractionResult:
    """Extract technical skills from text using deterministic matching."""
    if not text or not text.strip():
        return SkillExtractionResult(skills=[], skill_count=0)

    matched: Dict[str, None] = {}
    for sp in _REGISTRY:
        if sp.canonical_name not in matched and sp.pattern.search(text):
            matched[sp.canonical_name] = None

    skills_list = sorted(matched.keys())
    return SkillExtractionResult(skills=skills_list, skill_count=len(skills_list))
