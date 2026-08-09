# GetHire — Database Design Document

> **Document Version:** 1.0.0  
> **Status:** Approved for Development  
> **Last Updated:** 2026-08-09  
> **Author:** Engineering Team  
> **Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [API_SPEC.md](./API_SPEC.md) · [TRD.md](./TRD.md)

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Collection Overview](#2-collection-overview)
3. [Collection Schemas](#3-collection-schemas)
   - [users](#31-users-collection)
   - [resumes](#32-resumes-collection)
   - [sessions](#33-sessions-collection)
   - [questions](#34-questions-collection)
   - [answers](#35-answers-collection)
   - [face_analyses](#36-face_analyses-collection)
   - [voice_analyses](#37-voice_analyses-collection)
   - [scores](#38-scores-collection)
   - [reports](#39-reports-collection)
   - [audit_logs](#310-audit_logs-collection)
4. [Relationships](#4-relationships)
5. [Indexes](#5-indexes)
6. [Validation Rules](#6-validation-rules)
7. [Audit and Soft Delete Strategy](#7-audit-and-soft-delete-strategy)
8. [Data Retention Policy](#8-data-retention-policy)

---

## 1. Design Principles

### 1.1 Document Model Philosophy

MongoDB's document model is leveraged intentionally. Rather than normalizing everything like a relational database, GetHire embeds data where it is always accessed together, and references data where it is shared across collections.

**Embed when:**
- Data is only ever read with the parent document
- Data has bounded cardinality (e.g., resume sections)
- Atomic writes across the embedded data are needed

**Reference when:**
- Data is shared across multiple parent documents
- Cardinality is unbounded (e.g., answers in a session)
- Independent querying of the child data is required

### 1.2 Common Audit Fields

Every collection includes these fields:

| Field | Type | Description |
|---|---|---|
| `created_at` | `DateTime` | Timestamp of document creation (UTC) |
| `updated_at` | `DateTime` | Timestamp of last modification (UTC) |
| `is_deleted` | `Boolean` | Soft delete flag (default: `false`) |
| `deleted_at` | `DateTime` | Timestamp of soft deletion (null unless deleted) |
| `schema_version` | `Integer` | Document schema version for future migrations |

### 1.3 ID Convention

All document IDs use MongoDB's native `ObjectId` type. The string representation is used in API responses as `id` (not `_id`). Example: `"507f1f77bcf86cd799439011"`.

---

## 2. Collection Overview

| Collection | Description | Estimated Growth Rate |
|---|---|---|
| `users` | Registered user accounts | Low (user registrations) |
| `resumes` | Uploaded and parsed resumes | Moderate (multiple per user) |
| `sessions` | Interview session metadata | Moderate (sessions per user) |
| `questions` | Generated interview questions | High (multiple per session) |
| `answers` | Candidate responses with evaluations | High (multiple per question) |
| `face_analyses` | Per-session facial emotion log | Very High (frames per session) |
| `voice_analyses` | Per-answer voice feature analysis | High (one per answer) |
| `scores` | HireScore composite results | Moderate (one per session) |
| `reports` | Generated PDF report metadata | Moderate (one per session) |
| `audit_logs` | Security and action audit trail | Very High (every sensitive action) |

---

## 3. Collection Schemas

### 3.1 `users` Collection

**Purpose:** Stores registered user accounts, credentials, and role assignments.

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439011')",
  "schema_version": 1,

  "email": "alice@example.com",
  "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
  "full_name": "Alice Johnson",
  "role": "candidate",

  "profile": {
    "avatar_url": null,
    "linkedin_url": null,
    "target_role": "Software Engineer",
    "experience_level": "entry"
  },

  "auth": {
    "is_email_verified": false,
    "email_verification_token": "abc123xyz",
    "email_verification_expires_at": "2026-08-10T10:30:00Z",
    "password_reset_token": null,
    "password_reset_expires_at": null,
    "last_login_at": null,
    "failed_login_attempts": 0,
    "locked_until": null
  },

  "settings": {
    "notifications_enabled": true,
    "timezone": "Asia/Kolkata"
  },

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T10:00:00Z",
  "updated_at": "2026-08-09T10:00:00Z"
}
```

**Allowed roles:** `"candidate"` | `"admin"`

---

### 3.2 `resumes` Collection

**Purpose:** Stores uploaded resume files and their parsed structured data.

```json
{
  "_id": "ObjectId('507f191e810c19729de860ea')",
  "schema_version": 1,

  "user_id": "ObjectId('507f1f77bcf86cd799439011')",
  "file_name": "alice_resume_v2.pdf",
  "file_path": "/uploads/507f1f77.../alice_resume_v2.pdf",
  "file_size_bytes": 204800,
  "mime_type": "application/pdf",

  "status": "completed",

  "parsed_data": {
    "personal": {
      "full_name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "+91-9876543210",
      "linkedin_url": "https://linkedin.com/in/alice-johnson",
      "github_url": "https://github.com/alicejohnson",
      "location": "Bengaluru, India"
    },
    "skills": [
      { "name": "Python", "confidence": 0.97, "category": "programming_language" },
      { "name": "React", "confidence": 0.91, "category": "frontend_framework" },
      { "name": "FastAPI", "confidence": 0.88, "category": "backend_framework" },
      { "name": "MongoDB", "confidence": 0.85, "category": "database" }
    ],
    "experience": [
      {
        "title": "Software Engineering Intern",
        "company": "Infosys",
        "start_date": "2025-06",
        "end_date": "2025-08",
        "is_current": false,
        "description": "Built REST APIs using FastAPI and integrated MongoDB Atlas.",
        "inferred_skills": ["FastAPI", "MongoDB", "Python", "REST"]
      }
    ],
    "education": [
      {
        "institution": "VIT University",
        "degree": "B.Tech Computer Science",
        "start_year": 2022,
        "end_year": 2026,
        "cgpa": 8.7
      }
    ],
    "projects": [
      {
        "name": "GetHire",
        "description": "AI-powered interview readiness platform using FastAPI, React, and Ollama.",
        "technologies": ["FastAPI", "React", "MongoDB", "Ollama", "TensorFlow"],
        "url": "https://github.com/alicejohnson/gethire"
      }
    ],
    "certifications": [
      {
        "name": "AWS Cloud Practitioner",
        "issuer": "Amazon",
        "issued_date": "2025-03"
      }
    ]
  },

  "quality_score": 78,
  "quality_feedback": [
    "Missing a summary/objective section",
    "Work experience descriptions could quantify achievements"
  ],

  "parse_error": null,
  "parse_attempts": 1,

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T10:05:00Z",
  "updated_at": "2026-08-09T10:05:45Z"
}
```

**Allowed statuses:** `"pending"` | `"processing"` | `"completed"` | `"failed"`

---

### 3.3 `sessions` Collection

**Purpose:** Stores interview session lifecycle and configuration.

```json
{
  "_id": "ObjectId('507f191e810c19729de860eb')",
  "schema_version": 1,

  "user_id": "ObjectId('507f1f77bcf86cd799439011')",
  "resume_id": "ObjectId('507f191e810c19729de860ea')",

  "config": {
    "interview_type": "mixed",
    "total_questions": 10,
    "time_limit_per_question_seconds": 120,
    "facesense_enabled": true,
    "voicesense_enabled": true
  },

  "status": "completed",

  "progress": {
    "current_question_index": 10,
    "questions_answered": 10,
    "questions_skipped": 1,
    "skips_remaining": 1
  },

  "timing": {
    "started_at": "2026-08-09T11:00:00Z",
    "completed_at": "2026-08-09T11:42:15Z",
    "paused_at": null,
    "total_duration_seconds": 2535
  },

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T11:00:00Z",
  "updated_at": "2026-08-09T11:42:15Z"
}
```

**Allowed interview types:** `"technical"` | `"behavioral"` | `"mixed"`  
**Allowed statuses:** `"created"` | `"in_progress"` | `"paused"` | `"completed"` | `"abandoned"`

---

### 3.4 `questions` Collection

**Purpose:** Stores AI-generated interview questions per session.

```json
{
  "_id": "ObjectId('507f191e810c19729de860ec')",
  "schema_version": 1,

  "session_id": "ObjectId('507f191e810c19729de860eb')",
  "user_id": "ObjectId('507f1f77bcf86cd799439011')",

  "position": 1,
  "question_type": "technical",
  "difficulty": "medium",

  "text": "You mentioned FastAPI in your projects. Can you explain how FastAPI handles asynchronous request processing and why you chose it over Flask for your GetHire project?",
  "context_source": "projects[0].name",

  "follow_up_of": null,
  "is_follow_up": false,

  "generation_model": "qwen2.5:7b",
  "generation_prompt_version": "v1",

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T11:00:05Z",
  "updated_at": "2026-08-09T11:00:05Z"
}
```

**Allowed question types:** `"technical"` | `"behavioral"` | `"situational"`  
**Allowed difficulties:** `"easy"` | `"medium"` | `"hard"`

---

### 3.5 `answers` Collection

**Purpose:** Stores candidate responses with full evaluation results.

```json
{
  "_id": "ObjectId('507f191e810c19729de860ed')",
  "schema_version": 1,

  "session_id": "ObjectId('507f191e810c19729de860eb')",
  "question_id": "ObjectId('507f191e810c19729de860ec')",
  "user_id": "ObjectId('507f1f77bcf86cd799439011')",

  "submission": {
    "audio_file_path": "/uploads/sessions/507f.../answer_1.webm",
    "audio_duration_seconds": 87,
    "submitted_at": "2026-08-09T11:03:27Z",
    "is_skipped": false
  },

  "transcription": {
    "status": "completed",
    "text": "FastAPI uses Python's native async/await syntax built on top of Starlette and ASGI. Unlike Flask which is WSGI and blocks on each request, FastAPI can handle many concurrent requests...",
    "word_count": 94,
    "model_used": "whisper-base"
  },

  "evaluation": {
    "status": "completed",
    "score": 7.5,
    "max_score": 10,
    "rubric_breakdown": {
      "technical_accuracy": 8.0,
      "completeness": 7.0,
      "clarity": 7.5
    },
    "rationale": "The candidate correctly identified the async/ASGI difference and compared FastAPI with Flask. The answer lacked mention of dependency injection and Pydantic validation, which are key FastAPI differentiators.",
    "missing_concepts": ["dependency injection", "Pydantic v2 integration", "automatic OpenAPI generation"],
    "model_answer": "FastAPI is built on ASGI and natively supports Python's async/await, allowing concurrent request handling without blocking. Key advantages over Flask include: native async support, automatic Pydantic validation, built-in OpenAPI/Swagger docs, and a powerful dependency injection system...",
    "evaluation_model": "qwen2.5:7b",
    "evaluation_prompt_version": "v1"
  },

  "voice_analysis": {
    "status": "completed",
    "words_per_minute": 112,
    "pitch_mean_hz": 145.3,
    "pitch_std_hz": 22.1,
    "pause_count": 3,
    "pause_total_seconds": 4.2,
    "filler_words": ["um", "like"],
    "filler_word_count": 4,
    "voice_confidence_score": 71,
    "articulation_score": 78
  },

  "timing": {
    "question_displayed_at": "2026-08-09T11:01:30Z",
    "recording_started_at": "2026-08-09T11:01:45Z",
    "recording_ended_at": "2026-08-09T11:03:12Z",
    "time_to_first_word_seconds": 8.3
  },

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T11:03:27Z",
  "updated_at": "2026-08-09T11:04:15Z"
}
```

---

### 3.6 `face_analyses` Collection

**Purpose:** Stores per-session facial emotion timeline captured during the interview.

```json
{
  "_id": "ObjectId('507f191e810c19729de860ef')",
  "schema_version": 1,

  "session_id": "ObjectId('507f191e810c19729de860eb')",
  "user_id": "ObjectId('507f1f77bcf86cd799439011')",

  "status": "completed",

  "emotion_log": [
    {
      "timestamp": "2026-08-09T11:01:33Z",
      "question_index": 1,
      "emotion": "neutral",
      "confidence": 0.82,
      "bounding_box": { "x": 120, "y": 45, "width": 200, "height": 230 }
    },
    {
      "timestamp": "2026-08-09T11:01:36Z",
      "question_index": 1,
      "emotion": "confident",
      "confidence": 0.74,
      "bounding_box": { "x": 118, "y": 44, "width": 202, "height": 231 }
    },
    {
      "timestamp": "2026-08-09T11:01:39Z",
      "question_index": 1,
      "emotion": "nervous",
      "confidence": 0.68,
      "bounding_box": { "x": 122, "y": 46, "width": 198, "height": 228 }
    }
  ],

  "summary": {
    "dominant_emotion": "neutral",
    "emotion_distribution": {
      "confident": 0.31,
      "neutral": 0.42,
      "nervous": 0.18,
      "confused": 0.07,
      "happy": 0.02
    },
    "confidence_trend_score": 68,
    "presence_score": 72,
    "face_detected_frame_ratio": 0.94
  },

  "detection_model": "opencv_haarcascade_v1",
  "classification_model": "mobilenet_emotion_v2",
  "frames_analyzed": 420,
  "frames_face_detected": 395,

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T11:00:05Z",
  "updated_at": "2026-08-09T11:42:20Z"
}
```

**Allowed emotions:** `"confident"` | `"neutral"` | `"nervous"` | `"confused"` | `"happy"` | `"unknown"`

---

### 3.7 `voice_analyses` Collection

**Purpose:** Stores aggregate voice analysis metrics for a session (individual answer voice data is embedded in `answers`).

```json
{
  "_id": "ObjectId('507f191e810c19729de860f0')",
  "schema_version": 1,

  "session_id": "ObjectId('507f191e810c19729de860eb')",
  "user_id": "ObjectId('507f1f77bcf86cd799439011')",

  "aggregate": {
    "avg_words_per_minute": 108,
    "avg_pitch_mean_hz": 142.7,
    "avg_pitch_std_hz": 24.3,
    "total_filler_words": 18,
    "total_pause_count": 22,
    "avg_pause_duration_seconds": 3.8,
    "avg_voice_confidence_score": 69,
    "avg_articulation_score": 76,
    "overall_voice_score": 71
  },

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T11:42:10Z",
  "updated_at": "2026-08-09T11:42:25Z"
}
```

---

### 3.8 `scores` Collection

**Purpose:** Stores the final HireScore composite result for each completed session.

```json
{
  "_id": "ObjectId('507f191e810c19729de860f1')",
  "schema_version": 1,

  "session_id": "ObjectId('507f191e810c19729de860eb')",
  "user_id": "ObjectId('507f1f77bcf86cd799439011')",

  "composite_score": 72,
  "recommendation": "hire",

  "dimensions": {
    "technical": {
      "score": 75,
      "weight": 0.40,
      "weighted_contribution": 30.0,
      "label": "Good",
      "improvement_areas": ["System design fundamentals", "Time complexity analysis"]
    },
    "communication": {
      "score": 71,
      "weight": 0.25,
      "weighted_contribution": 17.75,
      "label": "Good",
      "improvement_areas": ["Reduce filler words", "Structure answers using STAR method"]
    },
    "confidence": {
      "score": 68,
      "weight": 0.20,
      "weighted_contribution": 13.6,
      "label": "Moderate",
      "improvement_areas": ["Maintain eye contact", "Reduce nervous gestures"]
    },
    "presence": {
      "score": 72,
      "weight": 0.15,
      "weighted_contribution": 10.8,
      "label": "Good",
      "improvement_areas": ["Vary pitch more deliberately"]
    }
  },

  "weights_version": "v1",
  "score_algorithm_version": "v1",

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T11:42:30Z",
  "updated_at": "2026-08-09T11:42:30Z"
}
```

**Allowed recommendations:** `"strong_hire"` | `"hire"` | `"hold"` | `"no_hire"`

**Score thresholds (v1):**

| Score Range | Recommendation |
|---|---|
| 85 – 100 | `strong_hire` |
| 65 – 84 | `hire` |
| 45 – 64 | `hold` |
| 0 – 44 | `no_hire` |

---

### 3.9 `reports` Collection

**Purpose:** Stores metadata for generated PDF interview reports.

```json
{
  "_id": "ObjectId('507f191e810c19729de860f2')",
  "schema_version": 1,

  "session_id": "ObjectId('507f191e810c19729de860eb')",
  "user_id": "ObjectId('507f1f77bcf86cd799439011')",
  "score_id": "ObjectId('507f191e810c19729de860f1')",

  "status": "completed",

  "file": {
    "file_name": "gethire_report_507f191e.pdf",
    "file_path": "/reports/507f1f77.../gethire_report_507f191e.pdf",
    "file_size_bytes": 512000,
    "generated_at": "2026-08-09T11:43:00Z",
    "generator_version": "v1"
  },

  "access": {
    "download_url": "https://storage.gethire.app/reports/signed_token_abc123.pdf",
    "download_url_expires_at": "2026-08-16T11:43:00Z",
    "public_share_token": "pub_xyz789",
    "is_public": false,
    "download_count": 0
  },

  "is_deleted": false,
  "deleted_at": null,
  "created_at": "2026-08-09T11:42:35Z",
  "updated_at": "2026-08-09T11:43:05Z"
}
```

**Allowed statuses:** `"pending"` | `"generating"` | `"completed"` | `"failed"`

---

### 3.10 `audit_logs` Collection

**Purpose:** Immutable audit trail of all security-relevant actions. Documents in this collection are **never soft-deleted** and **never updated** — only appended.

```json
{
  "_id": "ObjectId('507f191e810c19729de860f3')",
  "schema_version": 1,

  "actor_id": "ObjectId('507f1f77bcf86cd799439011')",
  "actor_role": "candidate",
  "actor_ip": "103.21.45.67",
  "actor_user_agent": "Mozilla/5.0 ...",

  "action": "user.login.success",
  "resource_type": "user",
  "resource_id": "507f1f77bcf86cd799439011",

  "request_id": "req_abc123xyz",
  "request_path": "/api/v1/auth/login",
  "request_method": "POST",

  "outcome": "success",
  "details": {
    "login_method": "email_password"
  },

  "created_at": "2026-08-09T10:30:00Z"
}
```

**Standard action names:**

| Action | Trigger |
|---|---|
| `user.register` | New account created |
| `user.login.success` | Successful login |
| `user.login.failure` | Failed login attempt |
| `user.logout` | Explicit logout |
| `user.password_reset` | Password reset completed |
| `resume.upload` | Resume file uploaded |
| `session.create` | Interview session started |
| `session.complete` | Interview session completed |
| `report.download` | PDF report downloaded |
| `admin.user_view` | Admin accessed user record |

---

## 4. Relationships

```
users (1)
  │
  ├─────────── resumes (N)
  │                │
  │                └─────────── sessions (N)
  │                                 │
  │                                 ├─────── questions (N)
  │                                 │             │
  │                                 │             └───── answers (N)
  │                                 │                        │
  │                                 │                        └── voice_analyses (1)
  │                                 │
  │                                 ├─────── face_analyses (1)
  │                                 ├─────── scores (1)
  │                                 └─────── reports (1)
  │
  └─────────── audit_logs (N)
```

All foreign key fields use MongoDB `ObjectId` references. Joins are performed at the application layer in repositories (not using `$lookup` unless absolutely necessary for performance reasons).

---

## 5. Indexes

### 5.1 `users` Collection

```javascript
// Unique index — login lookup
db.users.createIndex({ "email": 1 }, { unique: true, name: "idx_users_email_unique" })

// Partial index — soft delete aware queries
db.users.createIndex(
  { "email": 1 },
  { partialFilterExpression: { "is_deleted": false }, name: "idx_users_email_active" }
)

// Auth token lookup
db.users.createIndex(
  { "auth.email_verification_token": 1 },
  { sparse: true, name: "idx_users_email_verification_token" }
)
db.users.createIndex(
  { "auth.password_reset_token": 1 },
  { sparse: true, name: "idx_users_password_reset_token" }
)
```

### 5.2 `resumes` Collection

```javascript
// User's resumes list
db.resumes.createIndex({ "user_id": 1, "created_at": -1 }, { name: "idx_resumes_user_created" })

// Status monitoring
db.resumes.createIndex({ "status": 1 }, { name: "idx_resumes_status" })
```

### 5.3 `sessions` Collection

```javascript
// User's sessions list
db.sessions.createIndex({ "user_id": 1, "created_at": -1 }, { name: "idx_sessions_user_created" })

// Active session lookup
db.sessions.createIndex(
  { "user_id": 1, "status": 1 },
  { partialFilterExpression: { "status": { "$in": ["in_progress", "paused"] } }, name: "idx_sessions_active" }
)

// Resume-session mapping
db.sessions.createIndex({ "resume_id": 1 }, { name: "idx_sessions_resume" })
```

### 5.4 `questions` Collection

```javascript
// Session question list (sorted by position)
db.questions.createIndex({ "session_id": 1, "position": 1 }, { name: "idx_questions_session_position" })
```

### 5.5 `answers` Collection

```javascript
// Session answers list
db.answers.createIndex({ "session_id": 1, "created_at": 1 }, { name: "idx_answers_session" })

// Per-question answer lookup
db.answers.createIndex({ "question_id": 1 }, { name: "idx_answers_question" })

// Evaluation status monitoring
db.answers.createIndex(
  { "evaluation.status": 1 },
  { partialFilterExpression: { "evaluation.status": { "$in": ["pending", "processing"] } }, name: "idx_answers_eval_pending" }
)
```

### 5.6 `face_analyses` Collection

```javascript
// Session face analysis lookup (one-to-one)
db.face_analyses.createIndex({ "session_id": 1 }, { unique: true, name: "idx_face_analyses_session_unique" })
```

### 5.7 `scores` Collection

```javascript
// Session score lookup
db.scores.createIndex({ "session_id": 1 }, { unique: true, name: "idx_scores_session_unique" })

// User score history
db.scores.createIndex({ "user_id": 1, "created_at": -1 }, { name: "idx_scores_user_history" })
```

### 5.8 `reports` Collection

```javascript
// Session report lookup
db.reports.createIndex({ "session_id": 1 }, { unique: true, name: "idx_reports_session_unique" })

// Share token lookup
db.reports.createIndex(
  { "access.public_share_token": 1 },
  { sparse: true, name: "idx_reports_share_token" }
)
```

### 5.9 `audit_logs` Collection

```javascript
// Actor lookup
db.audit_logs.createIndex({ "actor_id": 1, "created_at": -1 }, { name: "idx_audit_actor" })

// Action type lookup
db.audit_logs.createIndex({ "action": 1, "created_at": -1 }, { name: "idx_audit_action" })

// Request tracing
db.audit_logs.createIndex({ "request_id": 1 }, { name: "idx_audit_request" })

// TTL index — expire audit logs after 2 years
db.audit_logs.createIndex(
  { "created_at": 1 },
  { expireAfterSeconds: 63072000, name: "idx_audit_ttl_2yr" }
)
```

---

## 6. Validation Rules

MongoDB schema validation is enforced at the collection level using `$jsonSchema`. Key rules:

### Users
- `email`: required, valid email format pattern
- `hashed_password`: required, min length 60 (bcrypt output length)
- `role`: required, enum `["candidate", "admin"]`

### Resumes
- `user_id`: required, ObjectId
- `file_size_bytes`: maximum `5242880` (5 MB)
- `status`: required, enum `["pending", "processing", "completed", "failed"]`
- `mime_type`: enum `["application/pdf"]`

### Sessions
- `config.interview_type`: enum `["technical", "behavioral", "mixed"]`
- `config.total_questions`: minimum 5, maximum 20
- `config.time_limit_per_question_seconds`: minimum 60, maximum 300

### Answers
- `evaluation.score`: minimum 0, maximum 10 (when present)
- `voice_analysis.voice_confidence_score`: minimum 0, maximum 100 (when present)

### Scores
- `composite_score`: minimum 0, maximum 100
- `recommendation`: enum `["strong_hire", "hire", "hold", "no_hire"]`
- All dimension scores: minimum 0, maximum 100

---

## 7. Audit and Soft Delete Strategy

### 7.1 Soft Delete

All collections (except `audit_logs`) support soft deletion:

```python
# Soft delete pattern
await collection.update_one(
    {"_id": document_id},
    {
        "$set": {
            "is_deleted": True,
            "deleted_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    }
)
```

All queries must include `{"is_deleted": False}` in their filter unless explicitly auditing deleted records.

### 7.2 Hard Delete Policy

Hard deletion is only permitted:
- By an admin user for GDPR/data erasure requests
- After a 30-day grace period following a soft delete
- Via a dedicated admin-only API endpoint with dual-authorization

### 7.3 Audit Log Immutability

`audit_logs` documents:
- Are never updated after creation
- Are never soft-deleted
- Are never hard-deleted (only expire via TTL index after 2 years)
- Have no `is_deleted` field

---

## 8. Data Retention Policy

| Collection | Retention Period | Mechanism |
|---|---|---|
| `users` | Lifetime (until account deletion) | Soft delete → hard delete on request |
| `resumes` | 2 years after last session | TTL index on `updated_at` |
| `sessions` | 2 years after completion | TTL index on `timing.completed_at` |
| `answers` | 2 years after session | Cascade from session deletion |
| `face_analyses` | 1 year after session | TTL index |
| `voice_analyses` | 1 year after session | TTL index |
| `scores` | Lifetime (user-owned data) | With user account |
| `reports` | 90 days for file; metadata persists | S3 lifecycle policy |
| `audit_logs` | 2 years | TTL index on `created_at` |

---

> **Related Documents:**  
> [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [API_SPEC.md](./API_SPEC.md) · [SECURITY.md](./SECURITY.md) · [TRD.md](./TRD.md)
