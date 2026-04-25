"""
Inference engine: run model, compute account scores, detect fraud rings, build report.
Mirrors the post-training analysis cells from trail-3-money-muling.ipynb.
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


# ═══════════════════════════════════════════════════════════════════════════
# IBM pattern identification (from notebook: identify_ibm_pattern)
# ═══════════════════════════════════════════════════════════════════════════

def _identify_ibm_pattern(acc_id: str, transactions: list[dict]) -> str:
    """
    Analyzes transaction topology to map to IBM's 8 laundering patterns.
    Directly ported from the training notebook.
    """
    senders = set(tx["sender_id"] for tx in transactions if tx["sender_id"] != acc_id)
    receivers = set(tx["receiver_id"] for tx in transactions if tx["receiver_id"] != acc_id)

    in_degree = len(senders)
    out_degree = len(receivers)

    # 1. Simple Cycle: A -> B -> A
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


# ═══════════════════════════════════════════════════════════════════════════
# Edge probabilities
# ═══════════════════════════════════════════════════════════════════════════

@torch.no_grad()
def _get_edge_probs(model: EdgeGAT, data: Data) -> np.ndarray:
    """Run forward pass and return per-edge laundering probabilities."""
    model.eval()
    logits, _ = model(data.x, data.edge_index, data.edge_attr)
    probs = F.softmax(logits, dim=-1)[:, 1].cpu().numpy()
    return probs


# ═══════════════════════════════════════════════════════════════════════════
# Account-level scoring
# ═══════════════════════════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════════════════════════
# Fraud ring detection (from notebook: detect_fraud_rings)
# ═══════════════════════════════════════════════════════════════════════════

def _detect_fraud_rings(
    all_probs: np.ndarray,
    data: Data,
    account_scores: dict,
    account_transactions: dict,
    threshold: float,
) -> dict:
    """
    Detect fraud rings via BFS connected-component analysis
    over the subgraph of suspicious edges.

    Includes:
    - Origin / exit node detection (highest out-flow / in-flow)
    - IBM pattern identification
    """
    suspicious_indices = np.where(all_probs >= threshold)[0]
    idx2node = data.idx2node if hasattr(data, "idx2node") else {}
    src_all = data.edge_index[0].cpu().numpy()
    dst_all = data.edge_index[1].cpu().numpy()

    # Directed adjacency for flow analysis (who sent to whom)
    adj_directed = defaultdict(list)
    # Undirected adjacency for finding the cluster/ring
    adj_undirected = defaultdict(set)

    for eidx in suspicious_indices:
        s = idx2node.get(int(src_all[eidx]), f"ACC_{src_all[eidx]}")
        d = idx2node.get(int(dst_all[eidx]), f"ACC_{dst_all[eidx]}")
        adj_directed[s].append(d)
        adj_undirected[s].add(d)
        adj_undirected[d].add(s)

    visited = set()
    rings = {}
    ring_id = 0

    for start in adj_undirected:
        if start in visited:
            continue
        members = []
        queue = deque([start])
        visited.add(start)
        while queue:
            node = queue.popleft()
            members.append(node)
            for nb in adj_undirected[node]:
                if nb not in visited:
                    visited.add(nb)
                    queue.append(nb)

        if len(members) >= 2:
            # ── Origin / Exit node logic ──
            in_counts = {m: 0 for m in members}
            out_counts = {m: 0 for m in members}

            for m in members:
                for neighbor in adj_directed[m]:
                    if neighbor in in_counts:
                        out_counts[m] += 1
                        in_counts[neighbor] += 1

            origin_node = max(out_counts, key=out_counts.get)
            exit_node = max(in_counts, key=in_counts.get)

            # If origin and exit resolved to the same node (tie-break), pick the
            # next highest in-degree node as the exit so they are always distinct.
            if origin_node == exit_node and len(members) > 1:
                sorted_in = sorted(in_counts.items(), key=lambda x: x[1], reverse=True)
                for node, _ in sorted_in:
                    if node != origin_node:
                        exit_node = node
                        break

            # ── IBM pattern identification ──
            ring_txs = []
            for m in members:
                ring_txs.extend(account_transactions.get(m, []))

            pattern = _identify_ibm_pattern(members[0], ring_txs)
            risk = float(np.mean([account_scores.get(m, 0) for m in members]))

            rings[f"RING_{ring_id:03d}"] = {
                "member_accounts": members,
                "pattern_type": pattern,
                "risk_score": risk,
                "origin": origin_node,
                "destination": exit_node,
            }
            ring_id += 1

    return rings


# ═══════════════════════════════════════════════════════════════════════════
# Report generation (from notebook: generate_report)
# ═══════════════════════════════════════════════════════════════════════════

def run_inference(model: EdgeGAT, data: Data, df, threshold: float = None) -> dict:
    """
    Full inference pipeline:
      1. Get edge probabilities
      2. Build account-level suspicion scores
      3. Detect fraud rings (with IBM pattern + flow analysis)
      4. Generate structured report matching notebook output

    Parameters
    ----------
    model : EdgeGAT — loaded model in eval mode
    data  : Data    — PyG graph object (already on device)
    df    : DataFrame — cleaned transaction DataFrame (for metadata)
    threshold : float — suspicion threshold (defaults to config)

    Returns
    -------
    dict matching the notebook's generate_report() format:
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

    # Step 3: fraud rings (with origin/exit + IBM patterns)
    fraud_rings = _detect_fraud_rings(
        all_probs, data, account_scores, account_transactions, threshold
    )

    # Step 4: build report (matching notebook generate_report format)
    formatted_rings = []
    for rid, info in fraud_rings.items():
        # Build per-ring account details with roles
        ring_accounts = []
        for acc_id in info["member_accounts"]:
            # Determine role
            if acc_id == info["origin"]:
                role = "Originator"
            elif acc_id == info["destination"]:
                role = "Exit Point"
            else:
                role = "Intermediary / Mule"

            # Build pattern list
            acc_txs = account_transactions.get(acc_id, [])
            pattern_list = [info["pattern_type"]]
            if len(acc_txs) > 10:
                pattern_list.append("high_velocity")

            score = account_scores.get(acc_id, 0.0)
            if score > 80:
                pattern_list.append("high_risk_score")

            ring_accounts.append({
                "account_id": acc_id,
                "role": role,
                "suspicion_score": round(score, 2),
                "detected_patterns": pattern_list,
            })

        # Get all unique transactions for this ring
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
                "origin_node": info["origin"],
                "exit_node": info["destination"],
                "total_hop_count": len(info["member_accounts"]) - 1,
            },
            "accounts": ring_accounts,
            "transactions": ring_tx_sample,   # Return all unique transactions
            "context": {
                "time_window": datetime.now().strftime("%Y-%m-%d"),
                "analysis_type": "fraud_ring_explanation",
                "pattern_identified": info["pattern_type"],
            },
        })

    # Flatten suspicious accounts from rings (matching notebook)
    suspicious_accounts = []
    for ring in formatted_rings:
        for acc in ring["accounts"]:
            if acc["suspicion_score"] > threshold * 100:
                suspicious_accounts.append(acc)
    suspicious_accounts.sort(key=lambda x: x["suspicion_score"], reverse=True)

    processing_time = round(time.time() - t0, 3)

    report = {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": formatted_rings,
        "summary": {
            "total_accounts_analyzed": data.num_nodes,
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": processing_time,
        },
    }

    return report
