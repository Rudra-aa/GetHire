# GetHire — Technical Requirements Document (TRD)

> **Document Version:** 1.0.0  
> **Status:** Approved for Development  
> **Last Updated:** 2026-08-09  
> **Author:** Engineering Team  
> **Related Documents:** [PRD.md](./PRD.md) · [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md)

---

## Table of Contents

1. [Technology Choices and Rationale](#1-technology-choices-and-rationale)
2. [Project Structure](#2-project-structure)
3. [Module Breakdown](#3-module-breakdown)
4. [AI Component Design](#4-ai-component-design)
5. [Development Strategy](#5-development-strategy)
6. [Performance Goals](#6-performance-goals)
7. [Dependency Management](#7-dependency-management)
8. [Configuration Strategy](#8-configuration-strategy)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Logging Strategy](#10-logging-strategy)

---

## 1. Technology Choices and Rationale

### 1.1 Frontend Stack

#### React 18 + TypeScript (Strict)

**Choice:** React with TypeScript in strict mode.  
**Rationale:**
- React's component model maps cleanly to the interview UI (question panel, emotion overlay, score dashboard)
- TypeScript strict mode eliminates entire classes of runtime bugs before deployment
- Mature ecosystem with strong tooling (Vite, React DevTools, React Query)
- Team familiarity reduces onboarding cost

**Rejected alternatives:**
- *Vue 3:* Smaller ecosystem, fewer AI/visualization libraries
- *Next.js SSR:* Interview sessions are fully client-side; SSR adds complexity without benefit for this use case

#### Tailwind CSS v3

**Choice:** Tailwind CSS with a custom design token configuration.  
**Rationale:**
- Utility-first approach eliminates CSS naming debates and specificity wars
- JIT mode generates minimal CSS bundles for production
- Consistent design constraints prevent visual inconsistency across components

#### Framer Motion

**Choice:** Framer Motion for all animations.  
**Rationale:**
- Declarative animation API integrates naturally with React state changes
- Gesture support needed for the interactive interview UI
- Layout animations required for the score reveal sequence

#### Three.js

**Choice:** Three.js for the landing page hero and HireScore 3D visualization.  
**Rationale:**
- Unique visual differentiation vs. competitor platforms
- Used sparingly (2 pages only) to avoid performance overhead
- Replaced with a static fallback on mobile

#### Zustand (State Management)

**Choice:** Zustand over Redux Toolkit.  
**Rationale:**
- Minimal boilerplate for moderate state complexity
- Interview session state (current question, timer, recording status) is localized — no need for Redux's global architecture
- Easier to test with standard unit test approaches

### 1.2 Backend Stack

#### FastAPI

**Choice:** FastAPI over Django REST Framework or Flask.  
**Rationale:**
- Native async/await support — critical for concurrent AI inference requests
- Automatic OpenAPI schema generation (no manual Swagger maintenance)
- Pydantic v2 integration for schema validation is best-in-class
- 3–10x higher throughput than Flask for async-heavy workloads

**Rejected alternatives:**
- *Django REST Framework:* Synchronous by default; ORM not compatible with MongoDB natively
- *Flask:* Lacks built-in validation, async support, and OpenAPI integration

#### Motor + Beanie (MongoDB ODM)

**Choice:** Motor (async MongoDB driver) with Beanie (ODM layer).  
**Rationale:**
- Motor provides native async support compatible with FastAPI's event loop
- Beanie adds document modeling with Pydantic — consistent schema validation across backend
- Avoids synchronous PyMongo blocking the event loop

#### Celery + Redis

**Choice:** Celery task queue backed by Redis.  
**Rationale:**
- AI inference (LLM, evaluation, PDF generation) can take 5–30 seconds — must be async
- Celery provides retry logic, ETA scheduling, and task result storage
- Redis doubles as a caching layer and message broker

### 1.3 AI Stack

#### Ollama

**Choice:** Ollama as the local LLM runtime.  
**Rationale:**
- Runs Qwen and Llama models locally — zero API cost and zero data leakage
- Simple HTTP API compatible with FastAPI service layer
- Supports model hot-swapping without code changes
- GPU acceleration via CUDA if available; CPU fallback for dev

#### Qwen2.5:7b (Primary LLM)

**Choice:** Qwen2.5 7B parameter model.  
**Rationale:**
- Excellent multilingual text comprehension for resume parsing tasks
- Strong instruction-following for structured output (JSON schemas)
- 7B parameter size balances quality and inference speed on available hardware
- Outperforms Llama 3.1 7B on coding and technical reasoning benchmarks

#### Llama 3.2:3b (Secondary / Fallback LLM)

**Choice:** Llama 3.2 3B as a fast fallback.  
**Rationale:**
- 3B size ensures sub-3-second responses on CPU-only deployments
- Used when Qwen is under load or unavailable
- Acceptable quality for behavioral question generation

#### TensorFlow + OpenCV (FaceSense)

**Choice:** TensorFlow for emotion classification model; OpenCV for face detection.  
**Rationale:**
- TensorFlow Lite allows serving a pre-trained MobileNet-based emotion classifier efficiently
- OpenCV's Haar cascades or MTCNN provide reliable face bounding box detection
- Combination is well-documented with extensive academic reference implementations

#### PyTorch + Librosa (VoiceSense)

**Choice:** PyTorch for voice feature models; Librosa for signal processing.  
**Rationale:**
- Librosa provides battle-tested audio feature extraction (MFCCs, spectrograms, pitch, tempo)
- PyTorch enables fine-tuning pre-trained wav2vec2 or Whisper models for transcription
- More flexible than TensorFlow for experimental audio model architectures

### 1.4 Database

#### MongoDB + MongoDB Atlas

**Choice:** MongoDB as the primary database; Atlas for managed hosting.  
**Rationale:**
- Document model naturally represents resume JSON, interview session state, and evaluation results — no ORM impedance mismatch
- Schema flexibility allows iterating on the data model without migrations in early development
- Atlas provides free-tier hosting with built-in replication, backups, and geo-distribution
- Atlas Search for future full-text search on resumes and feedback

#### Redis

**Choice:** Redis for caching and Celery broker.  
**Rationale:**
- O(1) access for frequently read data (user sessions, active interview state)
- Native TTL for token blacklists and rate-limit counters
- Pub/Sub capability for future WebSocket notification support

---

## 2. Project Structure

### 2.1 Root Directory

```
gethire/
├── docs/                    # Engineering documentation
├── frontend/                # React + TypeScript SPA
├── backend/                 # FastAPI application
├── ai/                      # AI service modules (imported by backend)
├── docker-compose.yml       # Development environment orchestration
├── docker-compose.prod.yml  # Production environment overrides
├── Makefile                 # Developer command shortcuts
├── .env.example             # Environment variable template
├── .gitignore
└── README.md
```

### 2.2 Frontend Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/              # Static images, fonts, icons
│   ├── components/          # Shared, reusable UI components
│   │   ├── ui/              # Primitive components (Button, Input, Modal)
│   │   ├── layout/          # Header, Sidebar, Footer
│   │   └── feedback/        # Toast, Alert, Spinner
│   ├── features/            # Feature-scoped components and logic
│   │   ├── auth/
│   │   ├── resume/
│   │   ├── interview/
│   │   ├── evaluation/
│   │   ├── facesense/
│   │   ├── voicesense/
│   │   ├── hirescore/
│   │   └── reports/
│   ├── hooks/               # Custom React hooks
│   ├── layouts/             # Page layout wrappers
│   ├── lib/                 # Third-party library configs (axios, framer)
│   ├── pages/               # Route-level page components
│   ├── services/            # API call functions
│   ├── store/               # Zustand stores
│   ├── types/               # Shared TypeScript type definitions
│   ├── utils/               # Pure utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── tailwind.config.ts
```

### 2.3 Backend Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py          # Aggregates all module routers
│   │       ├── auth/
│   │       │   ├── router.py
│   │       │   ├── schemas.py
│   │       │   ├── service.py
│   │       │   └── dependencies.py
│   │       ├── resume/
│   │       │   ├── router.py
│   │       │   ├── schemas.py
│   │       │   └── service.py
│   │       ├── interview/
│   │       ├── evaluation/
│   │       ├── facesense/
│   │       ├── voicesense/
│   │       ├── hirescore/
│   │       └── reports/
│   ├── core/
│   │   ├── config.py              # Pydantic Settings (env vars)
│   │   ├── security.py            # JWT, password hashing
│   │   ├── exceptions.py          # Custom exception classes
│   │   ├── middleware.py          # CORS, rate limiting, logging
│   │   └── dependencies.py        # Shared FastAPI dependencies
│   ├── db/
│   │   ├── client.py              # Motor client singleton
│   │   └── repositories/          # Database access layer
│   │       ├── base.py
│   │       ├── user_repository.py
│   │       ├── session_repository.py
│   │       └── report_repository.py
│   ├── models/                    # Beanie document models
│   ├── schemas/                   # Shared Pydantic schemas
│   ├── services/                  # Business logic layer
│   ├── workers/
│   │   ├── celery_app.py          # Celery configuration
│   │   └── tasks/                 # Background task definitions
│   └── utils/
│       ├── file_handler.py
│       ├── pdf_generator.py
│       └── validators.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── alembic/ (future migration support)
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
└── .env.example
```

### 2.4 AI Module Structure

```
ai/
├── resume_parser/
│   ├── __init__.py
│   ├── extractor.py           # PDF text extraction
│   ├── parser.py              # LLM-based structured extraction
│   ├── quality_scorer.py      # Resume quality scoring
│   └── schemas.py             # Output type definitions
├── question_generator/
│   ├── __init__.py
│   ├── generator.py           # LLM prompt orchestration
│   ├── prompt_templates.py    # Versioned prompt templates
│   ├── adaptive.py            # Follow-up question logic
│   └── schemas.py
├── answer_evaluator/
│   ├── __init__.py
│   ├── evaluator.py
│   ├── rubrics.py             # Scoring rubric definitions
│   ├── transcriber.py         # Whisper / wav2vec2 transcription
│   └── schemas.py
├── facesense/
│   ├── __init__.py
│   ├── detector.py            # Face detection (OpenCV)
│   ├── classifier.py          # Emotion classification (TensorFlow)
│   ├── aggregator.py          # Session-level confidence scoring
│   └── schemas.py
├── voicesense/
│   ├── __init__.py
│   ├── processor.py           # Librosa feature extraction
│   ├── scorer.py              # Voice confidence scoring
│   ├── filler_detector.py     # Filler word detection
│   └── schemas.py
└── hirescore/
    ├── __init__.py
    ├── engine.py              # Composite score computation
    ├── weights.py             # Configurable dimension weights
    └── schemas.py
```

---

## 3. Module Breakdown

### 3.1 Authentication Module

| Property | Detail |
|---|---|
| **Responsibilities** | Registration, login, logout, token refresh, password reset, RBAC |
| **Dependencies** | MongoDB (users collection), Redis (token blacklist) |
| **Inputs** | Email, password, tokens |
| **Outputs** | JWT access token, refresh token, user profile |
| **Key Technologies** | PyJWT, Passlib (bcrypt), FastAPI OAuth2PasswordBearer |

### 3.2 Resume Intelligence Module

| Property | Detail |
|---|---|
| **Responsibilities** | PDF upload, parsing, skill extraction, resume quality scoring |
| **Dependencies** | Ollama (Qwen), PyMuPDF (PDF text extraction), MongoDB |
| **Inputs** | PDF file (binary upload) |
| **Outputs** | Structured JSON (skills, projects, experience, education, quality score) |
| **Key Technologies** | PyMuPDF, Pdfminer, Qwen2.5 via Ollama HTTP API |

### 3.3 Interview Engine Module

| Property | Detail |
|---|---|
| **Responsibilities** | Question generation, session lifecycle, adaptive follow-ups |
| **Dependencies** | Resume Intelligence module output, Ollama (Qwen/Llama), MongoDB |
| **Inputs** | Parsed resume JSON, interview type, session config |
| **Outputs** | Ordered question list, session state object |
| **Key Technologies** | Qwen2.5 via Ollama, Celery for pre-generation |

### 3.4 Evaluation Engine Module

| Property | Detail |
|---|---|
| **Responsibilities** | Audio transcription, answer scoring, feedback generation |
| **Dependencies** | VoiceSense (for transcription), Ollama (Qwen), MongoDB |
| **Inputs** | Audio recording or transcript, question context |
| **Outputs** | Score (0–10), rationale, missing concepts, model answer |
| **Key Technologies** | Whisper (via PyTorch), Qwen2.5 for evaluation |

### 3.5 FaceSense Module

| Property | Detail |
|---|---|
| **Responsibilities** | Frame capture, face detection, emotion classification, confidence scoring |
| **Dependencies** | OpenCV (capture), TensorFlow (classification), MongoDB |
| **Inputs** | JPEG/PNG video frames (base64 or binary) |
| **Outputs** | Emotion label + confidence, session emotion timeline |
| **Key Technologies** | OpenCV Haar/MTCNN, TensorFlow MobileNet emotion model |

### 3.6 VoiceSense Module

| Property | Detail |
|---|---|
| **Responsibilities** | Audio feature extraction, transcription, voice confidence scoring |
| **Dependencies** | Librosa, PyTorch (Whisper), MongoDB |
| **Inputs** | Audio file (WAV, WebM) |
| **Outputs** | Transcription, WPM, pitch stats, filler word count, voice score |
| **Key Technologies** | Librosa, OpenAI Whisper (local), PyTorch |

### 3.7 HireScore Module

| Property | Detail |
|---|---|
| **Responsibilities** | Aggregate all module scores into a composite hiring readiness score |
| **Dependencies** | Evaluation, FaceSense, VoiceSense module outputs |
| **Inputs** | Dimension scores (technical, communication, confidence, presence) |
| **Outputs** | Composite score (0–100), recommendation label, improvement areas |
| **Key Technologies** | Pure Python, configurable weight file |

### 3.8 Report Engine Module

| Property | Detail |
|---|---|
| **Responsibilities** | PDF generation, report storage, download link creation |
| **Dependencies** | All module outputs, MongoDB, file storage |
| **Inputs** | Completed session data aggregate |
| **Outputs** | PDF binary, secure download URL |
| **Key Technologies** | ReportLab or WeasyPrint, MinIO/S3 for storage |

---

## 4. AI Component Design

### 4.1 LLM Communication Pattern

All LLM interactions follow a consistent pattern:

```
Request → Prompt Builder → Ollama HTTP API → Response Parser → Structured Output
```

1. **Prompt Builder:** Constructs structured prompts using versioned templates (stored in `prompt_templates.py`)
2. **Ollama HTTP API:** `POST /api/generate` with `model`, `prompt`, `stream=false`, `format="json"`
3. **Response Parser:** Validates JSON output against Pydantic schema; retries on parse failure (max 3 retries)
4. **Fallback:** If Qwen times out after 10s, retry with Llama 3.2:3b

### 4.2 Prompt Design Principles

- All prompts include a **system role definition** that sets context
- All prompts request **JSON output only** with a defined schema
- Prompts are versioned with a `v1/` prefix to allow non-breaking prompt updates
- No user-provided content is injected into the system prompt — only the user prompt portion
- Each prompt template is unit-tested for expected output structure

### 4.3 FaceSense Pipeline

```
Webcam Frame (JPEG, ~30fps on client)
       │
       ▼ (client-side throttling: 1 frame / 3 seconds sent to backend)
POST /api/v1/facesense/analyze
       │
       ▼
OpenCV → Face Detection (bounding box)
       │
       ▼
TensorFlow → MobileNet Emotion Classifier
       │
       ▼
{emotion: "confident", confidence: 0.87}
       │
       ▼
MongoDB → Append to session emotion_log[]
```

### 4.4 VoiceSense Pipeline

```
Browser MediaRecorder API → WebM Audio Blob
       │
       ▼
POST /api/v1/voicesense/analyze
       │
       ├─→ Whisper (PyTorch) → Transcription text
       │
       └─→ Librosa → {wpm, pitch_mean, pitch_std, pauses, filler_count}
              │
              ▼
         Voice Score (0–100)
              │
              ▼
         MongoDB → answer.voice_analysis
```

### 4.5 Offline / Degraded Mode

| Scenario | Behavior |
|---|---|
| Ollama not running | Return 503 with `AI_UNAVAILABLE` error code; surface retry UI |
| Qwen model not pulled | Fallback to Llama 3.2:3b automatically |
| Webcam not available | Disable FaceSense; session proceeds with text-only mode |
| Microphone not available | Text input fallback for answer submission |
| Audio transcription fails | Return answer as empty string; mark answer as `transcription_failed` |

---

## 5. Development Strategy

### 5.1 Development Phases

#### Phase 1 — Infrastructure (Week 1)
- Docker Compose environment with MongoDB, Redis, Ollama
- FastAPI application skeleton with health check endpoint
- React + Vite + TypeScript + Tailwind scaffold
- CI/CD pipeline configuration (GitHub Actions)
- Environment variable management

#### Phase 2 — Auth + Resume (Weeks 2–3)
- Complete authentication module (register, login, refresh, logout)
- Resume upload API (multipart/form-data)
- PDF text extraction pipeline
- LLM-based skill and project extraction
- Resume display in frontend

#### Phase 3 — Interview Core (Weeks 4–5)
- Question generation from resume data
- Interview session API (create, fetch question, submit answer)
- Frontend interview flow (question display, audio recording, timer)
- Answer storage and evaluation pipeline

#### Phase 4 — Multimodal (Weeks 6–7)
- FaceSense backend API and TensorFlow model integration
- VoiceSense backend API and Librosa/Whisper integration
- Frontend webcam + microphone capture components
- Real-time frame streaming to backend

#### Phase 5 — Scoring + Reports (Week 8)
- HireScore computation engine
- PDF report generation
- Analytics dashboard (frontend)
- Score history and trend visualization

#### Phase 6 — Polish + Deploy (Week 9)
- End-to-end integration testing
- Performance optimization (caching, query optimization)
- Docker production images
- Vercel (frontend) and Render (backend) deployment
- Final documentation review

### 5.2 API Versioning Strategy

- All API routes are prefixed with `/api/v1/`
- Breaking changes require a new version prefix (`/api/v2/`)
- Non-breaking additions (new fields, new endpoints) do not require version bump
- Deprecation notices added to response headers before removal

### 5.3 Feature Flag Strategy

- Feature flags stored in environment variables (`FEATURE_FACESENSE_ENABLED=true`)
- Backend respects flags and returns `feature_disabled` in endpoint metadata
- Frontend checks feature flags from `/api/v1/config` endpoint before rendering feature UI

---

## 6. Performance Goals

### 6.1 Latency Targets

| Operation | Target P50 | Target P95 |
|---|---|---|
| Health check (`GET /health`) | < 20 ms | < 50 ms |
| User login | < 100 ms | < 200 ms |
| Resume upload (2 MB PDF) | < 500 ms | < 1 s |
| Resume parsing (LLM) | < 4 s | < 8 s |
| Question generation (first Q) | < 5 s | < 8 s |
| Answer evaluation (per answer) | < 6 s | < 10 s |
| FaceSense frame analysis | < 50 ms | < 100 ms |
| VoiceSense audio analysis | < 3 s | < 6 s |
| HireScore computation | < 200 ms | < 500 ms |
| PDF report generation | < 8 s | < 15 s |

### 6.2 Throughput Targets

| Metric | Target |
|---|---|
| Concurrent active interview sessions | 50 (development target) |
| API requests per second (non-AI) | > 200 rps |
| Celery worker concurrency | 4 workers (configurable) |
| MongoDB connection pool size | 20 connections per pod |

### 6.3 Resource Budget

| Component | CPU | RAM |
|---|---|---|
| FastAPI backend | 0.5 vCPU | 512 MB |
| Ollama + Qwen 7B | 4 vCPU (or 1 GPU) | 8 GB |
| Celery worker | 1 vCPU | 1 GB |
| Redis | 0.25 vCPU | 256 MB |
| MongoDB | Atlas managed | Atlas managed |

---

## 7. Dependency Management

### 7.1 Backend Python Dependencies

```
# requirements.txt (production)
fastapi>=0.111.0
uvicorn[standard]>=0.29.0
motor>=3.4.0
beanie>=1.26.0
pydantic[email]>=2.7.0
pydantic-settings>=2.2.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
httpx>=0.27.0
celery[redis]>=5.4.0
redis>=5.0.4
pymupdf>=1.24.0
librosa>=0.10.2
torch>=2.3.0
transformers>=4.41.0
tensorflow>=2.16.0
opencv-python-headless>=4.9.0
reportlab>=4.2.0
structlog>=24.1.0

# requirements-dev.txt (development only)
pytest>=8.2.0
pytest-asyncio>=0.23.6
httpx>=0.27.0
ruff>=0.4.0
black>=24.4.0
mypy>=1.10.0
pytest-cov>=5.0.0
faker>=25.0.0
```

### 7.2 Frontend Node Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "framer-motion": "^11.2.0",
    "three": "^0.165.0",
    "zustand": "^4.5.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0",
    "react-query": "^5.39.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@types/react": "^18.3.0",
    "@types/three": "^0.165.0",
    "eslint": "^9.4.0",
    "@typescript-eslint/eslint-plugin": "^7.11.0",
    "prettier": "^3.3.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^16.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 8. Configuration Strategy

### 8.1 Environment Variables

All configuration is managed through environment variables, validated at startup via Pydantic Settings.

```python
# app/core/config.py — structure (not code)

class Settings:
    # Application
    APP_NAME: str = "GetHire"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str  # "development" | "staging" | "production"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str         # Min 32 chars, random
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    MONGODB_URI: str        # Atlas connection string
    MONGODB_DB_NAME: str = "gethire"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    PRIMARY_MODEL: str = "qwen2.5:7b"
    FALLBACK_MODEL: str = "llama3.2:3b"
    LLM_TIMEOUT_SECONDS: int = 10

    # Storage
    UPLOAD_DIR: str = "/tmp/gethire/uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    # Feature Flags
    FEATURE_FACESENSE_ENABLED: bool = True
    FEATURE_VOICESENSE_ENABLED: bool = True
```

### 8.2 Environment Profiles

| Environment | `.env` file | Ollama | MongoDB |
|---|---|---|---|
| Development | `.env.local` | localhost:11434 | Atlas free tier or local |
| Staging | CI secrets | Render service | Atlas M0 |
| Production | Render/Vercel secrets | Render service | Atlas M10+ |

---

## 9. Error Handling Strategy

### 9.1 Error Response Format

All API errors must follow a consistent JSON schema:

```json
{
  "error": {
    "code": "RESUME_PARSE_FAILED",
    "message": "Could not extract text from the uploaded PDF.",
    "details": {
      "file_name": "resume_v2.pdf",
      "file_size_bytes": 1048576
    },
    "request_id": "req_abc123",
    "timestamp": "2026-08-09T10:30:00Z"
  }
}
```

### 9.2 Error Code Registry

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body or query param failed Pydantic validation |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Valid token but insufficient role |
| `NOT_FOUND` | 404 | Resource does not exist |
| `FILE_TOO_LARGE` | 413 | Upload exceeds size limit |
| `INVALID_FILE_TYPE` | 415 | File MIME type not accepted |
| `RESUME_PARSE_FAILED` | 422 | PDF text extraction or LLM parsing failed |
| `AI_UNAVAILABLE` | 503 | Ollama service unreachable |
| `SESSION_NOT_FOUND` | 404 | Interview session ID does not exist |
| `SESSION_EXPIRED` | 410 | Session exceeded 24-hour inactivity limit |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 10. Logging Strategy

### 10.1 Log Structure

All logs are structured JSON using `structlog`. Each log entry includes:

```json
{
  "timestamp": "2026-08-09T10:30:00.123Z",
  "level": "info",
  "event": "answer_evaluated",
  "request_id": "req_abc123",
  "user_id": "usr_xyz789",
  "session_id": "sess_def456",
  "duration_ms": 4532,
  "score": 7.5,
  "module": "evaluation_engine"
}
```

### 10.2 Log Levels

| Level | Usage |
|---|---|
| `DEBUG` | Detailed diagnostic info (development only) |
| `INFO` | Normal operational events (request received, task completed) |
| `WARNING` | Degraded operation (LLM fallback triggered, slow response) |
| `ERROR` | Recoverable failures (parse error, AI timeout, DB query failed) |
| `CRITICAL` | System-level failures requiring immediate attention |

### 10.3 Sensitive Data Policy

- **Never log:** Passwords, JWT tokens, refresh tokens, full credit card numbers
- **Mask in logs:** Email addresses (show first 3 chars + `***`), file paths containing user IDs
- **Always log:** request_id, user_id (for tracing), session_id, error codes, durations

---

> **Related Documents:**  
> [PRD.md](./PRD.md) · [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [API_SPEC.md](./API_SPEC.md) · [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
