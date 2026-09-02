"""
app/schemas/__init__.py
-----------------------
Schemas package for GetHire.
"""

from app.schemas.base import APIErrorItem, APIErrorResponse, APIResponse
from app.schemas.user import UserMeResponseData, UserProfileUpdateRequest, UserSummary
from app.schemas.auth import (
    LoginRequest,
    LoginResponseData,
    RegisterRequest,
    RegisterResponseData,
    SessionResponseData,
    TokenRefreshResponseData,
)
from app.schemas.resume import (
    ParsedDataOut,
    ResumeDetailResponseData,
    ResumeStatusResponseData,
    ResumeSummaryOut,
    ResumeUploadResponseData,
)
from app.schemas.interview import (
    InterviewAnswerOut,
    InterviewHistoryItem,
    InterviewHistoryResponseData,
    InterviewSessionResponseData,
    StartInterviewSessionRequest,
    SubmitAnswerRequest,
    UpdateSessionStateRequest,
)
from app.schemas.evaluation import (
    BatchEvaluateSessionRequest,
    BatchEvaluationResponseData,
    DimensionScoreOut,
    EvaluateAnswerRequest,
    EvaluationOut,
    EvaluationScoresOut,
    FollowUpRecommendationOut,
)
from app.schemas.hirescore import (
    BenchmarkDetailsOut,
    HireScoreComponentsOut,
    HireScoreHistoryItemOut,
    HireScoreSummaryOut,
    ReadinessDetailsOut,
    RecommendationDetailsOut,
    RecomputeHireScoreRequest,
    RoadmapMilestoneOut,
    SkillGapItemOut,
)

__all__ = [
    "APIResponse",
    "APIErrorResponse",
    "APIErrorItem",
    "UserSummary",
    "UserProfileUpdateRequest",
    "UserMeResponseData",
    "RegisterRequest",
    "LoginRequest",
    "RegisterResponseData",
    "LoginResponseData",
    "SessionResponseData",
    "TokenRefreshResponseData",
    "ResumeSummaryOut",
    "ParsedDataOut",
    "ResumeDetailResponseData",
    "ResumeUploadResponseData",
    "ResumeStatusResponseData",
    "StartInterviewSessionRequest",
    "UpdateSessionStateRequest",
    "SubmitAnswerRequest",
    "InterviewAnswerOut",
    "InterviewSessionResponseData",
    "InterviewHistoryItem",
    "InterviewHistoryResponseData",
    "EvaluateAnswerRequest",
    "BatchEvaluateSessionRequest",
    "DimensionScoreOut",
    "EvaluationScoresOut",
    "FollowUpRecommendationOut",
    "EvaluationOut",
    "BatchEvaluationResponseData",
    "BenchmarkDetailsOut",
    "HireScoreComponentsOut",
    "HireScoreHistoryItemOut",
    "HireScoreSummaryOut",
    "ReadinessDetailsOut",
    "RecommendationDetailsOut",
    "RecomputeHireScoreRequest",
    "RoadmapMilestoneOut",
    "SkillGapItemOut",
]
