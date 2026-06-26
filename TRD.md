# Smart Interviewer TRD

## Architecture Style

Microservice-Inspired Modular Monolith

Reason:
Suitable for student teams while remaining scalable.

## Modules

### Module 1 Resume Service

Responsibilities:
- PDF Parsing
- Resume Analysis
- Skill Extraction

Libraries:
- PyMuPDF
- pdfplumber

Input:
resume.pdf

Output:
skills.json

---

### Module 2 Interview Service

Responsibilities:
- Question Generation
- Interview Flow
- Follow-Up Questions

Model:
Qwen 3 via Ollama

Endpoints:

POST /generate-questions

POST /follow-up

---

### Module 3 Evaluation Service

Responsibilities:
- Technical Evaluation
- Communication Analysis

Endpoints:

POST /evaluate-answer

Output:

technical_score

communication_score

feedback

---

### Module 4 Face Emotion Service

Dataset:
FER-2013

Model:
EfficientNetB0

Output:
emotion
confidence

---

### Module 5 Voice Emotion Service

Datasets:
RAVDESS
CREMA-D
TESS
SAVEE

Features:
MFCC
Mel Spectrogram

Model:
CNN + BiLSTM

---

### Module 6 Scoring Engine

Inputs:
Technical Score
Communication Score
Face Score
Voice Score

Formula:

Overall Score =
0.50 Technical
0.20 Communication
0.15 Face
0.15 Voice

Output:
Final Recommendation

---

### Database Schema

Users

Interviews

Questions

Answers

Reports

Analytics

---

### Deployment

Frontend:
Vercel

Backend:
Render

Database:
MongoDB Atlas Free Tier

AI:
Local Ollama Server

Cost:
₹0 Monthly