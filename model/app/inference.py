"""
inference.py — dual-mode inference engine for GraphSentinel.

Routes to the correct backend based on the loaded model type:

  • XGBAMLModel  → xgb_run_inference()
    Uses build_features() (from xgb_features.py logic, inlined here)
    to engineer tabular features, runs the XGBoost booster, then
    scores every transaction and builds the fraud-ring report.

  • EdgeGAT       → gat_run_inference()   (legacy path, kept intact)
    Uses the PyG Data object produced by graph_builder.py.

Both paths return the SAME dict structure consumed by main.py / schemas.py:
  {
    "suspicious_accounts": [...],
    "fraud_rings":         [...],
    "summary":             {...}
  }
"""

import time
from collections import defaultdict, deque
from datetime import datetime

import numpy as np
import pandas as pd

from app.config import SUSPICION_THRESHOLD, MAX_TRANSACTIONS_PER_ACCOUNT


# ═══════════════════════════════════════════════════════════════════════════
# Shared helpers (pattern identification, account scoring, ring detection)
# These are model-agnostic and used by both paths.
# ═══════════════════════════════════════════════════════════════════════════

def _identify_ibm_pattern(acc_id: str, transactions: list[dict]) -> str:
    """
    Analyzes transaction topology to map to IBM's 8 laundering patterns.
    Directly ported from the training notebook.
    """
    senders   = set(tx["sender_id"]   for tx in transactions if tx["sender_id"]   != acc_id)
    receivers = set(tx["receiver_id"] for tx in transactions if tx["receiver_id"] != acc_id)

    in_degree  = len(senders)
    out_degree = len(receivers)

    # 1. Simple Cycle: A → B → A
    if any(tx["sender_id"] == tx["receiver_id"] for tx in transactions):
        return "Simple Cycle"

    # 2. Fan-out: One source to many destinations
    if in_degree == 1 and out_degree > 3:
        return "Fan-out"

    # 3. Fan-in: Many sources to one destination
    if in_degree > 3 and out_degree == 1:
        return "Fan-in"

    # 4. Gather-Scatter: Many in, then many out
    if in_degree > 2 and out_degree > 2:
        return "Gather-scatter"

    # 5. Scatter-Gather: Out to many, then back to one
    if in_degree > 3 and out_degree > 3:
        return "Scatter-gather"

    # 6. Bipartite: Two distinct groups (Money Mules)
    if in_degree >= 5 and out_degree >= 5:
        return "Bipartite"

    # 7. Stack: Layering through multiple accounts
    if len(transactions) > 10 and in_degree > 1:
        return "Stack"

    # 8. Random: High volume but no clear structure
    return "Random"


def _build_account_scores_from_probs(
    all_probs:   np.ndarray,          # shape (n_edges,)  P(laundering) per tx
    sender_ids:  list[str],
    receiver_ids: list[str],
    amounts:     np.ndarray,
    timestamps:  list[str],
    threshold:   float,
) -> tuple[dict, dict, dict]:
    """
    Build per-account suspicion scores from per-transaction laundering probabilities.
    Model-agnostic: works for both XGBoost and EdgeGAT probabilities.
    """
    suspicious_mask    = all_probs >= threshold
    suspicious_indices = np.where(suspicious_mask)[0]

    account_scores      = defaultdict(float)
    account_trans_count = defaultdict(int)
    account_transactions = defaultdict(list)

    for edge_idx in suspicious_indices:
        src  = sender_ids[edge_idx]
        dst  = receiver_ids[edge_idx]
        prob = float(all_probs[edge_idx])

        account_scores[src] += prob
        account_scores[dst] += prob
        account_trans_count[src] += 1
        account_trans_count[dst] += 1

        record = {
            "transaction_id": f"T{edge_idx}",
            "sender_id":      src,
            "receiver_id":    dst,
            "amount":         float(amounts[edge_idx]),
            "timestamp":      str(timestamps[edge_idx]),
        }
        if len(account_transactions[src]) < MAX_TRANSACTIONS_PER_ACCOUNT:
            account_transactions[src].append(record)
        if len(account_transactions[dst]) < MAX_TRANSACTIONS_PER_ACCOUNT:
            account_transactions[dst].append(record)

    # Normalise scores to [0, 100]
    if account_scores:
        max_score = max(account_scores.values())
        account_scores = {
            k: min(100.0, (v / (max_score + 1e-8)) * 100)
            for k, v in account_scores.items()
        }

    return dict(account_scores), dict(account_trans_count), dict(account_transactions)


