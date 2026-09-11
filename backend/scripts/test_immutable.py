"""
scripts/test_immutable.py
-------------------------
Verifies Immutable Evaluation Engine behavior.
"""

import asyncio
from datetime import datetime, timezone
from bson import ObjectId
from app.db.mongo import mongo_manager
from app.services.evaluation_report_service import generate_evaluation_report

async def run_test():
    await mongo_manager.connect()
    db = mongo_manager.get_database()
    
    # 1. Create a dummy test candidate
    test_user_id = ObjectId()
    await db["users"].insert_one({
        "_id": test_user_id,
        "email": "immutable_test@gethire.ai",
        "full_name": "Immutable Tester",
        "created_at": datetime.now(timezone.utc)
    })
    
    uid = str(test_user_id)
    print(f"Created Test Candidate: {uid}")
    
    # 2. Cycle 1
    # Create Assessment 1
    ass1 = ObjectId()
    await db["assessment_sessions"].insert_one({
        "_id": ass1, "user_id": uid, "status": "completed",
        "score": 85, "completed_at": datetime.now(timezone.utc)
    })
    
    # Create Interview 1
    int1 = ObjectId()
    await db["interview_sessions"].insert_one({
        "_id": int1, "user_id": uid, "status": "completed",
        "completed_at": datetime.now(timezone.utc)
    })
    # Mock evaluations for Interview 1
    await db["evaluations"].insert_one({
        "session_id": str(int1), "user_id": uid,
        "overall_score": 88, "strengths": ["Fast"], "weaknesses": []
    })
    
    report1 = await generate_evaluation_report(db, uid)
    print(f"Cycle 1 generated Report #{report1.evaluation_number} with ID: {report1.id}")
    
    # 3. Cycle 2
    # Create Assessment 2
    ass2 = ObjectId()
    await db["assessment_sessions"].insert_one({
        "_id": ass2, "user_id": uid, "status": "completed",
        "score": 95, "completed_at": datetime.now(timezone.utc)
    })
    
    # Create Interview 2
    int2 = ObjectId()
    await db["interview_sessions"].insert_one({
        "_id": int2, "user_id": uid, "status": "completed",
        "completed_at": datetime.now(timezone.utc)
    })
    # Mock evaluations for Interview 2
    await db["evaluations"].insert_one({
        "session_id": str(int2), "user_id": uid,
        "overall_score": 92, "strengths": ["Scalable"], "weaknesses": []
    })
    
    report2 = await generate_evaluation_report(db, uid)
    print(f"Cycle 2 generated Report #{report2.evaluation_number} with ID: {report2.id}")
    
    # 4. Verify Immutability
    cursor = db["evaluation_reports"].find({"candidate_id": uid}).sort("evaluation_number", 1)
    reports = await cursor.to_list(100)
    
    assert len(reports) == 2, f"Expected 2 reports, got {len(reports)}"
    assert reports[0]["_id"] == report1.id, "Report 1 ID changed!"
    assert reports[0]["assessment_score"] == 85, "Report 1 score mutated!"
    assert reports[1]["assessment_score"] == 95, "Report 2 score incorrect!"
    assert reports[0]["evaluation_number"] == 1
    assert reports[1]["evaluation_number"] == 2
    
    print("ALL TESTS PASSED! Immutability Verified.")
    
if __name__ == "__main__":
    asyncio.run(run_test())
