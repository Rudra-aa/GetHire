"""
skill_extractor.py
------------------
Deterministic Resume Skill Extraction Engine for GetHire.

Uses keyword matching against a curated master skill database
to extract technical skills from resume text. Designed for
unit-testability and reusability.
"""

import re
from dataclasses import dataclass, field


@dataclass(frozen=True)
class SkillExtractionResult:
    """Structured result returned by the skill extraction engine."""

    skills: list[str]
    skill_count: int


# ---------------------------------------------------------------------------
# Master Skill Database
# ---------------------------------------------------------------------------
# Each category maps to a dict of {canonical_name: [matching_patterns]}.
# Patterns are compiled into regex at module load time for performance.
# ---------------------------------------------------------------------------

SKILL_DATABASE: dict[str, dict[str, list[str]]] = {
    "Programming Languages": {
        "Python": ["python"],
        "JavaScript": ["javascript", "js"],
        "TypeScript": ["typescript", "ts"],
        "Java": ["java"],
        "C": ["\\bc\\b"],
        "C++": ["c\\+\\+", "cpp"],
        "C#": ["c#", "c\\s?sharp", "csharp"],
        "Go": ["golang", "\\bgo\\b"],
        "Rust": ["rust"],
        "Ruby": ["ruby"],
        "PHP": ["php"],
        "Swift": ["swift"],
        "Kotlin": ["kotlin"],
        "Scala": ["scala"],
        "R": ["\\br\\b"],
        "Perl": ["perl"],
        "Dart": ["dart"],
        "Lua": ["lua"],
        "Elixir": ["elixir"],
        "Haskell": ["haskell"],
        "MATLAB": ["matlab"],
        "Shell/Bash": ["bash", "shell\\s?script", "\\bsh\\b", "zsh"],
        "SQL": ["\\bsql\\b"],
        "Objective-C": ["objective[\\-\\s]?c"],
        "Assembly": ["assembly", "\\basm\\b"],
    },
    "Web Technologies": {
        "React": ["react", "react\\.?js", "reactjs"],
        "Angular": ["angular", "angularjs"],
        "Vue.js": ["vue", "vue\\.?js", "vuejs"],
        "Next.js": ["next\\.?js", "nextjs"],
        "Nuxt.js": ["nuxt\\.?js", "nuxtjs"],
        "Svelte": ["svelte"],
        "Node.js": ["node\\.?js", "nodejs"],
        "Express.js": ["express\\.?js", "expressjs", "\\bexpress\\b"],
        "Django": ["django"],
        "Flask": ["flask"],
        "FastAPI": ["fastapi", "fast\\s?api"],
        "Spring Boot": ["spring\\s?boot"],
        "Ruby on Rails": ["rails", "ruby\\s?on\\s?rails"],
        "Laravel": ["laravel"],
        "ASP.NET": ["asp\\.?net"],
        "jQuery": ["jquery"],
        "Bootstrap": ["bootstrap"],
        "Tailwind CSS": ["tailwind", "tailwindcss"],
        "SASS/SCSS": ["sass", "scss"],
        "HTML": ["html", "html5"],
        "CSS": ["\\bcss\\b", "css3"],
        "REST API": ["rest\\s?api", "restful"],
        "GraphQL": ["graphql"],
        "gRPC": ["grpc"],
        "WebSocket": ["websocket", "web\\s?socket"],
        "Webpack": ["webpack"],
        "Vite": ["\\bvite\\b"],
    },
    "Databases": {
        "PostgreSQL": ["postgres", "postgresql"],
        "MySQL": ["mysql"],
        "SQLite": ["sqlite"],
        "MongoDB": ["mongodb", "mongo"],
        "Redis": ["redis"],
        "Elasticsearch": ["elasticsearch", "elastic\\s?search"],
        "Cassandra": ["cassandra"],
        "DynamoDB": ["dynamodb"],
        "Oracle DB": ["oracle\\s?db", "oracle\\s?database", "\\boracle\\b"],
        "SQL Server": ["sql\\s?server", "mssql", "ms\\s?sql"],
        "Firebase": ["firebase"],
        "Neo4j": ["neo4j"],
        "CouchDB": ["couchdb"],
        "MariaDB": ["mariadb"],
        "Supabase": ["supabase"],
        "Memcached": ["memcached"],
    },
    "Cloud & Infrastructure": {
        "AWS": ["\\baws\\b", "amazon\\s?web\\s?services"],
        "Azure": ["azure", "microsoft\\s?azure"],
        "Google Cloud (GCP)": ["\\bgcp\\b", "google\\s?cloud"],
        "Heroku": ["heroku"],
        "DigitalOcean": ["digitalocean", "digital\\s?ocean"],
        "Vercel": ["vercel"],
        "Netlify": ["netlify"],
        "Cloudflare": ["cloudflare"],
        "AWS Lambda": ["lambda", "aws\\s?lambda"],
        "S3": ["\\bs3\\b", "aws\\s?s3"],
        "EC2": ["\\bec2\\b"],
        "CloudFormation": ["cloudformation"],
    },
    "AI & Machine Learning": {
        "Machine Learning": ["machine\\s?learning", "\\bml\\b"],
        "Deep Learning": ["deep\\s?learning", "\\bdl\\b"],
        "TensorFlow": ["tensorflow"],
        "PyTorch": ["pytorch"],
        "Keras": ["keras"],
        "Scikit-learn": ["scikit[\\-\\s]?learn", "sklearn"],
        "OpenCV": ["opencv"],
        "NLP": ["\\bnlp\\b", "natural\\s?language\\s?processing"],
        "Computer Vision": ["computer\\s?vision"],
        "Hugging Face": ["hugging\\s?face", "transformers"],
        "LLM": ["\\bllm\\b", "large\\s?language\\s?model"],
        "LangChain": ["langchain"],
        "Generative AI": ["generative\\s?ai", "gen\\s?ai"],
        "Prompt Engineering": ["prompt\\s?engineering"],
        "NLTK": ["nltk"],
        "SpaCy": ["spacy"],
        "XGBoost": ["xgboost"],
        "LightGBM": ["lightgbm"],
        "Neural Networks": ["neural\\s?network"],
        "Reinforcement Learning": ["reinforcement\\s?learning"],
        "RAG": ["\\brag\\b", "retrieval[\\-\\s]augmented"],
    },
    "Data Science & Analytics": {
        "Pandas": ["pandas"],
        "NumPy": ["numpy"],
        "Matplotlib": ["matplotlib"],
        "Seaborn": ["seaborn"],
        "Jupyter": ["jupyter", "jupyter\\s?notebook"],
        "Apache Spark": ["\\bspark\\b", "apache\\s?spark", "pyspark"],
        "Hadoop": ["hadoop"],
        "Tableau": ["tableau"],
        "Power BI": ["power\\s?bi", "powerbi"],
        "Apache Kafka": ["kafka", "apache\\s?kafka"],
        "Airflow": ["airflow", "apache\\s?airflow"],
        "dbt": ["\\bdbt\\b"],
        "ETL": ["\\betl\\b"],
        "Data Warehousing": ["data\\s?warehouse", "data\\s?warehousing"],
        "Data Pipelines": ["data\\s?pipeline"],
        "Snowflake": ["snowflake"],
        "BigQuery": ["bigquery", "big\\s?query"],
        "Looker": ["looker"],
        "Databricks": ["databricks"],
    },
    "DevOps & CI/CD": {
        "Docker": ["docker"],
        "Kubernetes": ["kubernetes", "\\bk8s\\b"],
        "Jenkins": ["jenkins"],
        "GitHub Actions": ["github\\s?actions"],
        "GitLab CI": ["gitlab\\s?ci"],
        "CircleCI": ["circleci", "circle\\s?ci"],
        "Travis CI": ["travis\\s?ci", "travisci"],
        "Terraform": ["terraform"],
        "Ansible": ["ansible"],
        "Puppet": ["puppet"],
        "Chef": ["\\bchef\\b"],
        "Nginx": ["nginx"],
        "Apache": ["\\bapache\\b"],
        "Linux": ["linux"],
        "CI/CD": ["ci/?cd", "continuous\\s?integration", "continuous\\s?deployment"],
        "Helm": ["\\bhelm\\b"],
        "ArgoCD": ["argocd", "argo\\s?cd"],
        "Prometheus": ["prometheus"],
        "Grafana": ["grafana"],
        "ELK Stack": ["elk\\s?stack", "\\belk\\b"],
        "Datadog": ["datadog"],
        "New Relic": ["new\\s?relic"],
    },
    "Tools & Platforms": {
        "Git": ["\\bgit\\b"],
        "GitHub": ["github"],
        "GitLab": ["gitlab"],
        "Bitbucket": ["bitbucket"],
        "Jira": ["jira"],
        "Confluence": ["confluence"],
        "Slack": ["slack"],
        "VS Code": ["vs\\s?code", "visual\\s?studio\\s?code", "vscode"],
        "IntelliJ": ["intellij"],
        "Postman": ["postman"],
        "Swagger": ["swagger", "openapi"],
        "Figma": ["figma"],
        "Notion": ["notion"],
        "Trello": ["trello"],
        "Linear": ["\\blinear\\b"],
        "Sentry": ["sentry"],
    },
    "Testing": {
        "Unit Testing": ["unit\\s?test"],
        "pytest": ["pytest"],
        "Jest": ["\\bjest\\b"],
        "Selenium": ["selenium"],
        "Cypress": ["cypress"],
        "Playwright": ["playwright"],
        "Mocha": ["mocha"],
        "JUnit": ["junit"],
        "TDD": ["\\btdd\\b", "test[\\-\\s]driven"],
        "BDD": ["\\bbdd\\b", "behavior[\\-\\s]driven"],
        "Load Testing": ["load\\s?test"],
        "Integration Testing": ["integration\\s?test"],
    },
    "Security": {
        "OAuth": ["oauth", "oauth2"],
        "JWT": ["\\bjwt\\b", "json\\s?web\\s?token"],
        "SSL/TLS": ["\\bssl\\b", "\\btls\\b"],
        "Penetration Testing": ["penetration\\s?test", "pen\\s?test"],
        "OWASP": ["owasp"],
        "Encryption": ["encryption", "\\baes\\b", "\\brsa\\b"],
        "IAM": ["\\biam\\b"],
        "SSO": ["\\bsso\\b", "single\\s?sign[\\-\\s]?on"],
    },
    "Architecture & Methodologies": {
        "Microservices": ["microservice"],
        "Monolith": ["monolith"],
        "Serverless": ["serverless"],
        "Event-Driven Architecture": ["event[\\-\\s]driven"],
        "Domain-Driven Design": ["domain[\\-\\s]driven", "\\bddd\\b"],
        "Design Patterns": ["design\\s?pattern"],
        "Agile": ["agile"],
        "Scrum": ["scrum"],
        "Kanban": ["kanban"],
        "System Design": ["system\\s?design"],
        "API Design": ["api\\s?design"],
        "OOP": ["\\boop\\b", "object[\\-\\s]oriented"],
        "Functional Programming": ["functional\\s?programming"],
        "SOLID Principles": ["\\bsolid\\b"],
        "Clean Architecture": ["clean\\s?architecture"],
    },
}


