# GetHire — API Specification

> **Document Version:** 1.0.0  
> **Status:** Approved for Development  
> **Last Updated:** 2026-08-09  
> **Author:** Engineering Team  
> **Base URL (Development):** `http://localhost:8000/api/v1`  
> **Base URL (Production):** `https://api.gethire.app/api/v1`  
> **Related Documents:** [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [SECURITY.md](./SECURITY.md)

---

## Table of Contents

1. [API Design Principles](#1-api-design-principles)
2. [Authentication](#2-authentication)
3. [Common Schemas](#3-common-schemas)
4. [Auth Endpoints](#4-auth-endpoints)
5. [Resume Endpoints](#5-resume-endpoints)
6. [Interview Endpoints](#6-interview-endpoints)
7. [Answer Endpoints](#7-answer-endpoints)
8. [FaceSense Endpoints](#8-facesense-endpoints)
9. [VoiceSense Endpoints](#9-voicesense-endpoints)
10. [HireScore Endpoints](#10-hirescore-endpoints)
11. [Report Endpoints](#11-report-endpoints)
12. [Admin Endpoints](#12-admin-endpoints)
13. [Utility Endpoints](#13-utility-endpoints)
14. [Error Code Reference](#14-error-code-reference)
15. [Rate Limit Reference](#15-rate-limit-reference)

---

## 1. API Design Principles

### 1.1 RESTful Conventions

| Convention | Rule |
|---|---|
| Resource naming | Lowercase plural nouns (`/sessions`, `/resumes`) |
| Versioning | URI prefix (`/api/v1/`) |
| HTTP methods | GET (read), POST (create), PUT (full replace), PATCH (partial update), DELETE (remove) |
| Response format | JSON only (`Content-Type: application/json`) |
| Status codes | Standard HTTP semantics (200, 201, 202, 400, 401, 403, 404, 409, 413, 415, 422, 429, 500, 503) |
| IDs | String representation of MongoDB ObjectId |
| Timestamps | ISO 8601 UTC (`2026-08-09T10:30:00Z`) |
| Boolean fields | `true` / `false` (not `1` / `0`) |

### 1.2 Response Envelope

All successful responses use this structure:

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-08-09T10:30:00Z"
  }
}
```

Paginated responses add:

```json
{
  "data": [...],
  "pagination": {
    "total": 47,
    "page": 1,
    "per_page": 20,
    "total_pages": 3
  },
  "meta": { ... }
}
```

### 1.3 Error Response

All errors use this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": { "field": "email", "issue": "invalid format" },
    "request_id": "req_abc123",
    "timestamp": "2026-08-09T10:30:00Z"
  }
}
```

---

## 2. Authentication

### 2.1 Access Token

All protected endpoints require a JWT access token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Auth Requirement Notation

| Symbol | Meaning |
|---|---|
| 🔓 | Public — no authentication required |
| 🔐 | Authenticated — any role |
| 👤 | Candidate role required |
| 🛡️ | Admin role required |

---

## 3. Common Schemas

### 3.1 Pagination Query Parameters

| Parameter | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | integer | 1 | — | Page number (1-indexed) |
| `per_page` | integer | 20 | 100 | Results per page |
| `sort_by` | string | `created_at` | — | Field to sort by |
| `sort_order` | string | `desc` | — | `asc` or `desc` |

### 3.2 ObjectId Format

All ID fields are strings in MongoDB ObjectId format: 24-character hexadecimal string.

```
"507f1f77bcf86cd799439011"
```

---

## 4. Auth Endpoints

### POST /auth/register 🔓

**Purpose:** Register a new candidate account.

**Rate Limit:** 5 requests / IP / hour

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "SecurePass123",
  "full_name": "Alice Johnson"
}
```

**Validation Rules:**
- `email`: Required, valid email format, max 254 chars, must be unique
- `password`: Required, 8–128 chars, must contain uppercase, lowercase, and digit
- `full_name`: Required, 2–100 chars, letters and spaces only

**Success Response — 201 Created:**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "alice@example.com",
    "full_name": "Alice Johnson",
    "role": "candidate",
    "created_at": "2026-08-09T10:00:00Z"
  },
  "meta": { "request_id": "req_abc123", "timestamp": "2026-08-09T10:00:00Z" }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Invalid email, weak password, or missing fields |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `RATE_LIMITED` | 429 | Too many registration attempts |

**Security Notes:**
- Password is hashed with bcrypt before storage
- Plain password is never logged or stored
- Response does not include password hash

---

### POST /auth/login 🔓

**Purpose:** Authenticate user and receive access + refresh tokens.

**Rate Limit:** 10 requests / IP / minute

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "SecurePass123"
}
```

**Success Response — 200 OK:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 900,
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "alice@example.com",
      "full_name": "Alice Johnson",
      "role": "candidate"
    }
  },
  "meta": { "request_id": "req_abc123", "timestamp": "2026-08-09T10:30:00Z" }
}
```

**Cookie Set (automatically):**
```
Set-Cookie: refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/v1/auth/refresh
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `ACCOUNT_LOCKED` | 403 | Too many failed attempts |
| `RATE_LIMITED` | 429 | Too many login attempts |

**Security Notes:**
- Error message is identical for wrong email and wrong password (prevents user enumeration)
- Failed attempt counter incremented on failure; reset on success

---

### POST /auth/refresh 🔓

**Purpose:** Exchange a valid refresh token for a new access + refresh token pair.

**Rate Limit:** 30 requests / user / hour

**Request:** No body. Refresh token is read from HttpOnly cookie automatically.

**Success Response — 200 OK:**
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 900
  },
  "meta": { "request_id": "req_xyz", "timestamp": "2026-08-09T10:45:00Z" }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `MISSING_TOKEN` | 401 | No refresh token cookie |
| `INVALID_TOKEN` | 401 | Token signature invalid |
| `TOKEN_EXPIRED` | 401 | Refresh token expired |
| `TOKEN_REUSE_DETECTED` | 401 | Token already used (family revoked) |

---

### POST /auth/logout 🔐

**Purpose:** Invalidate the current refresh token and clear the cookie.

**Request:** No body required.

**Success Response — 200 OK:**
```json
{
  "data": { "message": "Successfully logged out." },
  "meta": { "request_id": "req_xyz", "timestamp": "2026-08-09T11:00:00Z" }
}
```

---

### POST /auth/forgot-password 🔓

**Purpose:** Initiate password reset by sending OTP to email.

**Rate Limit:** 3 requests / IP / 15 minutes

**Request Body:**
```json
{ "email": "alice@example.com" }
```

**Success Response — 200 OK:** (Always 200, even if email doesn't exist)
```json
{
  "data": { "message": "If an account with that email exists, a reset OTP has been sent." },
  "meta": { ... }
}
```

---

### POST /auth/reset-password 🔓

**Purpose:** Complete password reset using OTP.

**Rate Limit:** 5 requests / IP / 15 minutes

**Request Body:**
```json
{
  "email": "alice@example.com",
  "otp": "847291",
  "new_password": "NewSecurePass456"
}
```

**Success Response — 200 OK:**
```json
{
  "data": { "message": "Password updated successfully. Please log in again." },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `INVALID_OTP` | 400 | OTP does not match |
| `OTP_EXPIRED` | 400 | OTP is older than 15 minutes |
| `VALIDATION_ERROR` | 422 | Weak password |

---

### GET /auth/me 🔐

**Purpose:** Retrieve the currently authenticated user's profile.

**Success Response — 200 OK:**
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "alice@example.com",
    "full_name": "Alice Johnson",
    "role": "candidate",
    "profile": {
      "avatar_url": null,
      "target_role": "Software Engineer",
      "experience_level": "entry"
    },
    "created_at": "2026-08-09T10:00:00Z"
  },
  "meta": { ... }
}
```

---

## 5. Resume Endpoints

### POST /resumes/upload 🔐

**Purpose:** Upload a PDF resume for parsing.

**Rate Limit:** 10 requests / user / hour

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File (PDF) | Yes | Resume PDF file |
| `label` | string | No | User-defined label (e.g., "Software Engineer Resume v2") |

**Validation Rules:**
- `file`: MIME type must be `application/pdf`, magic bytes verified, max size 5 MB
- `label`: Max 100 chars if provided

**Success Response — 202 Accepted:**
```json
{
  "data": {
    "id": "507f191e810c19729de860ea",
    "file_name": "alice_resume_v2.pdf",
    "file_size_bytes": 204800,
    "status": "processing",
    "label": "Software Engineer Resume v2",
    "created_at": "2026-08-09T10:05:00Z"
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `FILE_TOO_LARGE` | 413 | File exceeds 5 MB |
| `INVALID_FILE_TYPE` | 415 | Not a PDF file |
| `FILE_CORRUPTED` | 422 | PDF cannot be read |
| `RATE_LIMITED` | 429 | Too many uploads |

---

### GET /resumes/{resume_id} 🔐

**Purpose:** Retrieve a specific resume and its parsed data.

**Path Parameters:** `resume_id` — ObjectId string

**Success Response — 200 OK:**
```json
{
  "data": {
    "id": "507f191e810c19729de860ea",
    "user_id": "507f1f77bcf86cd799439011",
    "file_name": "alice_resume_v2.pdf",
    "status": "completed",
    "quality_score": 78,
    "quality_feedback": ["Missing summary section"],
    "parsed_data": {
      "personal": { "full_name": "Alice Johnson", "email": "alice@example.com" },
      "skills": [
        { "name": "Python", "confidence": 0.97, "category": "programming_language" }
      ],
      "experience": [...],
      "education": [...],
      "projects": [...]
    },
    "created_at": "2026-08-09T10:05:00Z",
    "updated_at": "2026-08-09T10:05:45Z"
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | Resume does not exist |
| `FORBIDDEN` | 403 | Resume belongs to different user |

---

### GET /resumes 🔐

**Purpose:** List all resumes for the authenticated user.

**Query Parameters:** Standard pagination params.

**Success Response — 200 OK:**
```json
{
  "data": [
    {
      "id": "507f191e810c19729de860ea",
      "file_name": "alice_resume_v2.pdf",
      "status": "completed",
      "quality_score": 78,
      "label": "Software Engineer Resume v2",
      "created_at": "2026-08-09T10:05:00Z"
    }
  ],
  "pagination": { "total": 3, "page": 1, "per_page": 20, "total_pages": 1 },
  "meta": { ... }
}
```

---

### DELETE /resumes/{resume_id} 🔐

**Purpose:** Soft-delete a resume.

**Success Response — 200 OK:**
```json
{
  "data": { "message": "Resume deleted successfully." },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `NOT_FOUND` | 404 | Resume does not exist |
| `FORBIDDEN` | 403 | Not owner |
| `RESUME_IN_USE` | 409 | Resume is associated with an active session |

---

## 6. Interview Endpoints

### POST /sessions 🔐

**Purpose:** Create a new interview session.

**Rate Limit:** 5 requests / user / hour

**Request Body:**
```json
{
  "resume_id": "507f191e810c19729de860ea",
  "interview_type": "mixed",
  "total_questions": 10,
  "time_limit_per_question_seconds": 120,
  "facesense_enabled": true,
  "voicesense_enabled": true
}
```

**Validation Rules:**
- `resume_id`: Required, must be a completed resume owned by the user
- `interview_type`: Required, one of `"technical"` | `"behavioral"` | `"mixed"`
- `total_questions`: Required, integer 5–20
- `time_limit_per_question_seconds`: Optional, integer 60–300, default 120

**Success Response — 201 Created:**
```json
{
  "data": {
    "id": "507f191e810c19729de860eb",
    "status": "created",
    "config": {
      "interview_type": "mixed",
      "total_questions": 10,
      "time_limit_per_question_seconds": 120,
      "facesense_enabled": true,
      "voicesense_enabled": true
    },
    "progress": {
      "current_question_index": 0,
      "questions_answered": 0,
      "skips_remaining": 2
    },
    "created_at": "2026-08-09T11:00:00Z"
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `RESUME_NOT_FOUND` | 404 | Resume ID does not exist |
| `RESUME_NOT_PARSED` | 422 | Resume parsing not completed |
| `ACTIVE_SESSION_EXISTS` | 409 | User already has an active session |
| `RATE_LIMITED` | 429 | Too many sessions |

---

### GET /sessions/{session_id} 🔐

**Purpose:** Retrieve session metadata and progress.

**Success Response — 200 OK:**
```json
{
  "data": {
    "id": "507f191e810c19729de860eb",
    "resume_id": "507f191e810c19729de860ea",
    "status": "in_progress",
    "config": { ... },
    "progress": {
      "current_question_index": 3,
      "questions_answered": 3,
      "questions_skipped": 0,
      "skips_remaining": 2
    },
    "timing": {
      "started_at": "2026-08-09T11:00:00Z",
      "completed_at": null,
      "total_duration_seconds": null
    },
    "created_at": "2026-08-09T11:00:00Z"
  },
  "meta": { ... }
}
```

---

### GET /sessions/{session_id}/questions/{position} 🔐

**Purpose:** Get the question at a specific position in the session.

**Path Parameters:**
- `session_id` — ObjectId string
- `position` — integer (1-indexed)

**Success Response — 200 OK:**
```json
{
  "data": {
    "id": "507f191e810c19729de860ec",
    "position": 1,
    "question_type": "technical",
    "difficulty": "medium",
    "text": "You mentioned FastAPI in your projects. Can you explain how FastAPI handles asynchronous request processing?",
    "context_source": "projects[0].name",
    "time_limit_seconds": 120
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `SESSION_NOT_FOUND` | 404 | Session does not exist |
| `QUESTION_NOT_FOUND` | 404 | Position out of range |
| `SESSION_COMPLETED` | 410 | Session already completed |

---

### POST /sessions/{session_id}/complete 🔐

**Purpose:** Mark a session as completed and trigger HireScore + report generation.

**Request Body:** Empty (`{}`)

**Success Response — 202 Accepted:**
```json
{
  "data": {
    "session_id": "507f191e810c19729de860eb",
    "status": "completed",
    "score_status": "processing",
    "report_status": "processing",
    "message": "Session complete. Score and report are being generated."
  },
  "meta": { ... }
}
```

---

### GET /sessions 🔐

**Purpose:** List all sessions for the authenticated user.

**Query Parameters:** Standard pagination + optional `status` filter.

**Success Response — 200 OK:**
```json
{
  "data": [
    {
      "id": "507f191e810c19729de860eb",
      "interview_type": "mixed",
      "total_questions": 10,
      "status": "completed",
      "composite_score": 72,
      "recommendation": "hire",
      "created_at": "2026-08-09T11:00:00Z",
      "completed_at": "2026-08-09T11:42:15Z"
    }
  ],
  "pagination": { "total": 5, "page": 1, "per_page": 20, "total_pages": 1 },
  "meta": { ... }
}
```

---

## 7. Answer Endpoints

### POST /sessions/{session_id}/answers 🔐

**Purpose:** Submit an audio answer for a specific question.

**Rate Limit:** 20 requests / user / hour

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `question_id` | string | Yes | ObjectId of the question being answered |
| `audio` | File (WebM/OGG) | Yes | Audio recording of the answer |

**Validation Rules:**
- `question_id`: Must belong to this session
- `audio`: MIME type `audio/webm` or `audio/ogg`, max 50 MB

**Success Response — 202 Accepted:**
```json
{
  "data": {
    "id": "507f191e810c19729de860ed",
    "question_id": "507f191e810c19729de860ec",
    "session_id": "507f191e810c19729de860eb",
    "status": "processing",
    "submitted_at": "2026-08-09T11:03:27Z"
  },
  "meta": { ... }
}
```

---

### POST /sessions/{session_id}/answers/skip 🔐

**Purpose:** Skip the current question (uses one skip credit).

**Request Body:**
```json
{ "question_id": "507f191e810c19729de860ec" }
```

**Success Response — 200 OK:**
```json
{
  "data": {
    "question_id": "507f191e810c19729de860ec",
    "skipped": true,
    "skips_remaining": 1
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `NO_SKIPS_REMAINING` | 422 | No more skips allowed |

---

### GET /sessions/{session_id}/answers/{answer_id} 🔐

**Purpose:** Retrieve a submitted answer with its evaluation results.

**Success Response — 200 OK:**
```json
{
  "data": {
    "id": "507f191e810c19729de860ed",
    "question_id": "507f191e810c19729de860ec",
    "status": "completed",
    "submission": {
      "audio_duration_seconds": 87,
      "submitted_at": "2026-08-09T11:03:27Z"
    },
    "transcription": {
      "text": "FastAPI uses Python's native async/await...",
      "word_count": 94
    },
    "evaluation": {
      "score": 7.5,
      "max_score": 10,
      "rubric_breakdown": {
        "technical_accuracy": 8.0,
        "completeness": 7.0,
        "clarity": 7.5
      },
      "rationale": "The candidate correctly identified the async/ASGI difference...",
      "missing_concepts": ["dependency injection", "automatic OpenAPI generation"],
      "model_answer": "FastAPI is built on ASGI and natively supports..."
    },
    "voice_analysis": {
      "words_per_minute": 112,
      "filler_word_count": 4,
      "voice_confidence_score": 71
    }
  },
  "meta": { ... }
}
```

---

## 8. FaceSense Endpoints

### POST /facesense/analyze 🔐

**Purpose:** Analyze a single webcam frame for facial emotion during an interview.

**Rate Limit:** 300 requests / session / 15 minutes (≈ 1 frame per 3 seconds)

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `session_id` | string | Yes | Active session ObjectId |
| `question_index` | integer | Yes | Current question position (1-indexed) |
| `frame` | File (JPEG/PNG) | Yes | Webcam frame, max 500 KB |
| `client_timestamp` | string | Yes | ISO 8601 client-side timestamp |

**Success Response — 200 OK:**
```json
{
  "data": {
    "emotion": "confident",
    "confidence": 0.82,
    "face_detected": true,
    "bounding_box": { "x": 120, "y": 45, "width": 200, "height": 230 }
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `NO_FACE_DETECTED` | 200 | No face found in frame (still 200, not error) |
| `FACESENSE_DISABLED` | 422 | FaceSense not enabled for this session |

**Security Notes:**
- Raw frames are processed and immediately discarded — not stored
- Only the emotion label and confidence score are stored in MongoDB
- Frame file is validated as JPEG or PNG via magic bytes

---

### GET /facesense/{session_id}/summary 🔐

**Purpose:** Retrieve the emotion summary for a completed session.

**Success Response — 200 OK:**
```json
{
  "data": {
    "session_id": "507f191e810c19729de860eb",
    "status": "completed",
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
    "frames_analyzed": 420
  },
  "meta": { ... }
}
```

---

## 9. VoiceSense Endpoints

### POST /voicesense/analyze 🔐

**Purpose:** Process audio for voice analysis (called automatically when an answer is submitted).

> This endpoint is typically called internally by the evaluation pipeline, not directly by the frontend. It is documented for completeness and testing purposes.

**Request:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| `answer_id` | string | Yes |
| `session_id` | string | Yes |
| `audio` | File (WebM/OGG/WAV) | Yes |

**Success Response — 200 OK:**
```json
{
  "data": {
    "answer_id": "507f191e810c19729de860ed",
    "transcription": "FastAPI uses Python's native async/await...",
    "voice_metrics": {
      "words_per_minute": 112,
      "pitch_mean_hz": 145.3,
      "pitch_std_hz": 22.1,
      "pause_count": 3,
      "filler_words": ["um", "like"],
      "filler_word_count": 4
    },
    "voice_confidence_score": 71,
    "articulation_score": 78
  },
  "meta": { ... }
}
```

---

### GET /voicesense/{session_id}/summary 🔐

**Purpose:** Retrieve aggregate voice analysis for a session.

**Success Response — 200 OK:**
```json
{
  "data": {
    "session_id": "507f191e810c19729de860eb",
    "aggregate": {
      "avg_words_per_minute": 108,
      "avg_pitch_mean_hz": 142.7,
      "total_filler_words": 18,
      "avg_voice_confidence_score": 69,
      "overall_voice_score": 71
    }
  },
  "meta": { ... }
}
```

---

## 10. HireScore Endpoints

### GET /hirescore/{session_id} 🔐

**Purpose:** Retrieve the HireScore composite result for a completed session.

**Success Response — 200 OK:**
```json
{
  "data": {
    "session_id": "507f191e810c19729de860eb",
    "composite_score": 72,
    "recommendation": "hire",
    "recommendation_label": "Hire",
    "dimensions": {
      "technical": {
        "score": 75,
        "label": "Good",
        "weight": 0.40,
        "improvement_areas": ["System design fundamentals", "Time complexity analysis"]
      },
      "communication": {
        "score": 71,
        "label": "Good",
        "weight": 0.25,
        "improvement_areas": ["Reduce filler words", "Use STAR method"]
      },
      "confidence": {
        "score": 68,
        "label": "Moderate",
        "weight": 0.20,
        "improvement_areas": ["Maintain eye contact"]
      },
      "presence": {
        "score": 72,
        "label": "Good",
        "weight": 0.15,
        "improvement_areas": ["Vary pitch deliberately"]
      }
    },
    "score_breakdown": {
      "max_possible": 100,
      "answers_evaluated": 9,
      "answers_skipped": 1
    },
    "created_at": "2026-08-09T11:42:30Z"
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `SESSION_NOT_COMPLETED` | 422 | Session is still in progress |
| `SCORE_NOT_READY` | 202 | Score computation in progress |

---

### GET /hirescore/history 🔐

**Purpose:** Retrieve score history for the authenticated user across all sessions.

**Query Parameters:** Standard pagination params.

**Success Response — 200 OK:**
```json
{
  "data": [
    {
      "session_id": "507f191e810c19729de860eb",
      "interview_type": "mixed",
      "composite_score": 72,
      "recommendation": "hire",
      "created_at": "2026-08-09T11:42:30Z"
    },
    {
      "session_id": "607f191e810c19729de860fc",
      "interview_type": "technical",
      "composite_score": 65,
      "recommendation": "hire",
      "created_at": "2026-08-05T14:22:00Z"
    }
  ],
  "pagination": { "total": 2, "page": 1, "per_page": 20, "total_pages": 1 },
  "meta": { ... }
}
```

---

## 11. Report Endpoints

### GET /reports/{session_id} 🔐

**Purpose:** Retrieve report metadata and download URL for a session.

**Success Response — 200 OK:**
```json
{
  "data": {
    "id": "507f191e810c19729de860f2",
    "session_id": "507f191e810c19729de860eb",
    "status": "completed",
    "file_name": "gethire_report_507f191e.pdf",
    "file_size_bytes": 512000,
    "download_url": "https://storage.gethire.app/reports/signed_token_abc123.pdf",
    "download_url_expires_at": "2026-08-16T11:43:00Z",
    "generated_at": "2026-08-09T11:43:00Z",
    "is_public": false,
    "public_share_url": null
  },
  "meta": { ... }
}
```

**Error Responses:**
| Code | HTTP Status | Condition |
|---|---|---|
| `REPORT_NOT_READY` | 202 | Report generation in progress |
| `REPORT_FAILED` | 500 | Report generation failed |

---

### POST /reports/{session_id}/share 🔐

**Purpose:** Enable public sharing of a report by generating a share token.

**Request Body:** Empty (`{}`)

**Success Response — 200 OK:**
```json
{
  "data": {
    "public_share_url": "https://gethire.app/reports/share/pub_xyz789",
    "expires_at": null,
    "is_public": true
  },
  "meta": { ... }
}
```

---

### DELETE /reports/{session_id}/share 🔐

**Purpose:** Revoke the public share link for a report.

**Success Response — 200 OK:**
```json
{
  "data": { "is_public": false, "public_share_url": null },
  "meta": { ... }
}
```

---

### GET /reports/share/{share_token} 🔓

**Purpose:** View a publicly shared report (no authentication required).

**Success Response — 200 OK:**
Same schema as `GET /reports/{session_id}` but without personal user information (name, email masked).

---

## 12. Admin Endpoints

> All admin endpoints require `role: "admin"` and are prefixed `/admin/`.

### GET /admin/users 🛡️

**Purpose:** List all registered users with pagination.

**Query Parameters:** Standard pagination + optional `role` filter, `search` (email/name).

**Success Response — 200 OK:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "alice@example.com",
      "full_name": "Alice Johnson",
      "role": "candidate",
      "is_deleted": false,
      "created_at": "2026-08-09T10:00:00Z",
      "last_login_at": "2026-08-09T11:00:00Z"
    }
  ],
  "pagination": { "total": 250, "page": 1, "per_page": 20, "total_pages": 13 },
  "meta": { ... }
}
```

---

### GET /admin/users/{user_id} 🛡️

**Purpose:** Retrieve full user profile for admin review.

---

### DELETE /admin/users/{user_id} 🛡️

**Purpose:** Soft-delete a user account.

**Success Response — 200 OK:**
```json
{
  "data": { "message": "User account deactivated.", "user_id": "507f..." },
  "meta": { ... }
}
```

---

### GET /admin/analytics/overview 🛡️

**Purpose:** Platform usage metrics overview.

**Success Response — 200 OK:**
```json
{
  "data": {
    "total_users": 247,
    "total_sessions": 1893,
    "sessions_this_week": 143,
    "avg_composite_score": 68.4,
    "recommendation_distribution": {
      "strong_hire": 0.12,
      "hire": 0.41,
      "hold": 0.33,
      "no_hire": 0.14
    },
    "top_interview_type": "mixed"
  },
  "meta": { ... }
}
```

---

## 13. Utility Endpoints

### GET /health 🔓

**Purpose:** Check service health and readiness.

**Success Response — 200 OK:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ollama": "connected",
    "facesense_model": "loaded",
    "voicesense_model": "loaded"
  },
  "timestamp": "2026-08-09T10:30:00Z"
}
```

**Degraded Response — 200 OK (partial degradation):**
```json
{
  "status": "degraded",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ollama": "unavailable",
    "facesense_model": "loaded",
    "voicesense_model": "loaded"
  }
}
```

**Unhealthy Response — 503 Service Unavailable:**
Returned when the database is unreachable.

---

### GET /config 🔓

**Purpose:** Return public client configuration and enabled feature flags.

**Success Response — 200 OK:**
```json
{
  "data": {
    "features": {
      "facesense_enabled": true,
      "voicesense_enabled": true,
      "report_sharing_enabled": true,
      "social_login_enabled": false
    },
    "limits": {
      "max_resume_size_mb": 5,
      "max_questions_per_session": 20,
      "max_skips_per_session": 2,
      "max_audio_duration_seconds": 180
    }
  },
  "meta": { ... }
}
```

---

## 14. Error Code Reference

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body failed schema validation |
| `MISSING_TOKEN` | 401 | No Authorization header or cookie |
| `INVALID_TOKEN` | 401 | JWT signature verification failed |
| `TOKEN_EXPIRED` | 401 | JWT exp claim in the past |
| `TOKEN_REUSE_DETECTED` | 401 | Refresh token already rotated (possible theft) |
| `UNAUTHORIZED` | 401 | Generic unauthenticated access |
| `FORBIDDEN` | 403 | Authenticated but insufficient permission |
| `ACCOUNT_LOCKED` | 403 | Account temporarily locked |
| `NOT_FOUND` | 404 | Generic resource not found |
| `RESUME_NOT_FOUND` | 404 | Resume ID does not exist |
| `SESSION_NOT_FOUND` | 404 | Session ID does not exist |
| `QUESTION_NOT_FOUND` | 404 | Question position out of range |
| `EMAIL_ALREADY_EXISTS` | 409 | Registration with duplicate email |
| `ACTIVE_SESSION_EXISTS` | 409 | User already has an in-progress session |
| `RESUME_IN_USE` | 409 | Resume attached to an active session |
| `SESSION_COMPLETED` | 410 | Session is already finished |
| `REPORT_NOT_READY` | 202 | Report generation not complete |
| `SCORE_NOT_READY` | 202 | Score computation not complete |
| `FILE_TOO_LARGE` | 413 | Upload exceeds size limit |
| `INVALID_FILE_TYPE` | 415 | MIME type not accepted |
| `FILE_CORRUPTED` | 422 | File cannot be parsed |
| `RESUME_NOT_PARSED` | 422 | Resume parsing not complete |
| `SESSION_NOT_COMPLETED` | 422 | Scoring attempted on incomplete session |
| `NO_SKIPS_REMAINING` | 422 | Skip limit reached |
| `FACESENSE_DISABLED` | 422 | FaceSense not enabled for session |
| `INVALID_OTP` | 400 | OTP does not match |
| `OTP_EXPIRED` | 400 | OTP past expiry |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_UNAVAILABLE` | 503 | Ollama service unreachable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 15. Rate Limit Reference

| Endpoint | Limit | Window | Scope |
|---|---|---|---|
| `POST /auth/register` | 5 | 1 hour | Per IP |
| `POST /auth/login` | 10 | 1 minute | Per IP |
| `POST /auth/forgot-password` | 3 | 15 minutes | Per IP |
| `POST /auth/reset-password` | 5 | 15 minutes | Per IP |
| `POST /auth/refresh` | 30 | 1 hour | Per user |
| `POST /resumes/upload` | 10 | 1 hour | Per user |
| `POST /sessions` | 5 | 1 hour | Per user |
| `POST /sessions/{id}/answers` | 20 | 1 hour | Per user |
| `POST /facesense/analyze` | 300 | 15 minutes | Per session |
| `GET /admin/*` | 200 | 1 minute | Per admin user |
| All other authenticated | 500 | 1 minute | Per user |
| All other unauthenticated | 100 | 1 minute | Per IP |

---

> **Related Documents:**  
> [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [DATABASE.md](./DATABASE.md) · [SECURITY.md](./SECURITY.md) · [TRD.md](./TRD.md)
