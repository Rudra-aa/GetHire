# GetHire — AI-Powered Interview Readiness Platform

> **Version:** 1.0.0 — Pre-Development Blueprint  
> **Status:** Documentation Phase  
> **Last Updated:** 2026-08-09  
> **Maintainer:** GetHire Engineering Team

---

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Running the Project](#running-the-project)
- [Documentation Index](#documentation-index)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**GetHire** is an AI-powered Interview Readiness Platform that helps students and professionals prepare for technical interviews through intelligent automation. The platform combines resume analysis, personalized interview generation, AI-driven answer evaluation, facial emotion recognition, voice tone analysis, and a composite hiring readiness score — all without relying on paid third-party AI APIs.

GetHire is designed as a modular, production-grade SaaS product. Each major feature is an isolated module with clearly defined boundaries, enabling independent development, testing, and replacement.

### Why GetHire?

| Problem | GetHire Solution |
|---|---|
| Generic interview prep platforms | Personalized interviews generated from your actual resume |
| No feedback on communication | Real-time FaceSense + VoiceSense analysis |
| Vague scoring | Transparent multi-dimensional HireScore |
| Dependency on paid APIs (ChatGPT, etc.) | 100% local AI via Ollama, Qwen, and Llama |
| No actionable post-interview report | Detailed PDF reports with improvement areas |

---

## Core Features

### 🧠 Resume Intelligence
- PDF resume upload and parsing
- Automatic skill, project, and experience extraction
- Resume quality scoring
- Technology stack identification

### 🎤 Interview Engine
- AI-generated personalized interview questions
- Adaptive follow-up question generation
- Support for Technical, Behavioral, and mixed interview modes
- Session state management with pause/resume

### 📊 Evaluation Engine
- Per-answer AI scoring using LLM-based rubrics
- Keyword coverage analysis
- Communication clarity scoring
- Comparative answer benchmarking

### 👁️ FaceSense — Facial Emotion Recognition
- Real-time webcam-based emotion detection
- Confidence trend tracking across the interview
- Emotion timeline visualization in reports

### 🎙️ VoiceSense — Voice Analysis
- Speech rate, pitch, and clarity analysis
- Filler word detection
- Voice confidence and articulation scoring

### 🏆 HireScore — Hiring Readiness Score
- Composite weighted score from all modules
- Dimensional breakdown (Technical, Communication, Confidence, Presence)
- Percentile ranking relative to session history
- Hiring recommendation (Strong Hire / Hire / No Hire)

### 📄 Report Engine
- Automated PDF report generation post-interview
- Per-question analysis with improvement suggestions
- Downloadable and shareable report links

---

## Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict mode) |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| 3D Elements | Three.js (landing page / score visualization) |
| State Management | Zustand |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI |
| Language | Python 3.11+ |
| Runtime Server | Uvicorn |
| Task Queue | Celery + Redis |
| Validation | Pydantic v2 |
| Auth | PyJWT + Passlib (bcrypt) |
| PDF Generation | ReportLab / WeasyPrint |

### Database
| Layer | Technology |
|---|---|
| Primary Database | MongoDB (via MongoDB Atlas) |
| ODM | Motor (async) + Beanie |
| Caching | Redis |
| File Storage | Local FS (dev) / S3-compatible (prod) |

### AI / ML
| Layer | Technology |
|---|---|
| LLM Runtime | Ollama |
| Language Models | Qwen2.5, Llama 3.2 |
| NLP | Hugging Face Transformers |
| Computer Vision | OpenCV + TensorFlow |
| Speech Processing | PyTorch + Librosa |

### Deployment
| Target | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| CI/CD | GitHub Actions |

---

## Repository Structure

```
gethire/
├── docs/                          # Engineering documentation (this directory)
│   ├── README.md                  # This file
│   ├── PRD.md                     # Product Requirements Document
│   ├── TRD.md                     # Technical Requirements Document
│   ├── SYSTEM_ARCHITECTURE.md     # Architecture diagrams and module design
│   ├── DATABASE.md                # MongoDB schema and collection design
│   ├── API_SPEC.md                # Full REST API specification
│   ├── SECURITY.md                # Security design and threat model
│   └── DEVELOPMENT_GUIDE.md       # Local setup, git workflow, standards
│
├── frontend/                      # React + TypeScript application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── backend/                       # FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth/
│   │   │       ├── resume/
│   │   │       ├── interview/
│   │   │       ├── evaluation/
│   │   │       ├── facesense/
│   │   │       ├── voicesense/
│   │   │       ├── hirescore/
│   │   │       └── reports/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── ai/                            # AI model services and pipelines
│   ├── resume_parser/
│   ├── question_generator/
│   ├── answer_evaluator/
│   ├── facesense/
│   ├── voicesense/
│   └── hirescore/
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── Makefile
```

---

## Getting Started

### Prerequisites

Ensure the following are installed on your machine:

| Tool | Minimum Version |
|---|---|
| Node.js | 20.x LTS |
| Python | 3.11+ |
| Docker | 24.x+ |
| Docker Compose | 2.x+ |
| Ollama | Latest |
| Git | 2.40+ |
| MongoDB | Atlas or local 7.x |

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/gethire.git
cd gethire
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in required values
```

> ⚠️ Never commit `.env` to version control. See [SECURITY.md](./SECURITY.md) for secret management guidelines.

### 3. Pull AI Models via Ollama

```bash
ollama pull qwen2.5:7b
ollama pull llama3.2:3b
```

### 4. Start Infrastructure Services

```bash
docker-compose up -d mongo redis
```

### 5. Install Dependencies

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

---

## Running the Project

### Development Mode (All Services)

```bash
# Option 1: Docker Compose (recommended)
docker-compose up --build

# Option 2: Manual (each in a separate terminal)
# Terminal 1 — Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — Ollama
ollama serve

# Terminal 4 — Celery Worker
cd backend && celery -A app.workers.celery_app worker --loglevel=info
```

### Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| Ollama API | http://localhost:11434 |

---

## Documentation Index

| Document | Description |
|---|---|
| [PRD.md](./PRD.md) | Product vision, user stories, requirements, success metrics |
| [TRD.md](./TRD.md) | Technology choices, module breakdown, performance goals |
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Architecture diagrams, data flow, module design |
| [DATABASE.md](./DATABASE.md) | MongoDB collection schemas, indexes, relationships |
| [API_SPEC.md](./API_SPEC.md) | Complete REST API endpoint specification |
| [SECURITY.md](./SECURITY.md) | Auth, RBAC, threat model, OWASP guidelines |
| [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | Local setup, git workflow, coding standards |

---

## Development Roadmap

### Phase 1 — Foundation (Weeks 1–3)
- [x] Project scaffold (frontend + backend)
- [x] Authentication system (JWT + refresh tokens)
- [x] User profile management
- [ ] Resume upload and parsing pipeline

### Phase 2 — Interview Core (Weeks 4–6)
- [ ] AI question generation (Ollama + Qwen)
- [ ] Interview session state management
- [ ] Answer recording and storage
- [ ] Answer evaluation engine

### Phase 3 — Multimodal Analysis (Weeks 7–9)
- [ ] FaceSense integration (webcam + TensorFlow)
- [ ] VoiceSense integration (PyTorch + Librosa)
- [ ] Real-time data streaming

### Phase 4 — Scoring and Reporting (Weeks 10–11)
- [ ] HireScore composite algorithm
- [ ] PDF report generation
- [ ] Analytics dashboard

### Phase 5 — Polish and Deploy (Week 12)
- [ ] CI/CD pipeline
- [ ] Docker production build
- [ ] Vercel (frontend) + Render (backend) deployment
- [ ] End-to-end testing

---

## Contributing

Please read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) before contributing. All contributions must follow the established Git workflow, coding standards, and definition of done.

---

## License

This project is licensed under the MIT License. See `LICENSE` for details.

---

> **Related Documents:**  
> [PRD.md](./PRD.md) · [TRD.md](./TRD.md) · [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) · [SECURITY.md](./SECURITY.md) · [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