# ---------------------------------------------------------------------------
# Pre-compiled pattern registry
# ---------------------------------------------------------------------------

@dataclass
class _SkillPattern:
    """Internal: maps a compiled regex to its canonical skill name."""
    canonical_name: str
    pattern: re.Pattern[str]


def _build_pattern_registry() -> list[_SkillPattern]:
    """
    Flatten the skill database into a list of compiled regex patterns.
    Called once at module load time.

    Returns:
        list[_SkillPattern]: Pre-compiled patterns sorted longest-name-first
                             so more specific skills are matched before
                             shorter ambiguous ones.
    """
    registry: list[_SkillPattern] = []

    for _category, skills in SKILL_DATABASE.items():
        for canonical_name, patterns in skills.items():
            for raw_pattern in patterns:
                # Word-boundary-wrapped, case-insensitive
                compiled = re.compile(
                    rf"(?<![a-zA-Z]){raw_pattern}(?![a-zA-Z])",
                    re.IGNORECASE,
                )
                registry.append(
                    _SkillPattern(canonical_name=canonical_name, pattern=compiled)
                )

    # Sort so longer canonical names are checked first (avoids "C" matching before "C++")
    registry.sort(key=lambda sp: len(sp.canonical_name), reverse=True)
    return registry


_PATTERN_REGISTRY: list[_SkillPattern] = _build_pattern_registry()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_skills(text: str) -> SkillExtractionResult:
    """
    Extract technical skills from resume text using deterministic
    keyword matching against the master skill database.

    The function is:
    - **Case-insensitive**: "PYTHON" and "python" both match.
    - **Duplicate-free**: Each skill appears at most once.
    - **Deterministic**: Same input always produces same output.

    Args:
        text (str): Raw resume text (typically from PDF extraction).

    Returns:
        SkillExtractionResult: Extracted skills list and count.

    Example:
        >>> result = extract_skills("Experience with Python, React, and AWS")
        >>> result.skills
        ['Python', 'React', 'AWS']
        >>> result.skill_count
        3
    """
    if not text or not text.strip():
        return SkillExtractionResult(skills=[], skill_count=0)

    matched: dict[str, None] = {}  # ordered dict (insertion order) for dedup

    for sp in _PATTERN_REGISTRY:
        if sp.canonical_name not in matched and sp.pattern.search(text):
            matched[sp.canonical_name] = None

    skills_list: list[str] = list(matched.keys())
    # Sort alphabetically for consistent, readable output
    skills_list.sort()

    return SkillExtractionResult(
        skills=skills_list,
        skill_count=len(skills_list),
    )


def get_all_skills() -> dict[str, list[str]]:
    """
    Return the full master skill database grouped by category.
    Useful for admin/debug endpoints or frontend autocomplete.

    Returns:
        dict[str, list[str]]: Category name → list of canonical skill names.
    """
    return {
        category: sorted(skills.keys())
        for category, skills in SKILL_DATABASE.items()
    }
