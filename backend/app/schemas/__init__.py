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
    PasswordResetRequest,
    RegisterRequest,
    RegisterResponseData,
    SessionResponseData,
    TokenRefreshRequest,
    TokenRefreshResponseData,
    VerifyOtpRequest,
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
    TurnRequest,
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
from app.schemas.facesense import (
    FaceSenseMetricsBatchRequest,
    FinishFaceSenseRequest,
    StartFaceSenseRequest,
)
from app.schemas.integrity import (
    FinishIntegritySessionRequest,
    IntegrityTelemetryRequest,
    LogIntegrityEventRequest,
    StartIntegritySessionRequest,
)
from app.schemas.assessment import (
    StartAssessmentRequest,
    SubmitAssessmentRequest,
)
from app.schemas.payment import (
    CheckoutRequest,
    PaymentCreateRequest,
)
from app.schemas.career import (
    ShareSettingsResponse,
    UpdateShareSettingsRequest,
    PublicPortfolioResponse,
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
    "PasswordResetRequest",
    "VerifyOtpRequest",
    "TokenRefreshRequest",
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
    "TurnRequest",
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
    "StartFaceSenseRequest",
    "FinishFaceSenseRequest",
    "FaceSenseMetricsBatchRequest",
    "StartIntegritySessionRequest",
    "FinishIntegritySessionRequest",
    "LogIntegrityEventRequest",
    "IntegrityTelemetryRequest",
    "StartAssessmentRequest",
    "SubmitAssessmentRequest",
    "CheckoutRequest",
    "PaymentCreateRequest",
    "ShareSettingsResponse",
    "UpdateShareSettingsRequest",
    "PublicPortfolioResponse",
]
