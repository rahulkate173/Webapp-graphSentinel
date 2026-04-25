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
    """Top-level suspicious account (flattened from rings)."""
    account_id: str
    role: str                               # "Originator" | "Exit Point" | "Intermediary / Mule"
    suspicion_score: float
    detected_patterns: list[str]


class RingFlowAnalysis(BaseModel):
    """Origin → Exit money flow metadata for a ring."""
    origin_node: str
    exit_node: str
    total_hop_count: int


class RingAccount(BaseModel):
    """Per-account detail inside a fraud ring."""
    account_id: str
    role: str
    suspicion_score: float
    detected_patterns: list[str]


class RingContext(BaseModel):
    """Context metadata for a fraud ring."""
    time_window: str
    analysis_type: str = "fraud_ring_explanation"
    pattern_identified: str = ""


class FraudRing(BaseModel):
    ring_id: str
    flow_analysis: RingFlowAnalysis
    accounts: list[RingAccount]
    transactions: list[TransactionDetail] = []
    context: RingContext


class Summary(BaseModel):
    total_accounts_analyzed: int
    fraud_rings_detected: int
    processing_time_seconds: float
    dataset: Optional[str] = None


class PredictResponse(BaseModel):
    suspicious_accounts: list[SuspiciousAccount]
    fraud_rings: list[FraudRing]
    summary: Summary


# ═══════════════════════════════════════════════════════════════════════════
# Request / Response — /predict_explainable
# ═══════════════════════════════════════════════════════════════════════════

# ── Request ──
# Mirrors the fraud-ring object produced by generate_report() in the
# training notebook (trail-3-money-muling.ipynb).

class FlowAnalysis(BaseModel):
    """Origin → Exit money flow metadata."""
    origin_node: str
    exit_node: str
    total_hop_count: int


class ExplainableAccountInput(BaseModel):
    account_id: str
    role: str                       # "Originator" | "Exit Point" | "Intermediary / Mule"
    suspicion_score: float
    detected_patterns: list[str]    # IBM patterns + velocity/risk flags


class ExplainableTransactionInput(BaseModel):
    transaction_id: str
    sender_id: str
    receiver_id: str
    amount: float
    timestamp: str


class ExplainableContext(BaseModel):
    time_window: str
    analysis_type: str = "fraud_ring_explanation"
    pattern_identified: str = ""    # IBM pattern, e.g. "Simple Cycle", "Fan-out", "Random"


class PredictExplainableRequest(BaseModel):
    ring_id: str
    flow_analysis: FlowAnalysis
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
