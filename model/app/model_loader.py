"""
model_loader.py — dual-mode model loader for GraphSentinel.

Supports two formats, auto-detected by inspecting the .pt file:

  • graphsentinel-xgboost-v1  (new) — XGBoost bundle produced by the
    HI-Medium training notebook.  Loaded via XGBAMLModel.

  • legacy EdgeGAT state_dict  (old) — torch.nn.Module weights.
    Kept for backwards-compatibility but not actively trained further.

The public API is unchanged:
    model, model_name = load_model()
`model` is either an XGBAMLModel or an EdgeGAT instance.
Both expose  .predict_proba / .score / .pattern_name  (XGBoost path)
or the old forward() interface (EdgeGAT path).
"""

import os
import glob

import numpy as np
import torch
import xgboost as xgb

from app.config import DEVICE, MODEL_DIR, MODEL_FILENAME

# ───────────────────────────────────────────────────────────────────────────
# XGBoost bundle constants  (must match training notebook)
# ───────────────────────────────────────────────────────────────────────────

BUNDLE_FORMAT = "graphsentinel-xgboost-v1"

# Pretty display names for the IBM pattern classes
DISPLAY_NAMES = {
    "FAN-OUT":          "Fan-out",
    "FAN-IN":           "Fan-in",
    "GATHER-SCATTER":   "Gather-scatter",
    "SCATTER-GATHER":   "Scatter-gather",
    "CYCLE":            "Simple Cycle",
    "RANDOM":           "Random",
    "BIPARTITE":        "Bipartite",
    "STACK":            "Stack",
    "OTHER-LAUNDERING": "Random",
}


# ═══════════════════════════════════════════════════════════════════════════
# XGBoost model wrapper
# ═══════════════════════════════════════════════════════════════════════════

class XGBAMLModel:
    """
    Wrapper around a serialised XGBoost Booster for AML transaction scoring.

    The booster is stored inside a .pt bundle dict as a raw uint8 tensor
    (Booster.save_raw("ubj")), so it lives alongside the old EdgeGAT
    checkpoints and is loaded with the same torch.load() call.

    bundle keys
    -----------
    format          : "graphsentinel-xgboost-v1"
    booster_ubj     : uint8 tensor — raw XGBoost model bytes
    feature_columns : list[str]   — column order the booster expects
    classes         : list[str]   — ["NORMAL", "FAN-OUT", ...]
    threshold       : float       — laundering-score threshold
    variant         : str         — e.g. "HI-Medium"
    metrics         : dict        — optional training metrics
    """

    def __init__(self, bundle: dict, device: str = "cpu"):
        if bundle.get("format") != BUNDLE_FORMAT:
            raise ValueError("Not a GraphSentinel XGBoost bundle")

        raw = bundle["booster_ubj"].cpu().numpy().astype(np.uint8).tobytes()
        self.booster = xgb.Booster()
        self.booster.load_model(bytearray(raw))
        self.booster.set_param({"device": device})

        self.feature_columns = list(bundle["feature_columns"])
        self.classes         = list(bundle["classes"])
        self.threshold       = float(bundle.get("threshold", 0.5))
        self.variant         = bundle.get("variant", "")
        self.metrics         = bundle.get("metrics", {})
        self.size_bytes      = len(raw)

    # ── inference ──────────────────────────────────────────────────────────

    def predict_proba(self, X, batch: int = 1_000_000) -> np.ndarray:
        """
        (n_rows, n_classes) class probabilities; column 0 is NORMAL.

        Parameters
        ----------
        X : pd.DataFrame with at least self.feature_columns columns.
        """
        import pandas as pd
        arr = X[self.feature_columns].to_numpy(dtype=np.float32)
        out = np.empty((len(arr), len(self.classes)), dtype=np.float32)
        for i in range(0, len(arr), batch):
            dm  = xgb.DMatrix(arr[i:i + batch], feature_names=self.feature_columns)
            out[i:i + batch] = self.booster.predict(dm)
        return out

    def score(self, proba: np.ndarray) -> np.ndarray:
        """P(laundering) = 1 − P(NORMAL)."""
        return 1.0 - proba[:, 0]

    def pattern_index(self, proba: np.ndarray) -> np.ndarray:
        """Most likely laundering pattern index (≥ 1) per row."""
        return proba[:, 1:].argmax(axis=1) + 1

    def pattern_name(self, idx: int, pretty: bool = True) -> str:
        name = self.classes[int(idx)]
        return DISPLAY_NAMES.get(name, name) if pretty else name

    def __repr__(self):
        return (
            f"XGBAMLModel(variant={self.variant!r}, "
            f"classes={self.classes}, threshold={self.threshold:.4f})"
        )


# ═══════════════════════════════════════════════════════════════════════════
# Legacy EdgeGAT  (kept for backwards-compatibility)
# ═══════════════════════════════════════════════════════════════════════════

