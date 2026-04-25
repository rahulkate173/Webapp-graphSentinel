"""
CSV → PyG Data pipeline.
Mirrors the preprocess() and build_graph() functions from the training notebook.
"""

import numpy as np
import pandas as pd
import torch
from sklearn.preprocessing import LabelEncoder
from torch_geometric.data import Data

from app.config import DEVICE


def preprocess(trans_df: pd.DataFrame, accounts_df: pd.DataFrame) -> tuple[pd.DataFrame, LabelEncoder, LabelEncoder]:
    """
    Clean and feature-engineer the raw transaction DataFrame.

    Column schema
    -------------
    Trans   : Timestamp, From Bank, Account, To Bank, Account.1,
              Amount Received, Receiving Currency, Amount Paid,
              Payment Currency, Payment Format, Is Laundering
    Accounts: Bank ID, Account Number, Entity ID, Entity Name
    """
    # ---- account id = "BankID_AccountNumber" ----
    acc_col   = accounts_df.columns[1]   # Account Number
    bank_col  = accounts_df.columns[0]   # Bank ID
    accounts_df["acc_id"] = (
        accounts_df[bank_col].astype(str) + "_" +
        accounts_df[acc_col].astype(str)
    )

    df = trans_df.copy()

    # Build consistent account IDs: "BankID_AccountNumber"
    df["From_Account"] = df["From Bank"].astype(str) + "_" + df["Account"].astype(str)
    df["To_Account"]   = df["To Bank"].astype(str)   + "_" + df["Account.1"].astype(str)

    # Timestamp
    df["Timestamp"] = pd.to_datetime(df["Timestamp"], errors="coerce")
    df = df.dropna(subset=["From_Account", "To_Account", "Timestamp"])

    # Label (optional — may not exist during pure inference)
    if "Is Laundering" in df.columns:
        df["label"] = df["Is Laundering"].astype(int)
    else:
        df["label"] = 0

    # Payment format encoding
    le_payment = LabelEncoder()
    df["payment_enc"] = le_payment.fit_transform(df["Payment Format"].astype(str))

    # Currency encoding
    le_currency = LabelEncoder()
    df["currency_enc"] = le_currency.fit_transform(df["Payment Currency"].astype(str))

    # Numeric features
    df["amount_log"]  = np.log1p(df["Amount Paid"].fillna(0))
    df["hour"]        = df["Timestamp"].dt.hour / 23.0
    df["day_of_week"] = df["Timestamp"].dt.dayofweek / 6.0

    df = df.reset_index(drop=True)
    return df, le_payment, le_currency


def build_graph(df: pd.DataFrame) -> Data:
    """
    Build a PyG Data object from the preprocessed DataFrame.

    Node  = unique bank account
    Edge  = transaction (directed, From → To)
    Edge features: [amount_log, hour, day_of_week, payment_enc_norm, currency_enc_norm]
    Node features: [out-degree, in-degree, sum_sent, sum_received] (normalised)
    """
    # ── Node index mapping ───────────────────────────────────────────────
    all_accounts = pd.unique(
        pd.concat([df["From_Account"], df["To_Account"]])
    )
    node2idx = {acc: i for i, acc in enumerate(all_accounts)}
    idx2node = {i: acc for acc, i in node2idx.items()}
    num_nodes = len(node2idx)

    src = df["From_Account"].map(node2idx).values.astype(np.int64)
    dst = df["To_Account"].map(node2idx).values.astype(np.int64)

    edge_index = torch.tensor(np.stack([src, dst], axis=0), dtype=torch.long)

    # ── Edge features ────────────────────────────────────────────────────
    num_pay = df["payment_enc"].max() + 1
    num_cur = df["currency_enc"].max() + 1

    edge_feat = np.stack([
        df["amount_log"].values,
        df["hour"].values,
        df["day_of_week"].values,
        df["payment_enc"].values / max(num_pay, 1),
        df["currency_enc"].values / max(num_cur, 1),
    ], axis=1).astype(np.float32)

    edge_attr = torch.tensor(edge_feat, dtype=torch.float)

    # ── Node features: per-node stats ────────────────────────────────────
    node_feat = np.zeros((num_nodes, 4), dtype=np.float32)
    amounts = df["amount_log"].values

    np.add.at(node_feat[:, 0], src, 1)          # out-degree count
    np.add.at(node_feat[:, 1], dst, 1)          # in-degree count
    np.add.at(node_feat[:, 2], src, amounts)    # sum sent
    np.add.at(node_feat[:, 3], dst, amounts)    # sum received

    # Normalise
    max_vals = node_feat.max(axis=0, keepdims=True) + 1e-8
    node_feat = node_feat / max_vals

    x = torch.tensor(node_feat, dtype=torch.float)

    # ── Assemble Data object ─────────────────────────────────────────────
    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
    data.num_nodes = num_nodes
    data.node2idx = node2idx
    data.idx2node = idx2node

    return data


def move_to_device(data: Data, device=DEVICE) -> Data:
    """Move all tensors in the Data object to the target device."""
    data.x = data.x.to(device)
    data.edge_index = data.edge_index.to(device)
    data.edge_attr = data.edge_attr.to(device)
    return data