def _detect_fraud_rings(
    all_probs:            np.ndarray,
    sender_ids:           list[str],
    receiver_ids:         list[str],
    account_scores:       dict,
    account_transactions: dict,
    threshold:            float,
) -> dict:
    """
    Detect fraud rings via BFS connected-component analysis over suspicious edges.
    Includes origin/exit node detection and IBM pattern identification.
    """
    suspicious_indices = np.where(all_probs >= threshold)[0]

    adj_directed   = defaultdict(list)
    adj_undirected = defaultdict(set)

    for eidx in suspicious_indices:
        s = sender_ids[eidx]
        d = receiver_ids[eidx]
        adj_directed[s].append(d)
        adj_undirected[s].add(d)
        adj_undirected[d].add(s)

    visited = set()
    rings   = {}
    ring_id = 0

    for start in adj_undirected:
        if start in visited:
            continue
        members = []
        queue   = deque([start])
        visited.add(start)
        while queue:
            node = queue.popleft()
            members.append(node)
            for nb in adj_undirected[node]:
                if nb not in visited:
                    visited.add(nb)
                    queue.append(nb)

        if len(members) >= 2:
            # ── Origin / Exit node logic ──────────────────────────────────
            in_counts  = {m: 0 for m in members}
            out_counts = {m: 0 for m in members}

            for m in members:
                for neighbor in adj_directed[m]:
                    if neighbor in in_counts:
                        out_counts[m]        += 1
                        in_counts[neighbor]  += 1

            origin_node = max(out_counts, key=out_counts.get)
            exit_node   = max(in_counts,  key=in_counts.get)

            # Break ties: origin and exit should be distinct
            if origin_node == exit_node and len(members) > 1:
                for node, _ in sorted(in_counts.items(), key=lambda x: x[1], reverse=True):
                    if node != origin_node:
                        exit_node = node
                        break

            # ── IBM pattern identification ────────────────────────────────
            ring_txs = []
            for m in members:
                ring_txs.extend(account_transactions.get(m, []))

            pattern = _identify_ibm_pattern(members[0], ring_txs)
            risk    = float(np.mean([account_scores.get(m, 0) for m in members]))

            rings[f"RING_{ring_id:03d}"] = {
                "member_accounts": members,
                "pattern_type":    pattern,
                "risk_score":      risk,
                "origin":          origin_node,
                "destination":     exit_node,
            }
            ring_id += 1

    return rings


