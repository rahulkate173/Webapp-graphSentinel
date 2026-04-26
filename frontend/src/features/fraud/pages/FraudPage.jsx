import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../layer1/components/Layout';
import FraudStats from '../components/FraudStats';
import FraudTable from '../components/FraudTable';
import FraudGraphView from '../components/FraudGraphView';
import MembersModal from '../components/MembersModal';
import TransactionsModal from '../components/TransactionsModal';
import '../styles/fraud.css';

const FraudPage = () => {
  const navigate = useNavigate();
  const { suspicious_accounts, fraud_rings, summary, loading, analysisRun, error } =
    useSelector((state) => state.fraud);

  const [selectedRingForGraph, setSelectedRingForGraph] = useState(null);
  const [membersModalData, setMembersModalData] = useState(null);
  const [transactionsModalData, setTransactionsModalData] = useState(null);

  // ── Enrich fraud rings — new ML response has ring.accounts + ring.transactions ──
  const enrichedRings = fraud_rings.map((ring) => {
    // New API: accounts array is directly on the ring object
    const accounts = ring.accounts || [];

    // Derive risk_score from max suspicion_score across ring members
    const maxScore = accounts.reduce((m, a) => Math.max(m, a.suspicion_score || 0), 0);
    const risk_score = Math.min(100, Math.round(maxScore));

    // Pattern comes from ring.context.pattern_identified (new API)
    // Fall back to ring.pattern_type for backward compat with old saved data
    const pattern_type = ring.context?.pattern_identified || ring.pattern_type || 'Unknown';

    return {
      ...ring,
      risk_score,
      pattern_type,
      _accounts: accounts,         // alias for components that read _accounts
    };
  });

  const openMembersModal = (ring) => {
    setMembersModalData({ ring, members: ring._accounts });
  };

  const openTransactionsModal = (ring) => {
    // New API: transactions are directly on ring object
    setTransactionsModalData({ ring, transactions: ring.transactions || [] });
  };

  return (
    <Layout>
      <div className="fraud-page custom-scrollbar">
        {selectedRingForGraph ? (
          <FraudGraphView
            ring={selectedRingForGraph}
            onClose={() => setSelectedRingForGraph(null)}
            suspicious_accounts={suspicious_accounts}
          />
        ) : (
          <>
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="fraud-header">
              <div>
                <h1 className="fraud-title">Fraud Rings</h1>
                <p className="fraud-subtitle">
                  Cluster analysis of multi-hop money laundering networks
                </p>
              </div>

              {/* Upload new files button */}
              <button
                className="run-ml-btn"
                onClick={() => navigate('/dashboard')}
                id="upload-new-btn"
                aria-label="Upload new CSV files"
              >
                <svg
                  width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
                Upload New Files
              </button>
            </div>

            {/* ── Loading state ─────────────────────────────────────────────── */}
            {loading && (
              <div className="fraud-empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5"
                    style={{ animation: 'spin 1.2s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity="0.2" />
                    <path d="M21 12a9 9 0 0 0-9-9" />
                  </svg>
                </div>
                <h2>Analysing…</h2>
                <p>Please wait while ML processes your CSV files.</p>
              </div>
            )}

            {/* ── Error banner ──────────────────────────────────────────────── */}
            {error && (
              <div className="fraud-error-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* ── Empty state — no files uploaded yet ──────────────────────── */}
            {!analysisRun && !loading && (
              <div className="fraud-empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h2>No Analysis Data</h2>
                <p>
                  Upload your <strong>transactions</strong> and <strong>accounts</strong>{' '}
                  CSV files to detect fraud rings and suspicious accounts.
                </p>
                <button
                  className="run-ml-btn"
                  style={{ marginTop: '1rem' }}
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Upload
                </button>
              </div>
            )}

            {/* ── Stats + Table (only shown after real ML result) ───────────── */}
            {analysisRun && !loading && (
              <>
                <FraudStats summary={summary} suspicious_accounts={suspicious_accounts} />
                <FraudTable
                  rings={enrichedRings}
                  onViewGraph={(ring) => setSelectedRingForGraph(ring)}
                  onViewMembers={openMembersModal}
                  onViewTransactions={openTransactionsModal}
                />
              </>
            )}
          </>
        )}

        {/* ── Modals ────────────────────────────────────────────────────────── */}
        {membersModalData && (
          <MembersModal
            data={membersModalData}
            onClose={() => setMembersModalData(null)}
          />
        )}
        {transactionsModalData && (
          <TransactionsModal
            data={transactionsModalData}
            onClose={() => setTransactionsModalData(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default FraudPage;
