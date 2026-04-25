"""
EdgeGAT model definition + checkpoint loader.
Architecture is an exact copy of the training notebook.
"""

import os
import glob
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GATConv

from app.config import (
    DEVICE, HIDDEN_DIM, NUM_LAYERS, NUM_HEADS, DROPOUT,
    NODE_FEAT_DIM, EDGE_FEAT_DIM, NUM_CLASSES, MODEL_DIR, MODEL_FILENAME,
)


# ═══════════════════════════════════════════════════════════════════════════
# Model Architecture (mirrors notebook exactly)
# ═══════════════════════════════════════════════════════════════════════════

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
        self.norms = nn.ModuleList()

        in_dim = node_feat_dim
        for i in range(num_layers):
            out_dim = hidden_dim // num_heads
            is_last = (i == num_layers - 1)
            heads = 1 if is_last else num_heads
            concat = not is_last
            self.gat_layers.append(
                GATConv(in_dim, out_dim, heads=heads, concat=concat,
                        dropout=dropout, add_self_loops=True)
            )
            self.norms.append(nn.BatchNorm1d(out_dim * heads if concat else out_dim))
            in_dim = out_dim * heads if concat else out_dim

        node_emb_dim = in_dim

        # Edge MLP: src_emb + dst_emb + edge_feat
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

        src_idx = edge_index[0]
        dst_idx = edge_index[1]

        edge_emb = torch.cat([node_emb[src_idx], node_emb[dst_idx], edge_attr], dim=-1)
        logits = self.edge_mlp(edge_emb)
        return logits, node_emb


# ═══════════════════════════════════════════════════════════════════════════
# Loader
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
    pth_files = glob.glob(os.path.join(model_dir, "*.pt"))
    pth_files += glob.glob(os.path.join(model_dir, "*.pth"))
    if not pth_files:
        raise FileNotFoundError(f"No .pt/.pth files found in {model_dir}")

    latest = max(pth_files, key=os.path.getmtime)
    return latest


def load_model() -> tuple[EdgeGAT, str]:
    """
    Load the EdgeGAT model from the latest checkpoint.

    Returns
    -------
    model : EdgeGAT  — model in eval mode on the configured DEVICE
    model_name : str — basename of the loaded checkpoint file
    """
    model_path = _find_model_path()
    model_name = os.path.basename(model_path)

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

    print(f"[GraphSentinel] Model loaded: {model_name}  ({sum(p.numel() for p in model.parameters()):,} params)")
    return model, model_name
