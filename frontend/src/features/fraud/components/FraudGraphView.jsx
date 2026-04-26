import React, { useMemo, useState } from 'react';
import { ReactFlow, Controls, Background, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Place nodes in a radial layout around a centre point */
const radialLayout = (ids, cx = 350, cy = 280, radius = 200) => {
  const positions = {};
  ids.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / ids.length - Math.PI / 2;
    positions[id] = {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
  return positions;
};

/** Pick node colour by suspicion score */
const nodeColor = (score) => {
  if (score >= 80) return { bg: '#d32f2f', border: '#ff7070' };
  if (score >= 50) return { bg: '#f57c00', border: '#ffb74d' };
  return { bg: '#1565c0', border: '#64b5f6' };
};

// ── Component ─────────────────────────────────────────────────────────────────

const FraudGraphView = ({ ring, onClose, suspicious_accounts }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const { nodes, edges } = useMemo(() => {
    // New API: accounts and transactions are directly on the ring object
    const ringAccounts = ring.accounts || ring._accounts || [];
    const ringTransactions = ring.transactions || [];

    // Collect all unique account IDs from accounts + transactions
    const allIds = new Set(ringAccounts.map((a) => a.account_id));
    ringTransactions.forEach((tx) => {
      if (tx.sender_id) allIds.add(tx.sender_id);
      if (tx.receiver_id) allIds.add(tx.receiver_id);
    });

    const idList = Array.from(allIds);
    if (idList.length === 0) return { nodes: [], edges: [] };

    const positions = radialLayout(idList);

    // Score lookup from ring accounts
    const scoreMap = {};
    const roleMap = {};
    ringAccounts.forEach((a) => {
      scoreMap[a.account_id] = a.suspicion_score || 0;
      roleMap[a.account_id] = a.role || '';
    });

    // Origin / exit: prefer flow_analysis IDs, fall back to role field in accounts
    const originFromFlow = ring.flow_analysis?.origin_node;
    const exitFromFlow   = ring.flow_analysis?.exit_node;

    // Fallback: find by role string inside accounts array
    const originFromRole = ringAccounts.find(
      (a) => a.role === 'Originator' || a.role === 'Origin'
    )?.account_id;
    const exitFromRole = ringAccounts.find(
      (a) => a.role === 'Exit Point' || a.role === 'Exit'
    )?.account_id;

    const originNode = originFromFlow || originFromRole;
    const exitNode   = exitFromFlow   || exitFromRole;

    // 2. Build nodes
    const nodesData = idList.map((id) => {
      const score = scoreMap[id] || 0;
      const { bg, border } = nodeColor(score);
      const isCentral = score >= 80;
      const isOrigin = id === originNode;
      // Only mark as exit if it's a different node from origin
      const isExit = id === exitNode && exitNode !== originNode;

      let label = id.length > 14 ? id.slice(-8) : id;
      if (isOrigin) label += '\n↑ Origin';
      else if (isExit) label += '\n↓ Exit Point';

      return {
        id,
        position: positions[id] || { x: 0, y: 0 },
        data: { label, score },
        style: {
          background: isOrigin ? '#7b1fa2' : isExit ? '#2e7d32' : bg,
          color: 'white',
          border: `${isCentral ? 4 : 2}px solid ${isOrigin ? '#ce93d8' : isExit ? '#66bb6a' : border}`,
          borderRadius: '50%',
          width: isCentral ? 56 : 38,
          height: isCentral ? 56 : 38,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: isCentral ? 'bold' : '500',
          fontSize: '9px',
          cursor: 'pointer',
        },
      };
    });

    // 3. Build edges from ring.transactions (deduplicated by sender->receiver pair)
    const edgesData = [];
    const edgeSeen = new Set();
    ringTransactions.forEach((tx) => {
      if (!tx.sender_id || !tx.receiver_id) return;
      const edgeKey = `${tx.sender_id}->${tx.receiver_id}`;
      if (edgeSeen.has(edgeKey)) return;
      edgeSeen.add(edgeKey);
      edgesData.push({
        id: tx.transaction_id || edgeKey,
        source: tx.sender_id,
        target: tx.receiver_id,
        animated: true,
        label: `$${(tx.amount || 0).toLocaleString()}`,
        labelStyle: { fill: '#ccc', fontSize: 10 },
        style: { stroke: '#888', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#888' },
      });
    });

    return { nodes: nodesData, edges: edgesData };
  }, [ring]);

  // Details for selected node
  const selectedAccount = suspicious_accounts?.find((a) => a.account_id === selectedNode);

  return (
    <div className="graph-view-container">
      {/* Header */}
      <div className="graph-header">
        <button className="back-btn" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Rings
        </button>
        <h2>
          Graph Visualization — {ring.ring_id}
          <span className="graph-subtitle-badge">
            {nodes.length} accounts · {edges.length} transactions
          </span>
        </h2>
      </div>

      <div className="graph-body">
        {/* Legend */}
        <div className="graph-legend">
          <div className="legend-item"><span className="legend-dot high" /> High Risk (≥80)</div>
          <div className="legend-item"><span className="legend-dot med" /> Medium Risk (≥50)</div>
          <div className="legend-item"><span className="legend-dot low" /> Normal</div>
          <div className="legend-item"><span className="legend-dash" /> Transaction Flow</div>
          <div className="legend-divider" />
          <div className="legend-meta">Ring: {ring.ring_id}</div>
          <div className="legend-meta">Pattern: {ring.pattern_type}</div>
          <div className="legend-meta risk-chip">Risk: {ring.risk_score}</div>
        </div>

        {/* React Flow canvas */}
        <div className="react-flow-wrapper" style={{ flex: 1, minHeight: 480 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-right"
            onNodeClick={(_, node) => setSelectedNode(node.id)}
          >
            <Background color="#2a2a3a" gap={20} />
            <Controls />
          </ReactFlow>
        </div>

        {/* Side panel — shows selected node details */}
        <div className="graph-side-panel">
          {selectedAccount ? (
            <>
              <div className="panel-header">
                <span className={`badge-risk ${selectedAccount.suspicion_score >= 80 ? 'badge-critical' : 'badge-warning'}`}>
                  {selectedAccount.suspicion_score >= 80 ? 'HIGH RISK' : 'MEDIUM RISK'}
                </span>
                <button className="close-panel-btn" onClick={() => setSelectedNode(null)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <h2 className="node-title">{selectedAccount.account_id}</h2>

              <div className="suspicion-box">
                <div className="susp-header">
                  <span>Suspicion Score</span>
                  <span className="susp-val">{selectedAccount.suspicion_score}</span>
                </div>
                <div className="susp-bar-container">
                  <div className="susp-bar-fill" style={{ width: `${selectedAccount.suspicion_score}%` }} />
                </div>
              </div>

              <div className="node-details-grid">
                <div className="grid-item">
                  <span className="grid-label">RING ID</span>
                  <span className="grid-val">{selectedAccount.ring_id}</span>
                </div>
                <div className="grid-item">
                  <span className="grid-label">TRANSACTIONS</span>
                  <span className="grid-val">{selectedAccount.transactions?.length ?? 0}</span>
                </div>
              </div>

              <div className="detected-patterns-list">
                <h4 className="list-title">DETECTED PATTERNS</h4>
                {(selectedAccount.detected_patterns || []).map((p, i) => (
                  <div key={i} className="pattern-item critical">
                    <div className="pi-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </div>
                    <div className="pi-content">
                      <span className="pi-title">{p.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transactions for selected account */}
              {selectedAccount.transactions?.length > 0 && (
                <div className="panel-tx-list">
                  <h4 className="list-title">TRANSACTIONS</h4>
                  {selectedAccount.transactions.map((tx, i) => (
                    <div key={i} className="panel-tx-item">
                      <span className="tx-id">{tx.transaction_id}</span>
                      <span className="tx-arrow">→</span>
                      <span className="tx-amount">${(tx.amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="panel-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p>Click any node in the graph to view account details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FraudGraphView;