def _load_edge_gat(model_path: str):
    """
    Load the old EdgeGAT Graph Neural Network from a state-dict checkpoint.
    Imports torch-geometric lazily so the server can start without it when
    running the XGBoost model.
    """
    import torch.nn as nn
    import torch.nn.functional as F
    from torch_geometric.nn import GATConv
    from app.config import HIDDEN_DIM, NUM_LAYERS, NUM_HEADS, DROPOUT, NODE_FEAT_DIM, EDGE_FEAT_DIM, NUM_CLASSES

    class EdgeGAT(nn.Module):
        """
        Graph Attention Network for edge (transaction) classification.

        Architecture
        ------------
        1. Two GAT layers produce node embeddings using node features.
        2. Each edge embedding is formed by concatenating:
             [src_node_emb || dst_node_emb || edge_attr]
        3. An MLP classifies each edge as laundering / normal.
        """

        def __init__(self, node_feat_dim, edge_feat_dim, hidden_dim, num_classes,
                     num_layers=2, num_heads=4, dropout=0.3):
            super().__init__()

            self.gat_layers = nn.ModuleList()
            self.norms       = nn.ModuleList()

            in_dim = node_feat_dim
            for i in range(num_layers):
                out_dim  = hidden_dim // num_heads
                is_last  = (i == num_layers - 1)
                heads    = 1 if is_last else num_heads
                concat   = not is_last
                self.gat_layers.append(
                    GATConv(in_dim, out_dim, heads=heads, concat=concat,
                            dropout=dropout, add_self_loops=True)
                )
                self.norms.append(nn.BatchNorm1d(out_dim * heads if concat else out_dim))
                in_dim = out_dim * heads if concat else out_dim

            node_emb_dim = in_dim
            mlp_in = node_emb_dim * 2 + edge_feat_dim
            self.edge_mlp = nn.Sequential(
                nn.Linear(mlp_in, hidden_dim),
                nn.BatchNorm1d(hidden_dim),
                nn.ReLU(),
                nn.Dropout(dropout),
                nn.Linear(hidden_dim, hidden_dim // 2),
                nn.ReLU(),
                nn.Linear(hidden_dim // 2, num_classes),
            )
            self.dropout = dropout

        def get_node_embeddings(self, x, edge_index):
            for gat, norm in zip(self.gat_layers, self.norms):
                x = gat(x, edge_index)
                x = norm(x)
                x = F.elu(x)
                x = F.dropout(x, p=self.dropout, training=self.training)
            return x

        def forward(self, x, edge_index, edge_attr):
            node_emb = self.get_node_embeddings(x, edge_index)
            src_idx  = edge_index[0]
            dst_idx  = edge_index[1]
            edge_emb = torch.cat([node_emb[src_idx], node_emb[dst_idx], edge_attr], dim=-1)
            logits   = self.edge_mlp(edge_emb)
            return logits, node_emb

    model = EdgeGAT(
        node_feat_dim=NODE_FEAT_DIM,
        edge_feat_dim=EDGE_FEAT_DIM,
        hidden_dim=HIDDEN_DIM,
        num_classes=NUM_CLASSES,
        num_layers=NUM_LAYERS,
        num_heads=NUM_HEADS,
        dropout=DROPOUT,
    ).to(DEVICE)

    state_dict = torch.load(model_path, map_location=DEVICE, weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()
    return model


# ═══════════════════════════════════════════════════════════════════════════
# Public loader
# ═══════════════════════════════════════════════════════════════════════════

def _find_model_path() -> str:
    """Find the model checkpoint file in MODEL_DIR."""
    model_dir = os.path.abspath(MODEL_DIR)

    if MODEL_FILENAME:
        path = os.path.join(model_dir, MODEL_FILENAME)
        if os.path.isfile(path):
            return path
        raise FileNotFoundError(f"Specified model not found: {path}")

    # Auto-detect: pick latest .pt / .pth file by modification time
    pth_files  = glob.glob(os.path.join(model_dir, "*.pt"))
    pth_files += glob.glob(os.path.join(model_dir, "*.pth"))
    if not pth_files:
        raise FileNotFoundError(f"No .pt/.pth files found in {model_dir}")

    return max(pth_files, key=os.path.getmtime)


def _is_xgb_bundle(path: str) -> bool:
    """True if the file is an XGBoost bundle (not an EdgeGAT state-dict)."""
    try:
        obj = torch.load(path, map_location="cpu", weights_only=True)
    except Exception:
        return False
    return isinstance(obj, dict) and obj.get("format") == BUNDLE_FORMAT


def load_model():
    """
    Load the best available model from MODEL_DIR.

    Detection order
    ---------------
    1. If the .pt file contains format == "graphsentinel-xgboost-v1"  →  XGBAMLModel
    2. Otherwise                                                       →  legacy EdgeGAT

    Returns
    -------
    model      : XGBAMLModel | EdgeGAT
    model_name : str  — basename of the checkpoint file
    """
    model_path = _find_model_path()
    model_name = os.path.basename(model_path)

    if _is_xgb_bundle(model_path):
        bundle = torch.load(model_path, map_location="cpu", weights_only=True)
        model  = XGBAMLModel(bundle, device=str(DEVICE))
        n_feat = len(model.feature_columns)
        print(
            f"[GraphSentinel] XGBoost model loaded: {model_name}"
            f"  variant={model.variant}  features={n_feat}"
            f"  threshold={model.threshold:.4f}"
        )
    else:
        model = _load_edge_gat(model_path)
        n_params = sum(p.numel() for p in model.parameters())
        print(f"[GraphSentinel] EdgeGAT model loaded: {model_name}  ({n_params:,} params)")

    return model, model_name
