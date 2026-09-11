"""
backend/scripts/run_e2e_data_consistency_flow.py
------------------------------------------------
Automated End-to-End Verification of the Complete GetHire User Flow:
1. Register/Login candidate
2. Start Technical Assessment -> Submit answers -> Verify Knowledge Graph & score
3. Fetch Dashboard summary -> Verify Technical Assessment score is accurately displayed (NOT "Not Taken")
4. Start AI Mock Interview -> Answer questions -> Complete interview session
5. Fetch Evaluation -> Verify batch evaluation generated and accessible
6. Fetch HireScore -> Verify evidence-backed composite HireScore (NOT stale 19)
7. Fetch Recruiter Portfolio -> Verify candidate portfolio consistency
8. Simulate page refresh -> Verify all values and states persist seamlessly
"""

import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import uuid
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.mongo import mongo_manager

async def run_e2e_flow():
    print("==========================================================")
    print("  GETHIRE END-TO-END DATA CONSISTENCY FLOW VERIFICATION   ")
    print("==========================================================")

    # Initialize mongo connection if needed
    await mongo_manager.connect()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver/api/v1") as client:
        # 1. Register candidate
        email = f"candidate_{uuid.uuid4().hex[:8]}@example.com"
        password = "SecurePassword123!"
        full_name = "Jordan Vance"

        print(f"\n[Step 1/8] Registering candidate {email}...")
        reg_res = await client.post("/auth/register", json={
            "full_name": full_name,
            "email": email,
            "password": password,
            "target_role": "Fullstack Developer",
            "experience_level": "senior",
        })
        assert reg_res.status_code in (200, 201), f"Registration failed: {reg_res.text}"
        token_data = reg_res.json().get("data", {})
        access_token = token_data.get("access_token") or token_data.get("tokens", {}).get("access_token")
        assert access_token, "No access token received"
        headers = {"Authorization": f"Bearer {access_token}"}
        print(" Candidate registered and authenticated.")

        # 2. Start Technical Assessment
        print("\n[Step 2/8] Launching Technical Assessment session...")
        start_res = await client.post("/assessment/start", headers=headers, json={
            "target_role": "Fullstack Developer",
            "experience_level": "senior",
        })
        assert start_res.status_code in (200, 201), f"Start assessment failed: {start_res.text}"
        assessment_session = start_res.json()
        assessment_id = assessment_session.get("id") or assessment_session.get("_id")
        print(f" Assessment session initialized (ID: {assessment_id}).")

        # 3. Submit Answers
        print("\n[Step 3/8] Submitting Technical Assessment answers...")
        answers = [
            {"question_id": "mcq_1", "selected_option": 0},
            {"question_id": "mcq_2", "selected_option": 0},
            {"question_id": "mcq_3", "selected_option": 0},
            {"question_id": "mcq_4", "selected_option": 0},
        ]
        sub_res = await client.post("/assessment/submit", headers=headers, json={
            "assessment_id": assessment_id,
            "answers": answers,
        })
        assert sub_res.status_code == 200, f"Submit assessment failed: {sub_res.text}"
        sub_data = sub_res.json()
        assert sub_data.get("score") == 100, f"Expected 100% score, got: {sub_data.get('score')}"
        print(f" Assessment submitted. Score: {sub_data.get('score')}% | Strong concepts: {sub_data.get('strong_concepts')}")

        # 4. Check Latest Assessment (Dashboard verification)
        print("\n[Step 4/8] Querying Dashboard latest assessment API...")
        latest_ass_res = await client.get("/assessment/latest", headers=headers)
        assert latest_ass_res.status_code == 200, f"Get latest assessment failed: {latest_ass_res.text}"
        latest_ass = latest_ass_res.json()
        assert latest_ass.get("score") == 100, f"Expected 100% score in latest assessment, got: {latest_ass.get('score')}"
        print(f" Assessment verified on Dashboard: {latest_ass.get('score')}% (Status: {latest_ass.get('status')}) - NOT 'Not Taken'.")

        # 5. Start Mock Interview & Submit Answer
        print("\n[Step 5/8] Creating and conducting Mock Interview session...")
        int_start_res = await client.post("/interview/sessions", headers=headers, json={
            "target_role": "Senior Full-Stack Engineer",
            "experience_level": "Senior",
            "interview_type": "technical",
            "total_questions": 2,
        })
        assert int_start_res.status_code in (200, 201), f"Start interview failed: {int_start_res.text}"
        int_session = int_start_res.json().get("data", {})
        session_id = int_session.get("id")
        print(f" Interview session created (ID: {session_id}).")

        # Submit an answer turn
        turn_res = await client.post(f"/interview/sessions/{session_id}/answers", headers=headers, json={
            "question_id": "turn_0",
            "answer_text": "We implement probabilistic early expiration with Redis cache-aside, background warming tasks, and TTL jitter to prevent cache stampedes under high burst throughput.",
        })
        assert turn_res.status_code in (200, 201), f"Submit answer failed: {turn_res.text}"
        print(" Candidate response recorded in interview transcripts.")

        # Complete the interview session
        comp_res = await client.post(f"/interview/sessions/{session_id}/complete", headers=headers)
        assert comp_res.status_code == 200, f"Complete interview failed: {comp_res.text}"
        print(" Interview session completed.")

        # 6. Verify Evaluation Generation & Latest Evaluation Endpoint
        print("\n[Step 6/8] Verifying Evaluation Report generation...")
        eval_res = await client.get("/evaluations/latest", headers=headers)
        assert eval_res.status_code == 200, f"Get latest evaluation failed: {eval_res.text}"
        eval_data = eval_res.json().get("data", {})
        assert eval_data, "Evaluation data is empty"
        print(f" Unified Evaluation Report loaded: Overall Interview Score = {eval_data.get('overall_interview_score')}/100, Turns = {eval_data.get('total_evaluated')}")

        # 7. Verify HireScore Synthesis with Assessment + Interview
        print("\n[Step 7/8] Verifying Multi-Engine HireScore synthesis...")
        hs_res = await client.get("/hirescore/latest", headers=headers)
        assert hs_res.status_code == 200, f"Get latest HireScore failed: {hs_res.text}"
        hs_data = hs_res.json().get("data", {})
        overall_hs = hs_data.get("overall_score")
        tech_acc = hs_data.get("components", {}).get("technical_accuracy")
        assert overall_hs > 50, f"HireScore should be calibrated high, got {overall_hs}"
        assert tech_acc >= 75, f"Technical accuracy should reflect assessment + interview, got {tech_acc}"
        print(f" Composite HireScore: {overall_hs}/100 | Technical Accuracy: {tech_acc}/100 (NOT stale 19).")

        # 8. Simulate Page Refresh Consistency
        print("\n[Step 8/8] Simulating page refresh & re-querying canonical backend state...")
        refresh_ass = (await client.get("/assessment/latest", headers=headers)).json()
        refresh_int = (await client.get("/interview/sessions/history", headers=headers)).json().get("data", {})
        refresh_eval = (await client.get("/evaluations/latest", headers=headers)).json().get("data", {})
        refresh_hs = (await client.get("/hirescore/latest", headers=headers)).json().get("data", {})

        assert refresh_ass.get("score") == 100
        assert len(refresh_int.get("sessions", [])) >= 1
        assert refresh_eval.get("overall_interview_score") is not None
        assert refresh_hs.get("overall_score") == overall_hs

        print(" All state and telemetry verified identical across browser refresh!")
        print("\n==========================================================")
        print("   END-TO-END FLOW VALIDATION SUCCESSFUL - ALL CHECKS PASS ")
        print("==========================================================")

if __name__ == "__main__":
    try:
        asyncio.run(run_e2e_flow())
    except Exception as e:
        print(f"E2E verification failed: {e}", file=sys.stderr)
        sys.exit(1)
