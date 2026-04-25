import React from 'react';

// Utility: pick a risk class from score
const riskClass = (score) =>
  score > 80 ? 'high-risk' : score > 50 ? 'med-risk' : 'low-risk';

// Utility: pick a pattern icon SVG
const PatternIcon = ({ type }) => {
  const t = (type || '').toLowerCase();
  if (t === 'cycle')
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21v-5h5" />
      </svg>
    );
  if (t === 'smurfing')
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    );
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
};

const FraudTable = ({ rings, onViewGraph, onViewMembers, onViewTransactions }) => {
  return (
    <div className="fraud-table-container">
      <div className="fraud-table-header">
        <h2 className="fraud-table-title">Detected Clusters</h2>
        <div className="fraud-table-actions">
          <button className="table-action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>
          <button className="table-action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="fraud-table">
          <thead>
            <tr>
              <th>RING ID</th>
              <th>PATTERN TYPE</th>
              <th>MEMBER COUNT</th>
              <th>RISK SCORE</th>
              <th>MEMBER ACCOUNT IDs</th>
              <th>TRANSACTIONS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rings.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No fraud rings detected in this analysis.
                </td>
              </tr>
            )}
            {rings.map((ring, idx) => {
              const memberCount = ring.member_accounts?.length ?? 0;
              const txCount = ring._accounts?.reduce(
                (s, a) => s + (a.transactions?.length || 0), 0
              ) ?? 0;

              return (
                <tr key={idx}>
                  {/* Ring ID */}
                  <td>
                    <div className="ring-id-cell">
                      <span className="ring-id-text">{ring.ring_id}</span>
                    </div>
                  </td>

                  {/* Pattern type */}
                  <td>
                    <div className="pattern-cell">
                      <div className={`pattern-icon-circle ${(ring.pattern_type || '').toLowerCase()}`}>
                        <PatternIcon type={ring.pattern_type} />
                      </div>
                      <span className="pattern-text">{ring.pattern_type}</span>
                    </div>
                  </td>

                  {/* Member count */}
                  <td>
                    <div className="member-count-cell">
                      <span className="member-count-val">{memberCount}</span>
                      <span className="member-count-label">Members</span>
                    </div>
                  </td>

                  {/* Risk score */}
                  <td>
                    <div className="risk-score-cell">
                      <span className={`risk-val ${riskClass(ring.risk_score)}`}>
                        {ring.risk_score}
                      </span>
                      <div className="mini-progress">
                        <div
                          className={`mini-progress-fill ${riskClass(ring.risk_score)}-fill`}
                          style={{ width: `${ring.risk_score}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Member badges — derived from ML data, no hardcoded "+38 more" */}
                  <td>
                    <div
                      className="members-badge-container"
                      onClick={() => onViewMembers(ring)}
                      title="Click to view all members"
                    >
                      {(ring.member_accounts || []).slice(0, 3).map((acc, i) => (
                        <span key={i} className="member-badge">{acc}</span>
                      ))}
                      {memberCount > 3 && (
                        <span className="member-badge more-badge">+{memberCount - 3} more</span>
                      )}
                    </div>
                  </td>

                  {/* Transactions */}
                  <td>
                    <button className="table-view-btn" onClick={() => onViewTransactions(ring)}>
                      View Transactions
                      {txCount > 0 && (
                        <span className="tx-count-badge">{txCount}</span>
                      )}
                    </button>
                  </td>

                  {/* Graph */}
                  <td>
                    <button className="view-graph-btn" onClick={() => onViewGraph(ring)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                      </svg>
                      View in Graph
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="fraud-table-footer">
        <span className="showing-text">
          Showing {rings.length} ring{rings.length !== 1 ? 's' : ''} detected
        </span>
      </div>
    </div>
  );
};

export default FraudTable;
