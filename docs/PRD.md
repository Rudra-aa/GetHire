# GetHire — Product Requirements Document (PRD)

> **Document Version:** 1.0.0  
> **Status:** Approved for Development  
> **Last Updated:** 2026-08-09  
> **Author:** Product & Engineering Team  
> **Related Documents:** [TRD.md](./TRD.md) · [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [API_SPEC.md](./API_SPEC.md)

---

## Table of Contents

1. [Vision](#1-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [User Journey](#4-user-journey)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [User Stories](#7-user-stories)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Success Metrics](#9-success-metrics)
10. [Constraints and Assumptions](#10-constraints-and-assumptions)
11. [Out of Scope](#11-out-of-scope)
12. [Future Scope](#12-future-scope)

---

## 1. Vision

**GetHire** empowers every candidate — regardless of background or access — to walk into a technical interview fully prepared.

By replacing static question banks and generic scoring with an AI-driven engine that reads your actual resume, generates context-aware questions, evaluates your answers in real-time, and analyzes how you present yourself under pressure, GetHire simulates the full interview experience and delivers actionable feedback no generic platform can match.

**North Star:** A candidate who completes three GetHire sessions should enter their real interview with measurably higher confidence and demonstrably better answers.

---

## 2. Problem Statement

### 2.1 Current Market Gaps

| Problem | Impact |
|---|---|
| Interview prep platforms use generic, static question banks | Candidates are not tested on their actual skills |
| No platform provides real-time communication feedback | Candidates are unaware of nervous habits, filler words, or visual cues |
| Existing AI tools depend on paid APIs (OpenAI, etc.) | Inaccessible for students with no budget |
| Post-interview feedback is superficial | Candidates cannot pinpoint what to improve |
| No unified score that captures both technical and behavioral performance | Hiring readiness is guesswork |

### 2.2 Root Cause

Existing platforms treat interview preparation as a knowledge-retrieval problem. GetHire treats it as a **full-stack performance problem** — combining technical knowledge, communication quality, emotional control, and composure under pressure.

---

## 3. Target Users

### 3.1 Primary User Segments

#### Segment A — Final-Year Engineering Students
- **Profile:** 20–22 years old, preparing for campus placements
- **Pain Points:** No real interview experience, unsure what to expect, no feedback source
- **Goal:** Secure their first full-time position
- **Usage Pattern:** 3–5 sessions per week during placement season

#### Segment B — Job Seekers (0–3 Years Experience)
- **Profile:** Recent graduates switching roles or companies
- **Pain Points:** Want targeted prep for specific roles; need honest performance assessment
- **Goal:** Improve interview-to-offer conversion rate
- **Usage Pattern:** 2–4 sessions per week

#### Segment C — Placement Training Institutes
- **Profile:** Coding bootcamps, university placement cells
- **Pain Points:** Cannot offer 1:1 mock interviews at scale
- **Goal:** Automate interview practice for large student batches
- **Usage Pattern:** Institutional, bulk student accounts

### 3.2 Secondary Users

| Role | Responsibility |
|---|---|
| Platform Administrators | Manage accounts, view analytics, system health |
| Future: Corporate HR | Review candidate HireScore reports (planned) |

---

## 4. User Journey

### 4.1 End-to-End Candidate Flow

```
[Register / Login]
       │
       ▼
[Upload Resume (PDF)]
       │
       ▼
[Resume Parsed → Skills, Projects, Experience Extracted]
       │
       ▼
[Select Interview Mode: Technical / Behavioral / Mixed]
       │
       ▼
[Interview Session Begins]
       │
    ┌──┴──────────────────────────────────────┐
    │         During Each Question:            │
    │  • Question displayed by AI              │
    │  • Candidate records audio response      │
    │  • FaceSense monitors webcam             │
    │  • VoiceSense processes audio            │
    └──┬───────────────────────────────────────┘
       │
       ▼
[Candidate submits answer]
       │
       ▼
[Evaluation Engine scores answer]
       │
       ▼ (loop for N questions)
[Interview Complete]
       │
       ▼
[HireScore Engine computes composite score]
       │
       ▼
[Report Engine generates PDF report]
       │
       ▼
[Dashboard: Score overview, per-question analysis, improvement areas]
```

---

## 5. Functional Requirements

### 5.1 Authentication Module (FR-AUTH)

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-01 | User registration with email and password | Must Have |
| FR-AUTH-02 | User login with JWT access token and refresh token | Must Have |
| FR-AUTH-03 | Password reset via email OTP | Must Have |
| FR-AUTH-04 | Token refresh endpoint | Must Have |
| FR-AUTH-05 | Secure logout (token invalidation) | Must Have |
| FR-AUTH-06 | Role-based access control (Candidate, Admin) | Must Have |
| FR-AUTH-07 | OAuth2 social login (Google) | Should Have |

### 5.2 Resume Intelligence Module (FR-RESUME)

| ID | Requirement | Priority |
|---|---|---|
| FR-RESUME-01 | Accept PDF resume uploads (max 5 MB) | Must Have |
| FR-RESUME-02 | Extract personal information (name, email, phone, LinkedIn) | Must Have |
| FR-RESUME-03 | Extract technical skills with confidence scores | Must Have |
| FR-RESUME-04 | Extract project descriptions and infer technologies used | Must Have |
| FR-RESUME-05 | Extract work experience with dates, roles, and companies | Must Have |
| FR-RESUME-06 | Extract education history | Must Have |
| FR-RESUME-07 | Generate a resume quality score (0–100) | Should Have |
| FR-RESUME-08 | Store parsed resume data as structured JSON | Must Have |
| FR-RESUME-09 | Support multiple resume versions per user | Should Have |
| FR-RESUME-10 | Detect missing critical sections and warn user | Should Have |

### 5.3 Interview Engine Module (FR-INTERVIEW)

| ID | Requirement | Priority |
|---|---|---|
| FR-INTERVIEW-01 | Generate personalized interview questions from parsed resume | Must Have |
| FR-INTERVIEW-02 | Support interview types: Technical, Behavioral, Mixed | Must Have |
| FR-INTERVIEW-03 | Support configurable session length (5, 10, 15 questions) | Must Have |
| FR-INTERVIEW-04 | Generate adaptive follow-up questions based on prior answer | Should Have |
| FR-INTERVIEW-05 | Display one question at a time with timer | Must Have |
| FR-INTERVIEW-06 | Allow candidate to record audio response | Must Have |
| FR-INTERVIEW-07 | Allow candidate to skip a question (max 2 skips per session) | Should Have |
| FR-INTERVIEW-08 | Persist session state (pause/resume within 24 hours) | Should Have |
| FR-INTERVIEW-09 | Log question timestamps and response durations | Must Have |

### 5.4 Evaluation Engine Module (FR-EVAL)

| ID | Requirement | Priority |
|---|---|---|
| FR-EVAL-01 | Transcribe candidate audio responses to text | Must Have |
| FR-EVAL-02 | Score each answer on a 0–10 rubric (technical accuracy, completeness, clarity) | Must Have |
| FR-EVAL-03 | Provide per-answer rationale explaining the score | Must Have |
| FR-EVAL-04 | Identify key missing concepts in each answer | Must Have |
| FR-EVAL-05 | Generate a model ideal answer for comparison | Should Have |
| FR-EVAL-06 | Detect filler phrases (e.g., "um," "like," "you know") | Should Have |
| FR-EVAL-07 | Compute overall answer quality score across session | Must Have |

### 5.5 FaceSense Module (FR-FACE)

| ID | Requirement | Priority |
|---|---|---|
| FR-FACE-01 | Request webcam access from candidate at session start | Must Have |
| FR-FACE-02 | Detect facial emotion (neutral, confident, nervous, confused, happy) | Must Have |
| FR-FACE-03 | Log emotion states at configurable intervals (e.g., every 3 seconds) | Must Have |
| FR-FACE-04 | Compute a confidence trend score across the interview | Must Have |
| FR-FACE-05 | Generate emotion timeline for inclusion in report | Must Have |
| FR-FACE-06 | Gracefully degrade if webcam is unavailable | Must Have |

### 5.6 VoiceSense Module (FR-VOICE)

| ID | Requirement | Priority |
|---|---|---|
| FR-VOICE-01 | Process audio recordings from each answer | Must Have |
| FR-VOICE-02 | Measure speech rate (words per minute) | Must Have |
| FR-VOICE-03 | Measure pitch variation | Must Have |
| FR-VOICE-04 | Detect voice tremor or hesitation pauses | Should Have |
| FR-VOICE-05 | Compute voice confidence score (0–100) | Must Have |
| FR-VOICE-06 | Generate per-answer voice analytics | Must Have |

### 5.7 HireScore Module (FR-SCORE)

| ID | Requirement | Priority |
|---|---|---|
| FR-SCORE-01 | Compute composite hiring readiness score (0–100) | Must Have |
| FR-SCORE-02 | Display dimensional breakdown (Technical, Communication, Confidence, Presence) | Must Have |
| FR-SCORE-03 | Generate hiring recommendation: Strong Hire / Hire / Hold / No Hire | Must Have |
| FR-SCORE-04 | Show improvement suggestions for each dimension | Must Have |
| FR-SCORE-05 | Track score trend across multiple sessions | Should Have |

### 5.8 Report Engine Module (FR-REPORT)

| ID | Requirement | Priority |
|---|---|---|
| FR-REPORT-01 | Generate a structured PDF report after each session | Must Have |
| FR-REPORT-02 | Include per-question breakdown in report | Must Have |
| FR-REPORT-03 | Include emotion timeline chart in report | Must Have |
| FR-REPORT-04 | Include HireScore breakdown in report | Must Have |
| FR-REPORT-05 | Make report downloadable via signed URL | Must Have |
| FR-REPORT-06 | Allow report sharing via a unique public link | Should Have |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target |
|---|---|
| API response time (non-AI) | < 200 ms (95th percentile) |
| LLM response time (Ollama) | < 8 seconds per question |
| Resume parsing time | < 5 seconds |
| Evaluation scoring time | < 10 seconds per answer |
| PDF report generation | < 15 seconds |
| FaceSense frame processing | < 100 ms per frame |

### 6.2 Reliability

| Requirement | Target |
|---|---|
| API availability | 99.5% uptime |
| AI model availability | Best-effort with graceful fallback |
| Data durability | 99.99% (MongoDB Atlas with replication) |
| Session recovery | Resume within 24 hours if browser is closed |

### 6.3 Security

| Requirement | Standard |
|---|---|
| Authentication | JWT (HS256) with 15-minute expiry + refresh tokens |
| Password storage | bcrypt (cost factor 12) |
| Data in transit | HTTPS/TLS 1.2+ |
| File uploads | Type validation, size limits, virus scanning ready |
| Input validation | All inputs validated server-side via Pydantic |
| Rate limiting | Applied per IP and per authenticated user |

> See [SECURITY.md](./SECURITY.md) for the complete security specification.

### 6.4 Scalability

- Stateless backend: horizontal scaling via container replication
- AI processing decoupled into async Celery workers
- MongoDB Atlas auto-scaling for storage
- Redis for shared session cache across instances

### 6.5 Accessibility

- WCAG 2.1 AA compliance target for all frontend components
- Keyboard navigation support
- Screen reader-compatible ARIA attributes
- Minimum 4.5:1 color contrast ratio

### 6.6 Maintainability

- All modules must have > 80% unit test coverage
- All API endpoints must have integration tests
- Code must pass ESLint (frontend) and Ruff + Black (backend) without errors
- All modules must be independently replaceable

---

## 7. User Stories

### Authentication

```
US-AUTH-01: As a new user, I want to register with my email and password
            so that I can create a GetHire account.

US-AUTH-02: As a registered user, I want to log in securely
            so that my interview data is private.

US-AUTH-03: As a user who forgot my password, I want to reset it via email
            so that I can regain access to my account.
```

### Resume

```
US-RESUME-01: As a candidate, I want to upload my PDF resume
              so that the system can generate questions tailored to my background.

US-RESUME-02: As a candidate, I want to see what skills were extracted from my resume
              so that I can correct any errors before starting.

US-RESUME-03: As a candidate, I want to upload a new version of my resume
              so that my interviews reflect my current experience.
```

### Interview

```
US-INTERVIEW-01: As a candidate, I want to choose my interview type (technical/behavioral/mixed)
                 so that I can practice for the kind of interviews I'll face.

US-INTERVIEW-02: As a candidate, I want to see one question at a time
                 so that I can focus without distraction.

US-INTERVIEW-03: As a candidate, I want to record my verbal answer
                 so that the system can evaluate how I communicate, not just what I write.

US-INTERVIEW-04: As a candidate, I want to pause my interview and resume later
                 so that I can practice without time pressure.
```

### Evaluation and Feedback

```
US-EVAL-01: As a candidate, I want to see a score for each answer
            so that I know which questions I answered well.

US-EVAL-02: As a candidate, I want to see what I missed in my answer
            so that I know exactly what to study.

US-EVAL-03: As a candidate, I want to see an ideal model answer
            so that I can understand what a strong response looks like.
```

### Analysis

```
US-FACE-01: As a candidate, I want the system to track my facial expressions
            so that I get feedback on how I appear during the interview.

US-VOICE-01: As a candidate, I want to know my speech rate and filler word count
             so that I can improve how I communicate verbally.
```

### Scoring and Reports

```
US-SCORE-01: As a candidate, I want to see my overall HireScore after every session
             so that I can track my progress over time.

US-REPORT-01: As a candidate, I want to download a PDF report of my interview
              so that I can review it offline and share it with a mentor.
```

### Administration

```
US-ADMIN-01: As an admin, I want to view all registered users
             so that I can manage the platform.

US-ADMIN-02: As an admin, I want to view session analytics
             so that I can understand platform usage patterns.
```

---

## 8. Acceptance Criteria

### AC-RESUME-03 — Resume Skill Extraction

**Given** a candidate uploads a valid PDF resume  
**When** the parsing pipeline completes  
**Then:**
- The extracted skills list must contain at least 80% of explicitly listed skills
- Each skill must have a confidence score between 0 and 1
- Parsing must complete within 5 seconds for files under 2 MB
- If parsing fails, a structured error response must be returned with a retry option

### AC-INTERVIEW-01 — Question Generation

**Given** a parsed resume is available  
**When** the candidate starts an interview session  
**Then:**
- At least 70% of generated questions must reference skills or projects from the resume
- The first question must arrive within 8 seconds
- Questions must not repeat within the same session

### AC-EVAL-02 — Answer Scoring

**Given** a candidate submits a transcribed answer  
**When** the evaluation engine processes it  
**Then:**
- A score between 0 and 10 must be returned
- A rationale string must accompany the score
- A list of missing concepts must be returned
- Evaluation must complete within 10 seconds

### AC-SCORE-01 — HireScore Computation

**Given** an interview session is complete with all evaluations  
**When** HireScore is computed  
**Then:**
- A composite score between 0 and 100 must be returned
- All four dimensions (Technical, Communication, Confidence, Presence) must have individual scores
- A hiring recommendation string must be included

---

## 9. Success Metrics

### Product Metrics

| Metric | Target (Month 3) |
|---|---|
| Interview Completion Rate | > 70% of started sessions |
| Session Repeat Rate | > 40% of users complete 3+ sessions |
| Report Download Rate | > 60% of completed sessions |
| User Satisfaction (post-session survey) | > 4.0 / 5.0 |

### Technical Metrics

| Metric | Target |
|---|---|
| API P95 Response Time | < 200 ms |
| LLM Question Generation Time | < 8 seconds |
| Resume Parsing Success Rate | > 97% for valid PDFs |
| Evaluation Accuracy (manual audit sample) | > 80% agreement with human evaluator |
| System Uptime | > 99.5% |

### Engagement Metrics

| Metric | Target (Month 3) |
|---|---|
| Weekly Active Users | > 500 |
| Sessions per User per Week | > 2 |
| Average Session Completion Time | 20–35 minutes |

---

## 10. Constraints and Assumptions

### Constraints

- **No paid API dependencies** — All AI runs locally via Ollama. No OpenAI, Anthropic, or Gemini API calls.
- **File size limit** — Resume uploads limited to 5 MB. Audio recordings limited to 50 MB per session.
- **Browser compatibility** — Must support Chrome 110+, Firefox 110+, Safari 16+. No IE11 support.
- **Internet requirement** — Platform requires internet for MongoDB Atlas connectivity; Ollama may run locally.

### Assumptions

- Candidates have access to a webcam and microphone for full feature utilization
- FaceSense and VoiceSense are optional — the platform must function without them
- Ollama models (Qwen2.5:7b, Llama3.2:3b) are pre-pulled on the server before the backend starts
- MongoDB Atlas free tier is used during development; Atlas M10+ for production

---

## 11. Out of Scope (v1.0)

The following features are explicitly excluded from v1.0 to maintain focus:

- Live coding challenge evaluation (e.g., LeetCode-style)
- Multi-language resume support (non-English)
- Corporate HR portal for reviewing candidate scores
- Real-time 1:1 video interview with a human
- Mobile native applications (iOS / Android)
- Payment gateway and subscription management
- Company-specific interview templates

---

## 12. Future Scope

| Feature | Target Version |
|---|---|
| Company-specific interview mode (Google, Amazon, etc.) | v1.5 |
| Coding interview with sandboxed code editor | v2.0 |
| Multi-language support (Hindi, Spanish, Mandarin) | v1.5 |
| AI career coach with personalized learning paths | v2.0 |
| Integration with LinkedIn profile import | v1.5 |
| Corporate HR portal and candidate pipeline | v2.5 |
| Mobile PWA | v1.5 |
| Peer-to-peer mock interview matching | v2.5 |
| AI-powered resume builder | v2.0 |

---

> **Related Documents:**  
> [README.md](./README.md) · [TRD.md](./TRD.md) · [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [API_SPEC.md](./API_SPEC.md) · [SECURITY.md](./SECURITY.md)