def _build_report(
    fraud_rings:          dict,
    account_scores:       dict,
    account_transactions: dict,
    threshold:            float,
    total_accounts:       int,
    processing_time:      float,
) -> dict:
    """
    Assemble the final report dict from ring/account data.
    Shape matches the schemas.PredictResponse model exactly.
    """
    formatted_rings = []
    for rid, info in fraud_rings.items():
        ring_accounts = []
        for acc_id in info["member_accounts"]:
            if acc_id == info["origin"]:
                role = "Originator"
            elif acc_id == info["destination"]:
                role = "Exit Point"
            else:
                role = "Intermediary / Mule"

            acc_txs      = account_transactions.get(acc_id, [])
            pattern_list = [info["pattern_type"]]
            if len(acc_txs) > 10:
                pattern_list.append("high_velocity")

            score = account_scores.get(acc_id, 0.0)
            if score > 80:
                pattern_list.append("high_risk_score")

            ring_accounts.append({
                "account_id":        acc_id,
                "role":              role,
                "suspicion_score":   round(score, 2),
                "detected_patterns": pattern_list,
            })

        # Deduplicated transactions for this ring
        ring_tx_sample = []
        seen_txs = set()
        for m in info["member_accounts"]:
            for tx in account_transactions.get(m, []):
                if tx["transaction_id"] not in seen_txs:
                    seen_txs.add(tx["transaction_id"])
                    ring_tx_sample.append(tx)

        formatted_rings.append({
            "ring_id": rid,
            "flow_analysis": {
                "origin_node":    info["origin"],
                "exit_node":      info["destination"],
                "total_hop_count": len(info["member_accounts"]) - 1,
            },
            "accounts":     ring_accounts,
            "transactions": ring_tx_sample,
            "context": {
                "time_window":       datetime.now().strftime("%Y-%m-%d"),
                "analysis_type":     "fraud_ring_explanation",
                "pattern_identified": info["pattern_type"],
            },
        })

    suspicious_accounts = []
    for ring in formatted_rings:
        for acc in ring["accounts"]:
            if acc["suspicion_score"] > threshold * 100:
                suspicious_accounts.append(acc)
    suspicious_accounts.sort(key=lambda x: x["suspicion_score"], reverse=True)

    return {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings":         formatted_rings,
        "summary": {
            "total_accounts_analyzed": total_accounts,
            "fraud_rings_detected":    len(fraud_rings),
            "processing_time_seconds": round(processing_time, 3),
        },
    }


# ═══════════════════════════════════════════════════════════════════════════
# XGBoost inference path  (new — used with model_xgb_HI-Medium.pt)
# ═══════════════════════════════════════════════════════════════════════════

def _build_features_for_xgb(df: pd.DataFrame, accounts_df: pd.DataFrame = None) -> pd.DataFrame:
    """
    Thin wrapper: delegates to the feature-engineering logic from
    xgb_features.py (inlined to keep the model/ package self-contained).

    Returns a float32 DataFrame with exactly FEATURE_COLUMNS columns.
    """
    # Late import so this file can still be imported even when xgb_features
    # is not on the path (edge-case during unit tests of the legacy path).
    from app.xgb_features import build_features
    return build_features(df, accounts_df=accounts_df)


def xgb_run_inference(model, df: pd.DataFrame, accounts_df: pd.DataFrame = None, threshold: float = None) -> dict:
    """
    Full XGBoost inference pipeline:
      1. Build tabular features from raw transactions (+ optional accounts CSV)
      2. Run XGBoost predict_proba → per-transaction P(laundering)
      3. Build account-level suspicion scores
      4. Detect fraud rings with IBM pattern + flow analysis
      5. Return structured report

    Parameters
    ----------
    model        : XGBAMLModel — loaded XGBoost model
    df           : pd.DataFrame — raw transactions (IBM AML columns)
    accounts_df  : pd.DataFrame | None — accounts CSV (optional)
    threshold    : float | None — overrides model.threshold if provided

    Returns
    -------
    dict matching schemas.PredictResponse
    """
    if threshold is None:
        threshold = model.threshold   # use the threshold baked into the bundle

    t0 = time.time()

    # ── 1. Feature engineering ────────────────────────────────────────────
    feat_df = _build_features_for_xgb(df, accounts_df=accounts_df)

    # ── 2. Predict ────────────────────────────────────────────────────────
    proba     = model.predict_proba(feat_df)          # (n, n_classes)
    laundering_prob = model.score(proba).astype(np.float32)  # P(laundering)

    # ── 3. Build account IDs (same convention as graph_builder.preprocess) ─
    sender_ids   = (
        df["From Bank"].astype(str) + "_" + df["Account"].astype(str)
    ).tolist()
    receiver_ids = (
        df["To Bank"].astype(str)   + "_" + df["Account.1"].astype(str)
    ).tolist()
    amounts    = df["Amount Paid"].fillna(0).to_numpy(dtype=np.float64)
    timestamps = df["Timestamp"].astype(str).tolist()

    # ── 4. Account scores ─────────────────────────────────────────────────
    account_scores, account_trans_count, account_transactions = (
        _build_account_scores_from_probs(
            laundering_prob, sender_ids, receiver_ids,
            amounts, timestamps, threshold,
        )
    )

    # ── 5. Fraud rings ────────────────────────────────────────────────────
    fraud_rings = _detect_fraud_rings(
        laundering_prob, sender_ids, receiver_ids,
        account_scores, account_transactions, threshold,
    )

    total_accounts = len(set(sender_ids) | set(receiver_ids))
    processing_time = time.time() - t0

    return _build_report(
        fraud_rings, account_scores, account_transactions,
        threshold, total_accounts, processing_time,
    )


