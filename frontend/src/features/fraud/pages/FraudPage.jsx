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

  // ── Enrich fraud rings with account + transaction objects from ML data ────────
  const enrichedRings = fraud_rings.map((ring) => {
    const stringIds = ring.member_accounts || [];

    // Map over every string ID in the ring
    let ringAccounts = stringIds.map((accountId) => {
      // Find the detailed object for this account if it exists in suspicious_accounts
      if (suspicious_accounts && suspicious_accounts.length > 0) {
        const detailedAcc = suspicious_accounts.find(
          (acc) => acc.account_id === accountId || (acc.ring_id === ring.ring_id && acc.account_id === accountId)
        );
        if (detailedAcc) return detailedAcc; // Use the rich object
      }
      return accountId; // Fallback to plain string ID
    });

    // Also include any suspicious_accounts that claim to be in this ring but weren't in member_accounts
    if (suspicious_accounts && suspicious_accounts.length > 0) {
      const extraAccounts = suspicious_accounts.filter(
        (acc) => acc.ring_id === ring.ring_id && !stringIds.includes(acc.account_id)
      );
      ringAccounts.push(...extraAccounts);
    }

    return { ...ring, _accounts: ringAccounts };
  });

  const openMembersModal = (ring) => {
    setMembersModalData({ ring, members: ring._accounts });
  };

  const openTransactionsModal = (ring) => {
    const allTx = [];
    if (ring._accounts && ring._accounts.length > 0) {
      ring._accounts.forEach((acc) => {
        if (acc.transactions) allTx.push(...acc.transactions);
      });
    }
    setTransactionsModalData({ ring, transactions: allTx });
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
            {analysisRun && summary && !loading && (
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
