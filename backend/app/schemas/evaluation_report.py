"""
app/schemas/evaluation_report.py
--------------------------------
Pydantic schemas for Immutable Evaluation History APIs.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.hirescore import ReadinessDetailsOut

class EvaluationReportBase(BaseModel):
    candidate_id: str
    evaluation_number: int
    
    assessment_session_id: str
    interview_session_id: str
    
    assessment_score: int
    interview_score: int
    
    technical_accuracy: int
    concept_coverage: int
    problem_solving: int
    communication: int
    completeness: int
    
    facesense_score: Optional[int] = None
    voicesense_score: Optional[int] = None
    
    hirescore: int
    readiness: ReadinessDetailsOut
    
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    
    created_at: datetime
    updated_at: datetime

class EvaluationReportOut(EvaluationReportBase):
    id: str
