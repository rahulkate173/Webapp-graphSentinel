"""
GraphSentinel — FastAPI inference server for AML detection using EdgeGAT.
"""

# IMPORTANT: Import torch first on Windows to avoid DLL WinError 1114
import torch

import io
import os
import traceback
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import httpx
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import MAX_CSV_SIZE_MB
from app.graph_builder import preprocess, build_graph, move_to_device
from app.inference import run_inference
from app.model_loader import load_model
from app.schemas import (
    HealthResponse,
    PredictRequest,
    PredictResponse,
    PredictExplainableRequest,
    PredictExplainableResponse,
)
from app.explainer import generate_explanation


# ── Global state ─────────────────────────────────────────────────────────
_model = None
_model_name = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    global _model, _model_name
    try:
        _model, _model_name = load_model()
        print(f"[GraphSentinel] Server ready — model: {_model_name}")
    except FileNotFoundError as e:
        print(f"[GraphSentinel] WARNING: No model found — {e}")
        print("[GraphSentinel] Server starting without model. /predict will fail.")
    yield


app = FastAPI(
    title="GraphSentinel",
    description="AML Detection API using EdgeGAT Graph Neural Network",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ═══════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    """Root endpoint — server info."""
    return {
        "name": "GraphSentinel",
        "version": "1.0",
        "status": _model is not None,
        "model_name": _model_name,
    }

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=_model is not None,
        model_name=_model_name,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """
    Run AML detection on a transaction CSV.

    Accepts a Cloudinary (or any public) CSV URL, downloads it,
    builds a transaction graph, runs EdgeGAT inference, detects
    fraud rings, and returns a structured report.
    """
    if _model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Place a .pth file in the models/ directory and restart.",
        )

    transactions_csv_url = str(request.transactions_csv_url)
    accounts_csv_url = str(request.accounts_csv_url)

    # ── 1. Download CSVs ─────────────────────────────────────────────────
    async def download_csv(url: str, name: str) -> pd.DataFrame:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(url)
                response.raise_for_status()

                # Size check
                size_mb = len(response.content) / (1024 * 1024)
                if size_mb > MAX_CSV_SIZE_MB:
                    raise HTTPException(
                        status_code=413,
                        detail=f"{name} CSV too large: {size_mb:.1f}MB (max {MAX_CSV_SIZE_MB}MB)",
                    )

                return pd.read_csv(io.BytesIO(response.content))
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download {name} CSV: HTTP {e.response.status_code}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download or parse {name} CSV: {str(e)}",
            )

    import asyncio
    trans_df, accounts_df = await asyncio.gather(
        download_csv(transactions_csv_url, "Transactions"),
        download_csv(accounts_csv_url, "Accounts"),
    )

    # ── 2. Validate required columns ─────────────────────────────────────
    trans_cols = [
        "Timestamp", "From Bank", "Account", "To Bank", "Account.1",
        "Amount Paid", "Payment Currency", "Payment Format",
    ]
    missing_trans = [c for c in trans_cols if c not in trans_df.columns]
    if missing_trans:
        raise HTTPException(
            status_code=422,
            detail=f"Transactions CSV missing required columns: {missing_trans}",
        )

    accounts_cols = ["Bank ID", "Account Number", "Entity ID", "Entity Name"]
    missing_acc = [c for c in accounts_cols if c not in accounts_df.columns]
    if missing_acc:
        raise HTTPException(
            status_code=422,
            detail=f"Accounts CSV missing required columns: {missing_acc}",
        )

    # ── 3. Preprocess + build graph ──────────────────────────────────────
    try:
        df_clean, _, _ = preprocess(trans_df, accounts_df)
        graph_data = build_graph(df_clean)
        graph_data = move_to_device(graph_data)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Graph construction failed: {str(e)}",
        )

    # ── 4. Run inference ─────────────────────────────────────────────────
    try:
        report = run_inference(_model, graph_data, df_clean)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(e)}",
        )

    return report


@app.post("/predict_explainable", response_model=PredictExplainableResponse)
async def predict_explainable(request: PredictExplainableRequest):
    """
    Generate an AI-powered explainable analysis for a suspected fraud ring.

    Accepts structured ring data (accounts, transactions, context) and
    uses Groq LLM to produce a human-readable risk assessment with
    key factors, suspicious patterns, and recommendations.
    """
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if not groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="GROQ_API_KEY is not configured. Set it in the environment.",
        )

    try:
        explanation = await generate_explanation(request, groq_api_key)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Explainable analysis failed: {str(e)}",
        )

    return explanation
