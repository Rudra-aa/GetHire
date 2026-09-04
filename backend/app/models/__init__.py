"""
app/models/__init__.py
----------------------
Domain models package for GetHire.
"""

from app.models.user import PyObjectId, UserModel
from app.models.token import AuthRefreshTokenModel, UserSessionModel, AuditLogModel
from app.models.resume import (
    ResumeModel,
    ParsedResumeData,
    PersonalInfo,
    ExperienceItem,
    ProjectItem,
    EducationItem,
    CertificationItem,
    QualityScoreBreakdown,
)
from app.models.interview import (
    InterviewQuestion,
    InterviewAnswerModel,
    InterviewSessionModel,
)
from app.models.evaluation import (
    DimensionScore,
    EvaluationScores,
    FollowUpRecommendation,
    EvaluationModel,
)
from app.models.hirescore import (
    HireScoreComponents,
    ReadinessDetails,
    BenchmarkDetails,
    SkillGapItem,
    RecommendationDetails,
    RoadmapMilestone,
    HireScoreModel,
)

__all__ = [
    "PyObjectId",
    "UserModel",
    "AuthRefreshTokenModel",
    "UserSessionModel",
    "AuditLogModel",
    "ResumeModel",
    "ParsedResumeData",
    "PersonalInfo",
    "ExperienceItem",
    "ProjectItem",
    "EducationItem",
    "CertificationItem",
    "QualityScoreBreakdown",
    "InterviewQuestion",
    "InterviewAnswerModel",
    "InterviewSessionModel",
    "DimensionScore",
    "EvaluationScores",
    "FollowUpRecommendation",
    "EvaluationModel",
    "HireScoreComponents",
    "ReadinessDetails",
    "BenchmarkDetails",
    "SkillGapItem",
    "RecommendationDetails",
    "RoadmapMilestone",
    "HireScoreModel",
]
