"""
Configuration for GraphSentinel inference server.
Mirrors the Config class from the training notebook.

NOTE: torch is imported lazily to avoid Windows DLL issues
when uvicorn loads this module in a subprocess.
"""

import os
from dotenv import load_dotenv
import torch
load_dotenv()

# ── Device (lazy — resolved at first use) ────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# def get_device():
#     """Lazy torch device resolution to avoid import-time DLL issues on Windows."""
#     global DEVICE
#     if DEVICE is None:
#         import torch
#         DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#     return DEVICE

# ── Model architecture (must match training notebook) ────────────────────
HIDDEN_DIM = 64
NUM_LAYERS = 2
NUM_HEADS = 4
DROPOUT = 0.3
NODE_FEAT_DIM = 4   # out-degree, in-degree, sum_sent, sum_received
EDGE_FEAT_DIM = 5   # amount_log, hour, day_of_week, payment_enc, currency_enc
NUM_CLASSES = 2      # normal / laundering

# ── Inference ────────────────────────────────────────────────────────────
SUSPICION_THRESHOLD = float(os.getenv("SUSPICION_THRESHOLD", "0.5"))
MAX_TRANSACTIONS_PER_ACCOUNT = 20  # cap transaction list in response

# ── Paths ────────────────────────────────────────────────────────────────
MODEL_DIR = os.getenv("MODEL_DIR", os.path.join(os.path.dirname(__file__), "..", "models"))
MODEL_FILENAME = os.getenv("MODEL_FILENAME", "")  # empty = auto-detect latest

# ── CSV download ─────────────────────────────────────────────────────────
MAX_CSV_SIZE_MB = int(os.getenv("MAX_CSV_SIZE_MB", "50"))

# ── Server ───────────────────────────────────────────────────────────────
PORT = int(os.getenv("PORT", "8000"))