# ═══════════════════════════════════════════════════════════════════════════
# Legacy EdgeGAT inference path  (kept intact for backwards-compatibility)
# ═══════════════════════════════════════════════════════════════════════════

def _get_edge_probs_gat(model, data) -> np.ndarray:
    """Run EdgeGAT forward pass and return per-edge laundering probabilities."""
    import torch
    import torch.nn.functional as F

    model.eval()
    with torch.no_grad():
        logits, _ = model(data.x, data.edge_index, data.edge_attr)
        probs = F.softmax(logits, dim=-1)[:, 1].cpu().numpy()
    return probs


def gat_run_inference(model, data, df, threshold: float = None) -> dict:
    """
    Full EdgeGAT inference pipeline (legacy).

    Parameters
    ----------
    model : EdgeGAT
    data  : torch_geometric.data.Data — PyG graph on the configured device
    df    : pd.DataFrame — cleaned transaction DataFrame (for metadata)
    threshold : float | None
    """
    if threshold is None:
        threshold = SUSPICION_THRESHOLD

    t0 = time.time()

    all_probs = _get_edge_probs_gat(model, data)

    idx2node     = data.idx2node if hasattr(data, "idx2node") else {}
    src_all      = data.edge_index[0].cpu().numpy()
    dst_all      = data.edge_index[1].cpu().numpy()
    sender_ids   = [idx2node.get(int(src_all[i]), f"ACC_{src_all[i]}") for i in range(len(src_all))]
    receiver_ids = [idx2node.get(int(dst_all[i]), f"ACC_{dst_all[i]}") for i in range(len(dst_all))]
    amounts      = df["Amount Paid"].fillna(0).to_numpy(dtype=np.float64)
    timestamps   = df["Timestamp"].astype(str).tolist()

    account_scores, account_trans_count, account_transactions = (
        _build_account_scores_from_probs(
            all_probs, sender_ids, receiver_ids,
            amounts, timestamps, threshold,
        )
    )

    fraud_rings = _detect_fraud_rings(
        all_probs, sender_ids, receiver_ids,
        account_scores, account_transactions, threshold,
    )

    total_accounts  = data.num_nodes
    processing_time = time.time() - t0

    return _build_report(
        fraud_rings, account_scores, account_transactions,
        threshold, total_accounts, processing_time,
    )


# ═══════════════════════════════════════════════════════════════════════════
# Unified entry point called by main.py
# ═══════════════════════════════════════════════════════════════════════════

def run_inference(model, data_or_df, df=None, threshold: float = None, accounts_df: pd.DataFrame = None) -> dict:
    """
    Unified inference dispatcher.

    Signature variants
    ------------------
    XGBoost path  (new):
        run_inference(model, trans_df, accounts_df=accounts_df)
        — data_or_df is the raw transactions DataFrame
        — df is None (or used as accounts_df via kwarg)

    EdgeGAT path  (legacy):
        run_inference(model, data, df)
        — data_or_df is a torch_geometric.data.Data object
        — df is the cleaned transactions DataFrame
    """
    from app.model_loader import XGBAMLModel

    if isinstance(model, XGBAMLModel):
        # XGBoost path: data_or_df is the transactions DataFrame
        trans_df = data_or_df
        return xgb_run_inference(model, trans_df, accounts_df=accounts_df, threshold=threshold)
    else:
        # Legacy EdgeGAT path: data_or_df is the PyG Data object
        return gat_run_inference(model, data_or_df, df, threshold=threshold)
