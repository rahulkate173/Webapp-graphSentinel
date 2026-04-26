import React from 'react';

const FraudStats = ({ summary, suspicious_accounts }) => {
  // ── Derive computed values from ML data ──────────────────────────────────
  // Fallback: count directly from the arrays when summary fields are missing
  const totalSuspicious = summary?.suspicious_accounts_flagged
    ?? (suspicious_accounts?.length || 0);
  const totalAnalyzed   = summary?.total_accounts_analyzed ?? 0;
  const ringsDetected   = summary?.fraud_rings_detected
    ?? 0; // will be overridden by the badge in the header anyway
  const processingTime  = summary?.processing_time_seconds ?? 0;

  // Average suspicion score across all flagged accounts
  const avgRisk =
    suspicious_accounts && suspicious_accounts.length > 0
      ? (
          suspicious_accounts.reduce((sum, a) => sum + (a.suspicion_score || 0), 0) /
          suspicious_accounts.length
        ).toFixed(1)
      : '—';

  // Most common pattern across all flagged accounts
  const patternFreq = {};
  if (suspicious_accounts) {
    suspicious_accounts.forEach((acc) => {
      (acc.detected_patterns || []).forEach((p) => {
        patternFreq[p] = (patternFreq[p] || 0) + 1;
      });
    });
  }
  const primaryPattern =
    Object.keys(patternFreq).length > 0
      ? Object.entries(patternFreq).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

  const coveragePct =
    totalAnalyzed > 0
      ? ((totalSuspicious / totalAnalyzed) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="fraud-stats-container">
      {/* Card 1 — Flagged Accounts */}
      <div className="fraud-stat-card">
        <h3 className="stat-card-title">TOTAL SUSPICIOUS</h3>
        <div className="stat-card-body stat-card-body-col">
          <span className="stat-card-value">{totalSuspicious.toLocaleString()}</span>
          <span className="stat-card-sub">
            of {totalAnalyzed.toLocaleString()} analyzed
          </span>
          <span className="stat-card-badge">{coveragePct}% flagged</span>
        </div>
      </div>

      {/* Card 2 — Average Risk Score */}
      <div className="fraud-stat-card">
        <h3 className="stat-card-title">AVERAGE RISK SCORE</h3>
        <div className="stat-card-body stat-card-body-col">
          <span className="stat-card-value">{avgRisk}</span>
          <div className="risk-progress-bar-container">
            <div
              className="risk-progress-bar-fill"
              style={{ width: `${isNaN(avgRisk) ? 0 : avgRisk}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3 — Fraud Rings + Processing Time */}
      <div className="fraud-stat-card accent-card">
        <div className="pattern-header">
          <h3 className="stat-card-title text-light">FRAUD RINGS DETECTED</h3>
          <svg className="pattern-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </div>
        <h2 className="pattern-title">{ringsDetected} Ring{ringsDetected !== 1 ? 's' : ''}</h2>
        <p className="pattern-desc">
          Primary pattern: <strong>{primaryPattern.replace(/_/g, ' ')}</strong>.
          Analysis completed in {processingTime}s.
        </p>
      </div>
    </div>
  );
};

export default FraudStats;
