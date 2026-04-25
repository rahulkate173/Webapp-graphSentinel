"""
Pydantic schemas for request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, HttpUrl, Field


# ═══════════════════════════════════════════════════════════════════════════
# Request
# ═══════════════════════════════════════════════════════════════════════════

class PredictRequest(BaseModel):
    transactions_csv_url: HttpUrl
    accounts_csv_url: HttpUrl


# ═══════════════════════════════════════════════════════════════════════════
# Response — /predict
# ═══════════════════════════════════════════════════════════════════════════

class TransactionDetail(BaseModel):
    transaction_id: str
    sender_id: str
    receiver_id: str
    amount: float
    timestamp: str


class SuspiciousAccount(BaseModel):
    account_id: str
    suspicion_score: float
    detected_patterns: list[str]
    ring_id: Optional[str] = None
    transactions: list[TransactionDetail]


class FraudRing(BaseModel):
    ring_id: str
    member_accounts: list[str]
    pattern_type: str
    risk_score: float
    transactions: list[TransactionDetail] = []


class Summary(BaseModel):
    total_accounts_analyzed: int
    suspicious_accounts_flagged: int
    fraud_rings_detected: int
    processing_time_seconds: float


class PredictResponse(BaseModel):
    suspicious_accounts: list[SuspiciousAccount]
    fraud_rings: list[FraudRing]
    summary: Summary


# ═══════════════════════════════════════════════════════════════════════════
# Request / Response — /predict_explainable
# ═══════════════════════════════════════════════════════════════════════════

# ── Request ──

class ExplainableAccountInput(BaseModel):
    account_id: str
    suspicion_score: float
    detected_patterns: list[str]


class ExplainableTransactionInput(BaseModel):
    transaction_id: str
    sender_id: str
    receiver_id: str
    amount: float
    timestamp: str


class ExplainableContext(BaseModel):
    time_window: str
    analysis_type: str = "fraud_ring_explanation"


class PredictExplainableRequest(BaseModel):
    ring_id: str
    accounts: list[ExplainableAccountInput]
    transactions: list[ExplainableTransactionInput]
    context: ExplainableContext


# ── Response ──

class KeyFactor(BaseModel):
    factor: str
    impact: str
    importance: float = Field(..., ge=0.0, le=1.0)


class KeyAccount(BaseModel):
    account_id: str
    role: str
    reason: str


class PredictExplainableResponse(BaseModel):
    ring_id: str
    risk_level: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    summary: str
    key_factors: list[KeyFactor]
    key_accounts: list[KeyAccount]
    suspicious_patterns: list[str]
    recommendations: list[str]


# ═══════════════════════════════════════════════════════════════════════════
# Response — /health
# ═══════════════════════════════════════════════════════════════════════════

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: Optional[str] = None
    timestamp: str
