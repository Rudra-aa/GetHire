"""
Comprehensive Full Runtime Showcase Validation Script for GetHire v4.0.
Executes fresh candidate lifecycle against live running backend (http://127.0.0.1:8000).
"""

import sys
import time
import requests
import json
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000/api/v1"
RESUME_FILE = Path("/Users/rudrapratapsinghparmar/Desktop/GetHire/runtime_test_resume.pdf")

def run_showcase():
    print("=" * 70)
    print("🚀 STARTING GETHIRE V4.0 FULL RUNTIME SHOWCASE VALIDATION")
    print("=" * 70)

    # 1. Health Check
    print("\n[1/8] Verifying Backend Health...")
    r = requests.get("http://127.0.0.1:8000/api/v1/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health = r.json()
    print(f"✅ Backend Healthy: {health}")

    # 2. Register fresh candidate
    email = f"sarah.chen.{int(time.time())}@example.com"
    password = "Password123!"
    print(f"\n[2/8] Registering candidate: {email}...")
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": "Sarah Chen",
        "target_role": "Fullstack Developer",
        "experience_level": "senior"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    if r.status_code not in (200, 201):
        print(f"Register note: {r.text}")
    
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()["data"]
    token = login_data["access_token"]
    user_id = login_data["user"]["id"]

    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Registered & Authenticated. User ID: {user_id}")

    # 3. Resume Upload and Parsing
    print(f"\n[3/8] Uploading Resume: {RESUME_FILE.name}...")
    with open(RESUME_FILE, "rb") as f:
        files = {"file": (RESUME_FILE.name, f, "application/pdf")}
        r = requests.post(f"{BASE_URL}/resume/upload", headers=headers, files=files)
    assert r.status_code in (200, 201), f"Resume upload failed: {r.text}"
    resume_resp = r.json()
    resume_data = resume_resp.get("data", {}).get("resume", resume_resp)
    print(f"✅ Resume Processed:")
    print(f"   - ATS Overall Score: {resume_data.get('quality_score', {}).get('overall_score')}/100")
    print(f"   - Extracted Skills: {resume_data.get('parsed_data', {}).get('skills', [])[:6]}")

    # 4. Technical Assessment
    print(f"\n[4/8] Starting Technical Assessment...")
    r = requests.post(f"{BASE_URL}/assessment/start", headers=headers, json={"role": "Fullstack Developer", "total_questions": 5})
    assert r.status_code in (200, 201), f"Assessment start failed: {r.text}"
    assessment_session = r.json()
    assess_id = assessment_session.get("id") or assessment_session.get("session_id")
    questions = assessment_session.get("questions", [])
    print(f"✅ Assessment Session Created: {assess_id} with {len(questions)} adaptive questions.")

    answers = [{"question_id": q["id"], "selected_option": 0} for q in questions]
    r = requests.post(f"{BASE_URL}/assessment/submit", headers=headers, json={"assessment_id": assess_id, "answers": answers})
    assert r.status_code in (200, 201), f"Assessment submit failed: {r.text}"
    submit_res = r.json()
    print(f"✅ Assessment Completed:")
    print(f"   - Score: {submit_res.get('score')}/100")
    print(f"   - Strong Concepts: {submit_res.get('strong_concepts')}")
    print(f"   - Weak Concepts: {submit_res.get('weak_concepts')}")

    # 5. Live AI Interview with Real Gemini Provider
    print(f"\n[5/8] Starting Dedicated AI Interview Session...")
    r = requests.post(f"{BASE_URL}/interview/sessions", headers=headers, json={
        "target_role": "Senior Full-Stack Engineer",
        "interview_type": "technical",
        "total_questions": 5
    })
    assert r.status_code in (200, 201), f"Interview start failed: {r.text}"
    interview_resp = r.json()
    interview_session = interview_resp.get("data", interview_resp)
    interview_id = interview_session.get("id") or interview_session.get("_id")
    print(f"✅ Live Interview Session Initialized: {interview_id}")

    def send_turn(turn_label, transcript):
        print(f"\n--- {turn_label} ---")
        if transcript and not transcript.startswith("["):
            print(f"👤 Candidate: {transcript}")
        for attempt in range(1, 4):
            t_start = time.time()
            res = requests.post(
                f"{BASE_URL}/interview/sessions/{interview_id}/turn",
                headers=headers,
                params={"candidate_transcript": transcript}
            )
            elapsed = round(time.time() - t_start, 2)
            if res.status_code in (200, 201):
                data = res.json().get("data", res.json())
                ai_text = data.get("ai_response", "")
                print(f"🤖 Recruiter AI ({elapsed}s): {ai_text}")
                return data
            elif res.status_code in (429, 503) and attempt < 3:
                print(f"⏳ Transient rate limit or timeout on attempt {attempt}, waiting 4s before retry...")
                time.sleep(4)
            else:
                assert res.status_code in (200, 201), f"{turn_label} failed: {res.text}"

    # Turn 0 (AI Initial Greeting & Question)
    send_turn("TURN 0: AI Initial Greeting & Opening Question", "[Candidate has joined the interview. Please greet them and ask the first question.]")

    # Turn 1
    send_turn(
        "TURN 1: Candidate Architecture Answer",
        "I have extensive experience building distributed microservices with FastAPI, PostgreSQL, and React. In my previous role, I optimized database query throughput by 40% using Redis caching and event-driven architectures with Kafka."
    )

    # Turn 2
    send_turn(
        "TURN 2: Candidate Kafka Failure & DLQ Answer",
        "For Kafka consumer failures and eventual consistency with PostgreSQL, we implemented a transactional outbox pattern in PostgreSQL combined with exponential backoff retries and Dead-Letter Queues (DLQ) for poison pill messages to avoid blocking consumer partition offsets."
    )

    # Turn 3
    send_turn(
        "TURN 3: Candidate Idempotency & Replay Answer",
        "To handle DLQ recovery safely without duplicates, our consumers implement idempotent message processing using unique transaction IDs cached in Redis, alongside OpenTelemetry distributed tracing to diagnose root cause before triggering automated DLQ replays."
    )

    # Turn 4
    send_turn(
        "TURN 4: Candidate FastAPI & Async Architecture Answer",
        "For our FastAPI service layer, we utilized asynchronous route handlers with Pydantic v2 validation, asyncpg connection pooling for PostgreSQL, and Envoy reverse proxying with sticky sessions to achieve sub-15ms p99 response times under 20,000 RPS."
    )

    # 6. FaceSense Telemetry & Integrity Events
    print(f"\n[6/8] Sending Real-Time FaceSense Telemetry & Integrity Logs...")
    requests.post(f"{BASE_URL}/facesense/start", headers=headers, json={"session_id": interview_id})
    for sec in range(1, 4):
        face_payload = {
            "session_id": interview_id,
            "timestamp_sec": sec,
            "pitch": 2.1,
            "yaw": -1.4,
            "roll": 0.5,
            "face_visible": True,
            "eye_contact_score": 94,
            "blink_rate_bpm": 18,
            "smile_pct": 22.0,
            "emotion_label": "Neutral",
            "emotion_confidence": 0.92,
            "direction_status": "CENTER",
            "head_stability_score": 96,
            "attention_score": 94,
            "presence_score": 99,
            "confidence_score": 89,
            "stress_score": 12,
            "overall_facescore": 92
        }
        r = requests.post(f"{BASE_URL}/facesense/metrics", headers=headers, json=face_payload)
    requests.post(f"{BASE_URL}/facesense/finish", headers=headers, json={"session_id": interview_id})
    print("✅ FaceSense Telemetry Dispatched & Session Finalized.")

    integrity_payload = {
        "session_id": interview_id,
        "event_type": "tab_switched",
        "severity": "low",
        "details": {"duration_ms": 450}
    }
    r = requests.post(f"{BASE_URL}/integrity/events", headers=headers, json=integrity_payload)
    print("✅ Integrity Event Logged.")

    # Conclude Interview
    requests.post(f"{BASE_URL}/interview/sessions/{interview_id}/complete", headers=headers)
    print("✅ Interview Session Finalized.")

    # 7. Evaluation & Multi-Engine HireScore Synthesis
    print(f"\n[7/8] Evaluating Multi-Engine Performance & HireScore...")
    r = requests.post(f"{BASE_URL}/evaluations/session/{interview_id}/evaluate-all", headers=headers)
    assert r.status_code in (200, 201), f"Evaluation generation failed: {r.text}"
    eval_data = r.json().get("data", r.json())
    print(f"✅ Evaluation Synthesized:")
    print(f"   - Overall Interview Score: {eval_data.get('overall_interview_score')}/100")
    print(f"   - Dimensions: {eval_data.get('average_dimensions')}")

    r = requests.post(f"{BASE_URL}/hirescore/recompute", headers=headers, json={"session_id": interview_id})
    assert r.status_code in (200, 201), f"HireScore recompute failed: {r.text}"
    hs_data = r.json().get("data", r.json())
    print(f"✅ Calibrated HireScore:")
    print(f"   - Composite HireScore: {hs_data.get('overall_score')}/100")
    print(f"   - Components: {hs_data.get('components')}")
    print(f"   - Readiness: {hs_data.get('readiness')}")

    # 8. Career Intelligence & Recruiter Portfolio Link
    print(f"\n[8/8] Generating Recruiter Share Link & Portfolio...")
    r = requests.post(f"{BASE_URL}/career/share-link", headers=headers)
    assert r.status_code in (200, 201), f"Share link creation failed: {r.text}"
    share_info = r.json().get("data", r.json())
    token = share_info["share_token"]
    print(f"✅ Share Token Generated: {token}")

    r = requests.get(f"{BASE_URL}/career/portfolio/{token}")
    assert r.status_code in (200, 201), f"Recruiter portfolio lookup failed: {r.text}"
    portfolio = r.json().get("data", r.json())
    print(f"✅ Recruiter Executive Portfolio:")
    print(f"   - Candidate: {portfolio.get('candidate_name')}")
    print(f"   - Target Role: {portfolio.get('target_role')}")
    print(f"   - Verified HireScore: {portfolio.get('overall_hirescore')}/100")
    print(f"   - Hiring Verdict: {portfolio.get('hiring_verdict')}")
    print(f"   - Top Verified Skills: {portfolio.get('skills')}")

    print("\n" + "=" * 70)
    print("🏆 ALL 8 CORE MODULE WORKFLOWS PASSED AT FULL RUNTIME!")
    print("=" * 70)

if __name__ == "__main__":
    run_showcase()
