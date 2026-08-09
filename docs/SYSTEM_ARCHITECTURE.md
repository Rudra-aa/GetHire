# GetHire — System Architecture Document

> **Document Version:** 1.0.0  
> **Status:** Approved for Development  
> **Last Updated:** 2026-08-09  
> **Author:** Engineering Team  
> **Related Documents:** [TRD.md](./TRD.md) · [DATABASE.md](./DATABASE.md) · [API_SPEC.md](./API_SPEC.md)

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Module Communication](#2-module-communication)
3. [Data Flow](#3-data-flow)
4. [Sequence Diagrams](#4-sequence-diagrams)
5. [Component Responsibilities](#5-component-responsibilities)
6. [Service Boundaries](#6-service-boundaries)
7. [Infrastructure Architecture](#7-infrastructure-architecture)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Scalability Architecture](#9-scalability-architecture)
10. [Security Architecture](#10-security-architecture)

---

## 1. High-Level Architecture

GetHire follows a **modular monolith backend** pattern with a clear layered architecture. The AI inference layer is decoupled via an async task queue, enabling long-running AI jobs without blocking the API layer.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │               React SPA (Vercel CDN)                                 │   │
│  │  ┌─────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌─────────┐  │   │
│  │  │  Auth   │ │  Resume   │ │ Interview │ │FaceSense │ │  Score  │  │   │
│  │  │  Pages  │ │  Upload   │ │   Flow    │ │ Overlay  │ │Dashboard│  │   │
│  │  └─────────┘ └───────────┘ └───────────┘ └──────────┘ └─────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTPS / REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                              │
│                                                                             │
│         FastAPI Application  (Render — /api/v1/*)                          │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Middleware: CORS · Rate Limiting · JWT Validation · Request Log   │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└───┬──────────┬──────────┬──────────┬───────────┬──────────┬──────────┬──────┘
    │          │          │          │           │          │          │
    ▼          ▼          ▼          ▼           ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ ┌───────┐ ┌────────┐
│  Auth  │ │Resume│ │Interview │ │Evaluation│ │FaceSns│ │VoiceSs│ │HireSco │
│Service │ │ Svc  │ │  Service │ │ Service  │ │  Svc  │ │  Svc  │ │  +Rpt  │
└────┬───┘ └──┬───┘ └────┬─────┘ └─────┬────┘ └───┬───┘ └───┬───┘ └────┬───┘
     │        │           │             │           │         │           │
     └────────┴───────────┴─────────────┴───────────┴─────────┴───────────┘
                                        │
               ┌────────────────────────┼───────────────────────┐
               ▼                        ▼                        ▼
        ┌─────────────┐         ┌──────────────┐        ┌──────────────┐
        │  MongoDB    │         │    Redis      │        │   Celery     │
        │  Atlas      │         │   (Cache +   │        │   Workers    │
        │  (Primary   │         │    Broker)   │        │   (AI Tasks) │
        │  Database)  │         └──────────────┘        └──────┬───────┘
        └─────────────┘                                         │
                                                                ▼
                                                    ┌──────────────────────┐
                                                    │  Ollama AI Runtime   │
                                                    │  ┌────────────────┐  │
                                                    │  │  Qwen2.5:7b    │  │
                                                    │  │  Llama3.2:3b   │  │
                                                    │  └────────────────┘  │
                                                    │  ┌────────────────┐  │
                                                    │  │  TensorFlow    │  │
                                                    │  │  PyTorch       │  │
                                                    │  │  Whisper       │  │
                                                    │  └────────────────┘  │
                                                    └──────────────────────┘
```

---

## 2. Module Communication

### 2.1 Synchronous Communication (HTTP)

All API calls between the frontend and backend are synchronous HTTP/REST:

```
Frontend ──────── HTTP REST ─────────► FastAPI Backend
                  (JSON)
```

### 2.2 Asynchronous Communication (Celery)

Long-running AI operations are dispatched as Celery tasks:

```
FastAPI Service ──── enqueue ──────► Redis (broker)
                                           │
                                           ▼
                                  Celery Worker ──► Ollama / TensorFlow / Librosa
                                           │
                                           ▼
                                  Redis (result store) ◄── FastAPI polls or
                                                           client polls via WebSocket
```

### 2.3 Inter-Module Dependencies

```
Resume Intelligence
       │
       └─────────────────────────►  Interview Engine
                                           │
                             ┌─────────────┘
                             ▼
                      Evaluation Engine ◄──── VoiceSense (transcription)
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         FaceSense       VoiceSense    Evaluation
          scores           scores       scores
              │              │              │
              └──────────────┴──────────────┘
                             │
                             ▼
                       HireScore Engine
                             │
                             ▼
                       Report Engine
```

### 2.4 Data Ownership

| Module | Owns Collection | Reads From |
|---|---|---|
| Auth | `users` | — |
| Resume Intelligence | `resumes` | `users` |
| Interview Engine | `sessions`, `questions` | `resumes`, `users` |
| Evaluation Engine | `answers` | `sessions`, `questions` |
| FaceSense | `face_analyses` | `sessions` |
| VoiceSense | `voice_analyses` | `answers` |
| HireScore | `scores` | `answers`, `face_analyses`, `voice_analyses` |
| Report Engine | `reports` | All of the above |

---

## 3. Data Flow

### 3.1 Complete Interview Session Data Flow

```
1. RESUME UPLOAD
   Client ──[POST /resume/upload]──► Backend
         ◄──[resume_id, parse_status]──
   
   Background: PyMuPDF → Qwen2.5 → JSON extraction → MongoDB resumes

2. SESSION CREATE
   Client ──[POST /interview/sessions]──► Backend
         ◄──[session_id, first_question]──
   
   Background: Resume JSON → Qwen2.5 → question_list[] → MongoDB sessions

3. PER-QUESTION LOOP
   a. Client renders question
   
   b. Client captures audio → WebM blob
   
   c. FaceSense: Client sends JPEG frame every 3s
      Client ──[POST /facesense/analyze]──► Backend
            ◄──[emotion, confidence]──
      MongoDB: Append to face_analyses[session_id]
   
   d. Answer submit: Client sends audio blob
      Client ──[POST /interview/answers]──► Backend
            ◄──[answer_id, status: "processing"]──
      
      Celery Task:
        ├─ Whisper: WebM → transcript text
        ├─ Librosa: Extract voice features
        ├─ Qwen2.5: Evaluate transcript → score, rationale, missing_concepts
        └─ MongoDB: Write answer with full evaluation

4. SESSION COMPLETE
   Client ──[POST /interview/sessions/{id}/complete]──► Backend
         ◄──[session_status: "completed"]──
   
   Celery Task:
     ├─ Aggregate answer scores
     ├─ Aggregate face_analyses → confidence trend
     ├─ Aggregate voice_analyses → voice score
     ├─ HireScore Engine → composite score
     ├─ Report Engine → PDF generation
     └─ MongoDB: Write scores, reports

5. RESULTS FETCH
   Client ──[GET /hirescore/{session_id}]──► Backend
         ◄──[full score breakdown]──
   
   Client ──[GET /reports/{session_id}]──► Backend
         ◄──[report_url (signed S3 link)]──
```

---

## 4. Sequence Diagrams

### 4.1 Authentication Flow

```
Client              FastAPI             MongoDB           Redis
  │                    │                   │                │
  │──POST /register───►│                   │                │
  │                    │──validate email──►│                │
  │                    │◄──exists? false───│                │
  │                    │──hash password    │                │
  │                    │──insert user─────►│                │
  │                    │◄──user_id─────────│                │
  │◄──201 Created──────│                   │                │
  │                    │                   │                │
  │──POST /login───────►│                  │                │
  │                    │──find by email───►│                │
  │                    │◄──user doc────────│                │
  │                    │──verify password  │                │
  │                    │──sign JWT         │                │
  │                    │──sign refresh────────────────────►│
  │                    │  (store refresh                    │
  │                    │   in Redis TTL 7d)                 │
  │◄──access + refresh─│                   │                │
  │                    │                   │                │
  │──GET /protected────►│                  │                │
  │  Authorization:     │                  │                │
  │  Bearer <token>     │                  │                │
  │                    │──verify JWT       │                │
  │                    │──check blacklist────────────────►│
  │                    │◄──not blacklisted─────────────────│
  │◄──200 OK───────────│                   │                │
```

### 4.2 Resume Upload and Parsing Flow

```
Client         FastAPI       Celery Worker      Ollama         MongoDB
  │               │                │               │               │
  │─POST /resume/─►│               │               │               │
  │  upload (PDF)  │               │               │               │
  │               │─validate file  │               │               │
  │               │─save to disk   │               │               │
  │               │─create resume──────────────────────────────────►│
  │               │  doc status=   │               │               │
  │               │  "pending"     │               │               │
  │               │─enqueue task──►│               │               │
  │◄─202 Accepted─│  (resume_id)   │               │               │
  │               │               │─PyMuPDF        │               │
  │               │               │  extract text  │               │
  │               │               │─POST /generate►│               │
  │               │               │  (skill prompt)│               │
  │               │               │◄─JSON response─│               │
  │               │               │─parse JSON     │               │
  │               │               │─update resume──────────────────►│
  │               │               │  status=       │               │
  │               │               │  "completed"   │               │
  │               │               │                │               │
  │─GET /resume/  │               │               │               │
  │  {id}/status──►│               │               │               │
  │               │─query status───────────────────────────────────►│
  │               │◄─"completed"───────────────────────────────────│
  │◄─200 + data───│               │               │               │
```

### 4.3 Answer Evaluation Flow

```
Client         FastAPI       Celery Worker    Whisper(PyTorch)  Qwen(Ollama)  MongoDB
  │               │                │                 │               │           │
  │─POST /answer──►│               │                 │               │           │
  │  (audio blob)  │               │                 │               │           │
  │               │─save audio     │                 │               │           │
  │               │─create answer──────────────────────────────────────────────►│
  │               │  status=pending│                 │               │           │
  │               │─enqueue eval──►│                 │               │           │
  │◄─202 Accepted─│               │                 │               │           │
  │               │               │─send audio──────►│               │           │
  │               │               │◄─transcript──────│               │           │
  │               │               │─Librosa analysis │               │           │
  │               │               │─build eval prompt│               │           │
  │               │               │─POST /generate───────────────────►│           │
  │               │               │◄─JSON{score, rationale, missing}─│           │
  │               │               │─update answer─────────────────────────────►│
  │               │               │  {transcript,    │               │           │
  │               │               │   score, voice}  │               │           │
  │               │               │                  │               │           │
  │─GET /answer/  │               │                  │               │           │
  │  {id}─────────►│               │                  │               │           │
  │               │─query answer──────────────────────────────────────────────►│
  │               │◄─answer doc───────────────────────────────────────────────│
  │◄─200 + eval───│               │                  │               │           │
```

---

## 5. Component Responsibilities

### 5.1 FastAPI Application Layer

| Component | File | Responsibility |
|---|---|---|
| API Router | `api/v1/router.py` | Aggregates all module routers under `/api/v1` |
| Middleware Stack | `core/middleware.py` | CORS, rate limiting, request ID injection, request logging |
| JWT Dependency | `core/security.py` | Token validation, user extraction from request |
| Exception Handler | `core/exceptions.py` | Maps exceptions to structured JSON error responses |
| Health Check | `api/v1/health.py` | Service health and readiness endpoints |

### 5.2 Service Layer

Each module has a dedicated service class that contains all business logic. Services never directly access the database — they use repositories.

```
AuthService
  ├── register_user(email, password) → User
  ├── login(email, password) → TokenPair
  ├── refresh_token(refresh_token) → TokenPair
  └── logout(user_id, token) → None

ResumeService
  ├── upload_resume(file, user_id) → Resume
  ├── trigger_parse(resume_id) → Task
  ├── get_resume(resume_id) → Resume
  └── list_resumes(user_id) → List[Resume]

InterviewService
  ├── create_session(user_id, resume_id, config) → Session
  ├── get_question(session_id, position) → Question
  ├── submit_answer(session_id, question_id, audio) → Answer
  └── complete_session(session_id) → SessionSummary

EvaluationService
  ├── evaluate_answer(answer_id) → EvaluationResult
  └── get_session_evaluation(session_id) → SessionEvaluation

HireScoreService
  ├── compute_score(session_id) → HireScore
  └── get_score_history(user_id) → List[HireScore]

ReportService
  ├── generate_report(session_id) → Report
  └── get_report_url(report_id) → str
```

### 5.3 Repository Layer

Repositories handle all MongoDB interactions. They expose typed methods and never leak Motor/Beanie internals to the service layer.

```
UserRepository
  ├── find_by_email(email) → Optional[User]
  ├── find_by_id(user_id) → Optional[User]
  ├── create(user_data) → User
  └── update(user_id, updates) → User

ResumeRepository
  ├── create(resume_data) → Resume
  ├── find_by_id(resume_id) → Optional[Resume]
  ├── find_by_user(user_id) → List[Resume]
  └── update_parse_result(resume_id, result) → Resume

SessionRepository
  ├── create(session_data) → Session
  ├── find_by_id(session_id) → Optional[Session]
  ├── update_status(session_id, status) → Session
  └── find_by_user(user_id) → List[Session]
```

### 5.4 Frontend Component Architecture

```
Pages (Route-level)
└── Layout (Header, Sidebar, Footer)
    └── Features (Auth, Resume, Interview, Dashboard)
        └── Components (Shared primitives)
            ├── UI (Button, Input, Card, Badge, Modal)
            ├── Feedback (Toast, Alert, Skeleton, Spinner)
            └── Charts (ScoreRadar, EmotionTimeline, VoiceWaveform)
```

---

## 6. Service Boundaries

### 6.1 What Each Module MUST NOT Do

| Module | Forbidden Actions |
|---|---|
| Auth | Access interview session data directly |
| Resume Intelligence | Call LLM for anything unrelated to resume extraction |
| Interview Engine | Score answers or aggregate emotions |
| Evaluation Engine | Directly invoke the camera or microphone |
| FaceSense | Process audio or text |
| VoiceSense | Analyze facial images |
| HireScore | Generate questions or interface with Ollama directly |
| Report Engine | Compute scores or evaluate answers |

### 6.2 Cross-Module Communication Rules

1. Modules communicate only through **defined input/output schemas** (Pydantic models)
2. No module imports another module's internal service class — only its public schemas
3. Cross-module data retrieval goes through **repositories**, not direct collection queries
4. Background tasks (Celery) are the only exception — they orchestrate multiple modules by calling their service classes in sequence

### 6.3 Public API Contracts

Each module exposes a `schemas.py` file at its root defining its input and output types. These types are the **contract** — changes to them require a version bump.

---

## 7. Infrastructure Architecture

### 7.1 Development Environment (Docker Compose)

```
docker-compose.yml
├── backend          (FastAPI + Uvicorn, port 8000)
├── celery_worker    (Celery, 4 workers)
├── frontend         (Vite dev server, port 5173)
├── mongo            (MongoDB 7.x, port 27017)
├── redis            (Redis 7.x, port 6379)
└── ollama           (Ollama, port 11434)
```

### 7.2 Production Environment

```
┌───────────────────────────────────────────────────────────────────┐
│                         Internet                                  │
└────────────────┬──────────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
  ┌──────────┐      ┌──────────┐
  │  Vercel  │      │  Render  │
  │ (CDN +   │      │ (Backend │
  │ Frontend)│      │  + API)  │
  └──────────┘      └────┬─────┘
                         │
              ┌──────────┼────────────┐
              ▼          ▼            ▼
       ┌───────────┐ ┌────────┐ ┌─────────┐
       │  MongoDB  │ │ Redis  │ │ Ollama  │
       │  Atlas    │ │(Render │ │(Render  │
       │  (Managed)│ │ Redis) │ │ Service)│
       └───────────┘ └────────┘ └─────────┘
```

### 7.3 CI/CD Pipeline

```
Git Push to Feature Branch
         │
         ▼
GitHub Actions — PR Checks
  ├─ Backend: ruff + black + mypy
  ├─ Frontend: eslint + tsc --noEmit
  ├─ Backend: pytest (unit + integration)
  └─ Frontend: vitest

         │ (all pass)
         ▼
Merge to main
         │
         ▼
GitHub Actions — Deploy
  ├─ Build Docker images
  ├─ Push to Render (backend auto-deploy)
  └─ Vercel CLI deploy (frontend)
```

---

## 8. Error Handling Strategy

### 8.1 Layer-by-Layer Error Propagation

```
Repository Layer
  ├─ MongoDB OperationFailure → raise DatabaseError
  ├─ Document not found → raise NotFoundError
  └─ Validation failure → raise ValidationError

Service Layer
  ├─ Catches repository errors
  ├─ Catches AI timeout errors → raise AIUnavailableError
  ├─ Catches file errors → raise FileProcessingError
  └─ Adds business context to errors before re-raising

API Layer (Router)
  ├─ FastAPI exception handler catches all custom errors
  ├─ Maps error classes → HTTP status codes
  └─ Returns structured JSON error response (see TRD.md §9.1)

Celery Workers
  ├─ Retry on transient errors (network, timeout) — max 3 retries
  ├─ Mark task as FAILED after max retries
  └─ Update document status field to "failed" with error details
```

### 8.2 Frontend Error Handling

```
API Call → Error Response
       │
       ├─ 401 → Trigger token refresh → retry once → redirect to login
       ├─ 403 → Show "Access Denied" page
       ├─ 422 → Map field errors to form validation messages
       ├─ 429 → Show rate limit countdown banner
       ├─ 503 → Show "AI is warming up" screen with retry
       └─ 500 → Show generic error boundary with support ID
```

---

## 9. Scalability Architecture

### 9.1 Horizontal Scaling Strategy

| Component | Scaling Method |
|---|---|
| FastAPI backend | Add container replicas (stateless) |
| Celery workers | Add worker containers (shared Redis broker) |
| Redis | Redis Cluster or Sentinel for HA |
| MongoDB | Atlas auto-scaling + sharding (future) |
| Ollama | GPU instance with request queuing |

### 9.2 Caching Strategy

| Data | Cache Location | TTL |
|---|---|---|
| User profile | Redis | 5 minutes |
| Feature flags | Redis | 10 minutes |
| Active session state | Redis | 24 hours |
| LLM response (identical prompts) | Redis | 1 hour |
| Parsed resume JSON | Redis | 30 minutes |

### 9.3 Database Query Optimization

All frequently queried fields must have MongoDB indexes defined. See [DATABASE.md](./DATABASE.md) for the full index specification.

---

## 10. Security Architecture

### 10.1 Request Security Flow

```
Incoming Request
       │
       ▼
TLS Termination (Render/Vercel edge)
       │
       ▼
CORS Validation (origin whitelist)
       │
       ▼
Rate Limit Check (Redis counter by IP)
       │
       ▼
JWT Validation (signature + expiry)
       │
       ▼
RBAC Check (role vs. required permissions)
       │
       ▼
Input Validation (Pydantic schema)
       │
       ▼
Business Logic
```

### 10.2 File Upload Security

```
File Upload
       │
       ▼
Size Check (max 5 MB)
       │
       ▼
MIME Type Validation (PDF only for resumes)
       │
       ▼
Magic Byte Verification (not just extension check)
       │
       ▼
File Saved to Isolated Storage Directory
       │
       ▼
Async Processing (never execute uploaded files)
```

> See [SECURITY.md](./SECURITY.md) for the complete threat model and OWASP Top 10 analysis.

---

> **Related Documents:**  
> [TRD.md](./TRD.md) · [DATABASE.md](./DATABASE.md) · [API_SPEC.md](./API_SPEC.md) · [SECURITY.md](./SECURITY.md) · [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
