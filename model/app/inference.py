"""
Inference engine: run model, compute account scores, detect fraud rings, build report.
Mirrors the post-training analysis cells from the notebook.
"""

import time
from collections import defaultdict, deque
from datetime import datetime

import numpy as np
import torch
import torch.nn.functional as F
from torch_geometric.data import Data

from app.config import SUSPICION_THRESHOLD, MAX_TRANSACTIONS_PER_ACCOUNT, DEVICE
from app.model_loader import EdgeGAT


@torch.no_grad()
def _get_edge_probs(model: EdgeGAT, data: Data) -> np.ndarray:
    """Run forward pass and return per-edge laundering probabilities."""
    model.eval()
    logits, _ = model(data.x, data.edge_index, data.edge_attr)
    probs = F.softmax(logits, dim=-1)[:, 1].cpu().numpy()
    return probs


def _build_account_scores(
    all_probs: np.ndarray,
    data: Data,
    df,
    threshold: float,
) -> tuple[dict, dict, dict]:
    """
    Build per-account suspicion scores and transaction lists
    from edge-level probabilities.
    """
    suspicious_mask = all_probs >= threshold
    suspicious_indices = np.where(suspicious_mask)[0]

    idx2node = data.idx2node if hasattr(data, "idx2node") else {}
    src_all = data.edge_index[0].cpu().numpy()
    dst_all = data.edge_index[1].cpu().numpy()

    account_scores = defaultdict(float)
    account_trans_count = defaultdict(int)
    account_transactions = defaultdict(list)

    for edge_idx in suspicious_indices:
        src_node = idx2node.get(int(src_all[edge_idx]), f"ACC_{src_all[edge_idx]}")
        dst_node = idx2node.get(int(dst_all[edge_idx]), f"ACC_{dst_all[edge_idx]}")
        prob = float(all_probs[edge_idx])

        account_scores[src_node] += prob
        account_scores[dst_node] += prob
        account_trans_count[src_node] += 1
        account_trans_count[dst_node] += 1

        row = df.iloc[edge_idx]
        record = {
            "transaction_id": f"T{edge_idx}",
            "sender_id": src_node,
            "receiver_id": dst_node,
            "amount": float(row["Amount Paid"]),
            "timestamp": str(row["Timestamp"]),
        }
        if len(account_transactions[src_node]) < MAX_TRANSACTIONS_PER_ACCOUNT:
            account_transactions[src_node].append(record)
        if len(account_transactions[dst_node]) < MAX_TRANSACTIONS_PER_ACCOUNT:
            account_transactions[dst_node].append(record)

    # Normalise scores to [0, 100]
    if account_scores:
        max_score = max(account_scores.values())
        account_scores = {
            k: min(100.0, (v / (max_score + 1e-8)) * 100)
            for k, v in account_scores.items()
        }

    return dict(account_scores), dict(account_trans_count), dict(account_transactions)


def _detect_fraud_rings(
    all_probs: np.ndarray,
    data: Data,
    account_scores: dict,
    threshold: float,
) -> dict:
    """
    Detect fraud rings via BFS connected-component analysis
    over the subgraph of suspicious edges.
    """
    suspicious_indices = np.where(all_probs >= threshold)[0]
    idx2node = data.idx2node if hasattr(data, "idx2node") else {}
    src_all = data.edge_index[0].cpu().numpy()
    dst_all = data.edge_index[1].cpu().numpy()

    adj = defaultdict(set)
    for eidx in suspicious_indices:
        s = idx2node.get(int(src_all[eidx]), f"ACC_{src_all[eidx]}")
        d = idx2node.get(int(dst_all[eidx]), f"ACC_{dst_all[eidx]}")
        adj[s].add(d)
        adj[d].add(s)

    visited = set()
    rings = {}
    ring_id = 0

    for start in adj:
        if start in visited:
            continue
        members = []
        queue = deque([start])
        visited.add(start)
        while queue:
            node = queue.popleft()
            members.append(node)
            for nb in adj[node]:
                if nb not in visited:
                    visited.add(nb)
                    queue.append(nb)
        if len(members) >= 2:
            risk = float(np.mean([account_scores.get(m, 0) for m in members]))
            rings[f"RING_{ring_id:03d}"] = {
                "member_accounts": members,
                "pattern_type": "network_cluster",
                "risk_score": risk,
            }
            ring_id += 1

    return rings


def run_inference(model: EdgeGAT, data: Data, df, threshold: float = None) -> dict:
    """
    Full inference pipeline:
      1. Get edge probabilities
      2. Build account-level suspicion scores
      3. Detect fraud rings
      4. Generate structured report

    Parameters
    ----------
    model : EdgeGAT — loaded model in eval mode
    data  : Data    — PyG graph object (already on device)
    df    : DataFrame — cleaned transaction DataFrame (for metadata)
    threshold : float — suspicion threshold (defaults to config)

    Returns
    -------
    dict in the format:
    {
      "suspicious_accounts": [...],
      "fraud_rings": [...],
      "summary": {...}
    }
    """
    if threshold is None:
        threshold = SUSPICION_THRESHOLD

    t0 = time.time()

    # Step 1: edge probabilities
    all_probs = _get_edge_probs(model, data)

    # Step 2: account scores
    account_scores, account_trans_count, account_transactions = _build_account_scores(
        all_probs, data, df, threshold
    )

    # Step 3: fraud rings
    fraud_rings = _detect_fraud_rings(all_probs, data, account_scores, threshold)

    # Step 4: build report
    # Map accounts to their ring IDs
    account_ring_map = {}
    for rid, info in fraud_rings.items():
        for member in info["member_accounts"]:
            account_ring_map[member] = rid

    suspicious_accounts = []
    for acc_id, score in account_scores.items():
        ring_id = account_ring_map.get(acc_id)

        # Include account if its score is high, OR if it's a member of a detected fraud ring.
        if score < threshold * 100 and not ring_id:
            continue

        # Pattern tags
        patterns = []
        tx_count = account_trans_count.get(acc_id, 0)
        if tx_count > 5:
            patterns.append("high_velocity")
        if ring_id:
            patterns.append("network_cluster")
        if score > 80:
            patterns.append("high_risk_score")

        suspicious_accounts.append({
            "account_id": acc_id,
            "suspicion_score": round(score, 2),
            "detected_patterns": patterns,
            "ring_id": ring_id,
            "transactions": account_transactions.get(acc_id, []),
        })

    # Sort by suspicion score descending
    suspicious_accounts.sort(key=lambda x: x["suspicion_score"], reverse=True)

    fraud_rings_list = []
    for rid, info in fraud_rings.items():
        ring_tx_map = {}
        for member in info["member_accounts"]:
            for tx in account_transactions.get(member, []):
                ring_tx_map[tx["transaction_id"]] = tx
        
        fraud_rings_list.append({
            "ring_id": rid,
            "member_accounts": info["member_accounts"],
            "pattern_type": info["pattern_type"],
            "risk_score": round(info["risk_score"], 2),
            "transactions": list(ring_tx_map.values()),
        })

    processing_time = round(time.time() - t0, 3)

    report = {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": fraud_rings_list,
        "summary": {
            "total_accounts_analyzed": data.num_nodes,
            "suspicious_accounts_flagged": len(suspicious_accounts),
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": processing_time,
        },
    }

    return report
