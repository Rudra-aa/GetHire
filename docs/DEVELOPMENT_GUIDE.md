# GetHire — Development Guide

> **Document Version:** 1.0.0  
> **Status:** Approved for Development  
> **Last Updated:** 2026-08-09  
> **Author:** Engineering Team  
> **Related Documents:** [TRD.md](./TRD.md) · [SECURITY.md](./SECURITY.md) · [API_SPEC.md](./API_SPEC.md)

---

## Table of Contents

1. [Local Development Setup](#1-local-development-setup)
2. [Folder Structure](#2-folder-structure)
3. [Git Workflow](#3-git-workflow)
4. [Branch Strategy](#4-branch-strategy)
5. [Coding Standards](#5-coding-standards)
6. [Naming Conventions](#6-naming-conventions)
7. [Linting and Formatting](#7-linting-and-formatting)
8. [Testing Strategy](#8-testing-strategy)
9. [Commit Message Convention](#9-commit-message-convention)
10. [Pull Request Process](#10-pull-request-process)
11. [Definition of Done](#11-definition-of-done)
12. [Environment Variable Reference](#12-environment-variable-reference)
13. [Makefile Commands](#13-makefile-commands)
14. [Debugging Guide](#14-debugging-guide)

---

## 1. Local Development Setup

### 1.1 Prerequisites

Install the following tools before proceeding:

| Tool | Minimum Version | Install |
|---|---|---|
| Git | 2.40+ | `brew install git` |
| Node.js | 20.x LTS | https://nodejs.org |
| Python | 3.11+ | `brew install python@3.11` |
| Docker | 24.x+ | https://docker.com |
| Docker Compose | 2.x+ | Included with Docker Desktop |
| Ollama | Latest | https://ollama.ai |
| GNU Make | 3.81+ | `brew install make` |

### 1.2 First-Time Setup

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/gethire.git
cd gethire
```

#### Step 2: Create Environment Files

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```bash
# Required for local development
SECRET_KEY=          # Generate: python -c "import secrets; print(secrets.token_hex(32))"
MONGODB_URI=         # Atlas connection string or mongodb://localhost:27017
MONGODB_DB_NAME=gethire
REDIS_URL=redis://localhost:6379/0
OLLAMA_BASE_URL=http://localhost:11434
```

> ⚠️ Never commit `.env`. It is in `.gitignore`.

#### Step 3: Start Infrastructure

```bash
docker-compose up -d mongo redis
```

Wait for services to be healthy:

```bash
docker-compose ps
```

#### Step 4: Pull AI Models

```bash
ollama pull qwen2.5:7b
ollama pull llama3.2:3b
```

This may take 5–10 minutes on first run. Models are cached after download.

#### Step 5: Set Up Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

#### Step 6: Set Up Frontend

```bash
cd frontend
npm install
```

#### Step 7: Start All Services

```bash
# From the project root
make dev
```

Or manually in separate terminals:

```bash
# Terminal 1 — Ollama
ollama serve

# Terminal 2 — Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 3 — Celery worker
cd backend && celery -A app.workers.celery_app worker --loglevel=info

# Terminal 4 — Frontend
cd frontend && npm run dev
```

### 1.3 Verify Everything Is Running

| Service | URL | Expected Response |
|---|---|---|
| Frontend | http://localhost:5173 | React app loads |
| Backend API | http://localhost:8000/health | `{"status": "healthy"}` |
| Swagger UI | http://localhost:8000/docs | OpenAPI docs page |
| Ollama | http://localhost:11434/api/tags | List of pulled models |

### 1.4 Resetting the Development Database

```bash
make db-reset
# This drops and recreates the gethire database with indexes applied
```

---

## 2. Folder Structure

See [README.md](./README.md) for the complete annotated folder structure. This section focuses on key conventions.

### 2.1 Backend Module Structure (Per Feature)

Every API module follows this structure:

```
app/api/v1/{module}/
├── router.py        # FastAPI router — HTTP layer only. No business logic.
├── schemas.py       # Pydantic request/response models for this module.
├── service.py       # Business logic. No direct DB access.
└── dependencies.py  # FastAPI dependencies specific to this module.
```

### 2.2 Frontend Feature Structure (Per Feature)

Every frontend feature follows this structure:

```
src/features/{feature}/
├── components/      # React components used only by this feature.
├── hooks/           # Custom hooks for this feature's state/data.
├── services/        # API call functions for this feature.
├── store/           # Zustand slice for this feature (if needed).
├── types.ts         # TypeScript types for this feature.
└── index.ts         # Public exports from this feature.
```

### 2.3 Shared vs. Feature-Scoped

| Item | Location |
|---|---|
| UI primitives (Button, Input, Modal) | `src/components/ui/` |
| Page-level layout (Header, Footer) | `src/components/layout/` |
| Custom hooks used by 2+ features | `src/hooks/` |
| Types used by 2+ features | `src/types/` |
| Single-feature components | `src/features/{feature}/components/` |

---

## 3. Git Workflow

### 3.1 Summary

GetHire uses **GitHub Flow** — a simplified branching model optimized for continuous delivery.

```
main (always deployable)
  └── feature/your-feature-name
  └── fix/bug-description
  └── chore/task-description
```

### 3.2 Workflow Steps

1. **Pull latest `main`**

```bash
git checkout main
git pull origin main
```

2. **Create a feature branch**

```bash
git checkout -b feature/resume-skill-extraction
```

3. **Work on your feature** with small, frequent commits

4. **Push branch and open PR**

```bash
git push origin feature/resume-skill-extraction
# Then open a Pull Request on GitHub
```

5. **Pass CI checks** (lint, tests, type checks)

6. **Get code review** — minimum 1 approval required

7. **Squash merge to `main`**

8. **Delete feature branch**

### 3.3 Rules

- ❌ Never commit directly to `main`
- ❌ Never force-push to `main`
- ✅ Feature branches must be merged via PR
- ✅ PRs must pass all CI checks before merge
- ✅ Each PR should have a single, focused purpose

---

## 4. Branch Strategy

### 4.1 Branch Naming

```
feature/    → New feature or capability
fix/        → Bug fix
chore/      → Non-functional: dependency updates, config changes, tooling
docs/       → Documentation updates only
refactor/   → Code restructuring without behavior change
test/       → Adding or updating tests
```

### 4.2 Examples

```bash
feature/jwt-authentication
feature/resume-pdf-upload
feature/facesense-emotion-classifier
fix/session-status-not-updating
chore/upgrade-pydantic-v2
docs/update-api-spec
refactor/repository-pattern-auth
test/evaluation-engine-unit-tests
```

### 4.3 Branch Lifetime

- Feature branches should be merged within **3 working days** of opening the PR
- Stale branches (no commits for 7+ days) are closed automatically by GitHub Actions

---

## 5. Coding Standards

### 5.1 Python (Backend + AI)

#### Language Version
- Python 3.11+ required
- Type hints are **mandatory** on all function signatures

#### Code Style
- Follow **PEP 8**
- Line length: maximum **88 characters** (Black default)
- Import order: standard library → third-party → local (enforced by Ruff `isort`)

#### Type Hints

```python
# ✅ All parameters and return types annotated
async def get_session(
    session_id: str,
    current_user: User,
    repo: SessionRepository,
) -> Session:
    ...

# ❌ No bare Any without justification
def process(data: Any) -> Any:  # never acceptable
    ...
```

#### Async Discipline

```python
# ✅ Use async for all I/O operations
async def find_user(email: str) -> Optional[User]:
    return await User.find_one(User.email == email)

# ❌ Never use synchronous I/O in an async context
def find_user(email: str) -> Optional[User]:
    return User.find_one_sync({"email": email})  # blocks event loop
```

#### Pydantic Models

```python
# ✅ Use Pydantic v2 model_config
class ResumeCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, str_max_length=100)
    
    label: str | None = None
    file_name: str

# ✅ Use field validators for complex validation
@field_validator("file_name")
@classmethod
def sanitize_filename(cls, v: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_\-\.]", "_", v)
```

#### Exception Handling

```python
# ✅ Raise specific custom exceptions from service layer
raise ResumeNotFoundError(f"Resume {resume_id} not found")

# ❌ Never raise bare Exception or let library exceptions propagate to the API
raise Exception("something failed")  # never acceptable
```

### 5.2 TypeScript (Frontend)

#### Language Version
- TypeScript 5.4+ with `strict: true`
- No `any` types. Use `unknown` and narrow with guards.

#### Component Structure

```typescript
// ✅ Named exports over default exports (for better refactoring)
export const ResumeCard = ({ resume }: ResumeCardProps) => {
  return <div>{resume.file_name}</div>;
};

// ✅ Props typed explicitly
interface ResumeCardProps {
  resume: Resume;
  onDelete?: (id: string) => void;
}
```

#### Hooks

```typescript
// ✅ Custom hooks for any stateful logic
const useResumeUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const upload = async (file: File) => { ... };
  
  return { isUploading, error, upload };
};
```

#### API Calls

```typescript
// ✅ All API calls in services/ directory, typed with Zod schemas
const resumeSchema = z.object({
  id: z.string(),
  file_name: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  quality_score: z.number().nullable(),
});

type Resume = z.infer<typeof resumeSchema>;

export const getResume = async (id: string): Promise<Resume> => {
  const response = await apiClient.get(`/resumes/${id}`);
  return resumeSchema.parse(response.data.data);
};
```

#### Avoiding Common Pitfalls

```typescript
// ❌ Never use type assertion unsafely
const resume = data as Resume;  // bypasses type checking

// ✅ Use Zod parse for runtime validation
const resume = resumeSchema.parse(data);

// ❌ Never use useEffect for data fetching
useEffect(() => { fetchData(); }, []);

// ✅ Use React Query for data fetching
const { data, isLoading } = useQuery({ queryKey: ["resume", id], queryFn: () => getResume(id) });
```

---

## 6. Naming Conventions

### 6.1 Python

| Element | Convention | Example |
|---|---|---|
| Variables | `snake_case` | `user_id`, `session_status` |
| Functions | `snake_case` | `get_resume()`, `create_session()` |
| Classes | `PascalCase` | `ResumeService`, `SessionRepository` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE_BYTES` |
| Modules (files) | `snake_case` | `resume_service.py` |
| Pydantic models | `PascalCase` + suffix | `ResumeCreate`, `ResumeResponse` |
| Celery tasks | `snake_case` | `evaluate_answer_task` |

### 6.2 TypeScript / React

| Element | Convention | Example |
|---|---|---|
| Variables/functions | `camelCase` | `sessionId`, `getResume()` |
| React components | `PascalCase` | `ResumeCard`, `InterviewSession` |
| Custom hooks | `camelCase` with `use` prefix | `useResumeUpload`, `useSessionTimer` |
| Interfaces/types | `PascalCase` | `Resume`, `SessionConfig` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE_MB` |
| Files (components) | `PascalCase.tsx` | `ResumeCard.tsx` |
| Files (non-component) | `camelCase.ts` | `resumeService.ts`, `useResume.ts` |
| CSS class names (Tailwind) | Utility class strings | (no custom class names needed) |

### 6.3 Database (MongoDB)

| Element | Convention | Example |
|---|---|---|
| Collection names | `snake_case` plural | `face_analyses`, `audit_logs` |
| Field names | `snake_case` | `user_id`, `created_at` |
| Index names | `idx_{collection}_{fields}` | `idx_users_email_unique` |
| Enum values (string) | `snake_case` | `"in_progress"`, `"strong_hire"` |

### 6.4 API Endpoints

| Element | Convention | Example |
|---|---|---|
| Resources | lowercase plural noun | `/sessions`, `/resumes` |
| Sub-resources | `/parent/{id}/child` | `/sessions/{id}/answers` |
| Actions (non-CRUD) | Verb as sub-resource | `/sessions/{id}/complete` |
| Query params | `snake_case` | `?sort_by=created_at` |

---

## 7. Linting and Formatting

### 7.1 Backend

#### Ruff (Linter)

```bash
# Run linter
cd backend && ruff check .

# Auto-fix fixable issues
cd backend && ruff check --fix .
```

**Ruff configuration (in `pyproject.toml`):**
```toml
[tool.ruff]
target-version = "py311"
line-length = 88
select = ["E", "F", "I", "N", "W", "UP", "B", "ANN"]
ignore = ["ANN101", "ANN102"]

[tool.ruff.isort]
known-first-party = ["app"]
```

#### Black (Formatter)

```bash
# Format all files
cd backend && black .

# Check without modifying (used in CI)
cd backend && black --check .
```

#### Mypy (Type Checker)

```bash
cd backend && mypy app --ignore-missing-imports
```

**mypy configuration:**
```toml
[tool.mypy]
python_version = "3.11"
strict = true
ignore_missing_imports = true
```

### 7.2 Frontend

#### ESLint (Linter)

```bash
cd frontend && npm run lint

# Auto-fix
cd frontend && npm run lint:fix
```

**ESLint configuration (`.eslintrc.json`):**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

#### Prettier (Formatter)

```bash
cd frontend && npm run format

# Check without modifying (CI)
cd frontend && npm run format:check
```

**Prettier configuration (`.prettierrc`):**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

#### TypeScript Type Check

```bash
cd frontend && npx tsc --noEmit
```

### 7.3 Pre-commit Hooks

Pre-commit hooks run automatically before `git commit`. Install via:

```bash
# Root directory
pip install pre-commit
pre-commit install
```

`.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v4.0.0-alpha.8
    hooks:
      - id: prettier
        files: \.(ts|tsx|json|md)$
```

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

```
         ┌──────────┐
         │   E2E    │  (Playwright, few tests, slow)
         │  Tests   │
        ─┴──────────┴─
       ┌──────────────┐
       │  Integration │  (pytest + httpx, medium coverage)
       │    Tests     │
      ─┴──────────────┴─
     ┌──────────────────┐
     │   Unit Tests     │  (pytest / vitest, broad coverage)
     │ (largest volume) │
    ─┴──────────────────┴─
```

### 8.2 Backend Testing (pytest)

#### Test Directory Structure

```
backend/tests/
├── unit/
│   ├── test_auth_service.py
│   ├── test_resume_parser.py
│   ├── test_hirescore_engine.py
│   └── test_validators.py
├── integration/
│   ├── test_auth_router.py
│   ├── test_resume_router.py
│   ├── test_session_router.py
│   └── test_report_router.py
├── fixtures/
│   ├── sample_resume.pdf
│   └── sample_audio.webm
└── conftest.py
```

#### Unit Test Conventions

```python
# tests/unit/test_hirescore_engine.py

import pytest
from app.services.hirescore.engine import compute_composite_score

class TestHireScoreEngine:
    def test_compute_score_all_dimensions_present(self):
        """All four dimensions should produce a weighted composite."""
        result = compute_composite_score(
            technical_score=80,
            communication_score=70,
            confidence_score=60,
            presence_score=75,
        )
        assert result.composite_score == pytest.approx(73.25, abs=0.01)
        assert result.recommendation == "hire"

    def test_compute_score_below_threshold_returns_no_hire(self):
        result = compute_composite_score(30, 40, 35, 40)
        assert result.recommendation == "no_hire"

    @pytest.mark.parametrize("score,expected", [
        (90, "strong_hire"),
        (75, "hire"),
        (55, "hold"),
        (30, "no_hire"),
    ])
    def test_recommendation_thresholds(self, score, expected):
        result = compute_composite_score(score, score, score, score)
        assert result.recommendation == expected
```

#### Integration Test Conventions

```python
# tests/integration/test_auth_router.py

import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
class TestAuthRouter:
    async def test_register_creates_user(self, async_client: AsyncClient):
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "SecurePass123",
            "full_name": "Test User",
        })
        assert response.status_code == 201
        data = response.json()["data"]
        assert data["email"] == "test@example.com"
        assert "id" in data
        assert "password" not in data  # never expose password

    async def test_register_duplicate_email_returns_409(self, async_client, test_user):
        response = await async_client.post("/api/v1/auth/register", json={
            "email": test_user.email,  # already registered
            "password": "SecurePass123",
            "full_name": "Another User",
        })
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"
```

#### Running Tests

```bash
# All tests
cd backend && pytest

# With coverage
cd backend && pytest --cov=app --cov-report=html

# Unit tests only
cd backend && pytest tests/unit/

# Integration tests only
cd backend && pytest tests/integration/

# Single test file
cd backend && pytest tests/unit/test_hirescore_engine.py -v

# Specific test
cd backend && pytest tests/unit/test_hirescore_engine.py::TestHireScoreEngine::test_compute_score_all_dimensions_present -v
```

#### Coverage Requirements

| Module | Minimum Coverage |
|---|---|
| Auth service | 90% |
| HireScore engine | 90% |
| Resume parser | 80% |
| API routers | 80% |
| All other modules | 75% |

### 8.3 Frontend Testing (Vitest + React Testing Library)

#### Test Directory Structure

Tests colocated with their components:

```
src/features/hirescore/
├── components/
│   ├── ScoreRadar.tsx
│   └── ScoreRadar.test.tsx
├── hooks/
│   ├── useHireScore.ts
│   └── useHireScore.test.ts
└── services/
    ├── hireScorerService.ts
    └── hireScorerService.test.ts
```

#### Component Test Conventions

```typescript
// ScoreRadar.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreRadar } from "./ScoreRadar";

const mockScore = {
  composite_score: 72,
  recommendation: "hire",
  dimensions: {
    technical: { score: 75, label: "Good" },
    communication: { score: 71, label: "Good" },
    confidence: { score: 68, label: "Moderate" },
    presence: { score: 72, label: "Good" },
  },
};

describe("ScoreRadar", () => {
  it("renders the composite score", () => {
    render(<ScoreRadar score={mockScore} />);
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("displays the hire recommendation", () => {
    render(<ScoreRadar score={mockScore} />);
    expect(screen.getByText("Hire")).toBeInTheDocument();
  });
});
```

#### Running Frontend Tests

```bash
cd frontend && npm run test           # Watch mode
cd frontend && npm run test:run       # Single run (CI)
cd frontend && npm run test:coverage  # With coverage
```

### 8.4 CI Test Requirements

Every PR must pass:

```yaml
# GitHub Actions test step
- Backend: pytest with --cov, coverage ≥ 75%
- Frontend: vitest --run, coverage ≥ 70%
- Backend: ruff check (no errors)
- Backend: black --check (no changes)
- Backend: mypy (no errors)
- Frontend: eslint (no errors)
- Frontend: tsc --noEmit (no errors)
- Frontend: prettier --check (no changes)
```

---

## 9. Commit Message Convention

GetHire follows **Conventional Commits** (https://www.conventionalcommits.org).

### 9.1 Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### 9.2 Types

| Type | Use When |
|---|---|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `docs` | Documentation changes only |
| `style` | Formatting, no logic change |
| `refactor` | Restructuring code, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Build tools, dependencies, config |
| `perf` | Performance improvement |
| `ci` | CI/CD configuration changes |

### 9.3 Scopes

Use the module name as scope:

```
auth, resume, interview, evaluation, facesense, voicesense,
hirescore, reports, frontend, backend, database, docker, ci
```

### 9.4 Examples

```bash
# ✅ Good commit messages
feat(auth): implement JWT refresh token rotation
fix(resume): handle empty PDF files with proper error response
feat(facesense): add TensorFlow MobileNet emotion classifier
test(hirescore): add parametrized tests for recommendation thresholds
chore(deps): upgrade pydantic to 2.7.0
docs(api): add voice analysis endpoint examples
refactor(interview): extract question generator into separate module
ci: add mypy type checking to GitHub Actions workflow

# ❌ Bad commit messages
fixed stuff
WIP
updates
fix bug in auth
```

### 9.5 Breaking Changes

Breaking changes must be noted in the footer:

```
feat(api): rename session_id to id in all response schemas

BREAKING CHANGE: All API response bodies now use "id" instead of
"session_id". Frontend must be updated to use the new field name.
```

---

## 10. Pull Request Process

### 10.1 PR Requirements

Every PR must:

- [ ] Have a clear title following the commit message convention
- [ ] Include a description explaining *what* and *why* (not just *how*)
- [ ] Reference the related issue if applicable (`Closes #123`)
- [ ] Pass all CI checks (lint, types, tests, coverage)
- [ ] Have at least **1 reviewer approval**
- [ ] Have no unresolved review comments
- [ ] Be squash-merged (not merge commit)

### 10.2 PR Description Template

```markdown
## Summary
<!-- What does this PR do? -->

## Motivation
<!-- Why is this change needed? -->

## Changes
<!-- List the main changes made -->

- 
- 

## Testing
<!-- How was this tested? -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing done

## Screenshots (if UI changes)
<!-- Include before/after screenshots -->

## Checklist
- [ ] Code follows the coding standards in DEVELOPMENT_GUIDE.md
- [ ] Tests pass locally
- [ ] No sensitive data or secrets in the code
- [ ] Documentation updated if required
```

### 10.3 Review Turnaround

- Reviewers should provide feedback within **1 business day**
- Authors should address review comments within **1 business day**
- PRs idle for 3+ days with no activity are flagged for discussion

---

## 11. Definition of Done

A feature is considered **done** only when ALL of the following are true:

### Code Quality
- [ ] Code passes all linting checks (Ruff/ESLint) with zero errors
- [ ] Code passes all type checks (mypy/tsc) with zero errors
- [ ] Code is formatted correctly (Black/Prettier)
- [ ] No `TODO`, `FIXME`, or `HACK` comments left without an issue reference

### Testing
- [ ] Unit tests written for all business logic
- [ ] Integration tests written for all new API endpoints
- [ ] All tests pass
- [ ] Code coverage meets or exceeds module requirements
- [ ] Edge cases and error paths tested

### Documentation
- [ ] API endpoints documented in `API_SPEC.md` if new endpoints added
- [ ] Database schema updated in `DATABASE.md` if collections changed
- [ ] Architecture decisions documented in code comments or architecture records
- [ ] `CHANGELOG.md` (future) entry added

### Security
- [ ] No secrets hardcoded in code
- [ ] All new inputs validated via Pydantic
- [ ] New endpoints have correct authentication requirements
- [ ] Resource ownership checks implemented for user data
- [ ] Security checklist in `SECURITY.md` verified

### Review
- [ ] PR opened with full description
- [ ] At least 1 reviewer approved
- [ ] All review comments resolved
- [ ] CI pipeline green

---

## 12. Environment Variable Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_NAME` | No | `GetHire` | Application name |
| `APP_VERSION` | No | `1.0.0` | Application version |
| `ENVIRONMENT` | Yes | — | `development` \| `staging` \| `production` |
| `DEBUG` | No | `false` | Enable debug mode |
| `SECRET_KEY` | Yes | — | JWT signing secret (min 32 chars) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `15` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token TTL |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `MONGODB_DB_NAME` | No | `gethire` | MongoDB database name |
| `REDIS_URL` | Yes | — | Redis connection URL |
| `OLLAMA_BASE_URL` | No | `http://localhost:11434` | Ollama API base URL |
| `PRIMARY_MODEL` | No | `qwen2.5:7b` | Primary LLM model name |
| `FALLBACK_MODEL` | No | `llama3.2:3b` | Fallback LLM model name |
| `LLM_TIMEOUT_SECONDS` | No | `10` | LLM request timeout |
| `UPLOAD_DIR` | No | `/tmp/gethire/uploads` | File upload directory |
| `MAX_UPLOAD_SIZE_MB` | No | `5` | Max file upload size |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated allowed origins |
| `CELERY_BROKER_URL` | No | Same as `REDIS_URL` | Celery broker URL |
| `CELERY_RESULT_BACKEND` | No | Same as `REDIS_URL` | Celery result backend URL |
| `FEATURE_FACESENSE_ENABLED` | No | `true` | Enable FaceSense module |
| `FEATURE_VOICESENSE_ENABLED` | No | `true` | Enable VoiceSense module |
| `SMTP_HOST` | No | — | Email server host |
| `SMTP_PORT` | No | `587` | Email server port |
| `SMTP_USER` | No | — | Email auth username |
| `SMTP_PASSWORD` | No | — | Email auth password |
| `FROM_EMAIL` | No | — | Sender email address |
| `LOG_LEVEL` | No | `info` | Logging level |

---

## 13. Makefile Commands

Run `make help` to see all available commands.

```makefile
# Development
make dev             # Start all services (docker + backend + frontend)
make dev-backend     # Start only the backend (uvicorn + celery)
make dev-frontend    # Start only the frontend (vite dev server)
make dev-infra       # Start only docker infra (mongo + redis)

# Testing
make test            # Run all tests
make test-backend    # Run backend tests
make test-frontend   # Run frontend tests
make test-coverage   # Run tests with coverage report

# Linting
make lint            # Run all linters
make lint-backend    # Run ruff + mypy
make lint-frontend   # Run eslint + tsc

# Formatting
make format          # Format all code
make format-check    # Check formatting without modifying

# Database
make db-reset        # Drop and recreate dev database with indexes
make db-seed         # Seed database with test data
make db-migrate      # Apply any pending schema changes

# Docker
make build           # Build Docker images
make up              # Start all Docker services
make down            # Stop all Docker services
make logs            # Follow logs from all services

# Ollama
make models-pull     # Pull required AI models (qwen2.5:7b, llama3.2:3b)
make models-list     # List available models

# Utilities
make clean           # Remove build artifacts and caches
make help            # Show all available commands
```

---

## 14. Debugging Guide

### 14.1 Backend Debugging

#### Enable Debug Mode

```bash
# In .env
DEBUG=true
LOG_LEVEL=debug
```

#### FastAPI Debugger (VS Code)

```json
// .vscode/launch.json
{
  "name": "FastAPI Debug",
  "type": "python",
  "request": "launch",
  "module": "uvicorn",
  "args": ["app.main:app", "--reload", "--port", "8000"],
  "jinja": true,
  "env": { "DEBUG": "true" }
}
```

#### Inspect a Celery Task

```bash
# Check task status
cd backend && celery -A app.workers.celery_app inspect active

# Purge all pending tasks (dev only)
cd backend && celery -A app.workers.celery_app purge
```

#### MongoDB Queries

```bash
# Connect to dev database
docker exec -it gethire-mongo mongosh gethire

# Inspect a collection
db.sessions.find({ user_id: ObjectId("...") }).pretty()

# Check index usage
db.sessions.explain("executionStats").find({ user_id: ObjectId("...") })
```

### 14.2 Frontend Debugging

#### React DevTools
Install the React DevTools browser extension to inspect component state and props.

#### Zustand State Inspector

```typescript
// In development, use the Zustand devtools middleware
import { devtools } from "zustand/middleware";

const useSessionStore = create<SessionStore>()(
  devtools(
    (set) => ({ ... }),
    { name: "SessionStore" }
  )
);
```

#### API Request Debugging

```typescript
// In axiosClient.ts — log all requests in development
if (import.meta.env.DEV) {
  axios.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}
```

### 14.3 Common Issues and Fixes

| Issue | Symptom | Fix |
|---|---|---|
| Ollama not responding | `AI_UNAVAILABLE` in API | Run `ollama serve` or `docker-compose restart ollama` |
| Model not found | `404` from Ollama | Run `ollama pull qwen2.5:7b` |
| MongoDB connection refused | `INTERNAL_ERROR` on startup | Ensure `MONGODB_URI` is correct and Atlas allowlist includes your IP |
| Redis connection refused | Celery worker crash | `docker-compose up -d redis` |
| JWT decode error | `INVALID_TOKEN` on valid token | `SECRET_KEY` mismatch — check `.env` matches backend config |
| CORS error | Browser blocks API call | Add frontend URL to `CORS_ORIGINS` in `.env` |
| File upload fails | `INVALID_FILE_TYPE` | Verify the file is a real PDF (check magic bytes with `file -b resume.pdf`) |

---

> **Related Documents:**  
> [README.md](./README.md) · [TRD.md](./TRD.md) · [SECURITY.md](./SECURITY.md) · [API_SPEC.md](./API_SPEC.md) · [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
