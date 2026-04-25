import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FileText, Search, AlertCircle, RefreshCw, ShieldCheck, Link2 } from 'lucide-react';
import { fetchIFSCDetails } from '../services/ifsc.api';
import { mapIFSCToForm } from '../utils/sarForm.utils';

/**
 * Screen 1 — IFSC Lookup + Ring ID selection
 * User enters an IFSC code and selects/enters a Ring ID.
 * On success, bank details + ring selection are passed back.
 */
const IFSCScreen = ({ onSuccess }) => {
  const [ifsc,   setIfsc]   = useState('');
  const [ringId, setRingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [retry,   setRetry]   = useState(false);

  // Read fraud rings from Redux store (populated after ML analysis)
  const fraudRings = useSelector((state) => state.fraud.fraud_rings);
  const hasRings   = Array.isArray(fraudRings) && fraudRings.length > 0;

  const handleFetch = async () => {
    const code = ifsc.trim().toUpperCase();
    if (!code) {
      setError('Please enter an IFSC code.');
      return;
    }
    setError('');
    setLoading(true);
    setRetry(false);
    try {
      const data   = await fetchIFSCDetails(code);
      const mapped = mapIFSCToForm(data);
      // Pass both bank fields and the chosen ring ID to the parent
      onSuccess(mapped, data, ringId.trim());
    } catch (err) {
      setError(err.message || 'Unknown error occurred.');
      setRetry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetch();
  };

  return (
    <div className="sar-ifsc-screen">
      {/* Hero badge */}
      <div className="sar-ifsc-screen__badge">
        <ShieldCheck size={16} />
        <span>Suspicious Activity Report Generator</span>
      </div>

      {/* Heading */}
      <div className="sar-ifsc-screen__hero">
        <div className="sar-ifsc-screen__icon-wrap">
          <FileText size={32} strokeWidth={1.5} />
        </div>
        <h1 className="sar-ifsc-screen__title">Create SAR Report</h1>
        <p className="sar-ifsc-screen__subtitle">
          Enter the branch IFSC code and select a detected fraud ring to
          auto-fill bank details and Part 6 account numbers.
        </p>
      </div>

      {/* Input card */}
      <div className="sar-ifsc-screen__card">
        {/* IFSC Input */}
        <label className="sar-ifsc-screen__label" htmlFor="ifsc-input">
          Branch IFSC Code
        </label>
        <div className="sar-ifsc-screen__input-row">
          <input
            id="ifsc-input"
            className={`sar-ifsc-screen__input ${error ? 'sar-ifsc-screen__input--error' : ''}`}
            type="text"
            placeholder="e.g. SBIN0001234"
            value={ifsc}
            onChange={(e) => {
              setIfsc(e.target.value.toUpperCase());
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            maxLength={11}
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
            aria-label="IFSC code input"
          />
          <button
            id="ifsc-fetch-btn"
            className="sar-ifsc-screen__fetch-btn"
            onClick={handleFetch}
            disabled={loading}
            aria-label="Fetch bank details"
          >
            {loading ? (
              <span className="sar-ifsc-screen__spinner" aria-live="polite">
                <RefreshCw size={16} className="spin" />
                Fetching…
              </span>
            ) : (
              <>
                <Search size={16} />
                Fetch Details
              </>
            )}
          </button>
        </div>

        {/* Ring ID picker */}
        <label className="sar-ifsc-screen__label" htmlFor="ring-id-input" style={{ marginTop: '1.25rem' }}>
          <Link2 size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
          Fraud Ring ID
          <span style={{ marginLeft: '0.4rem', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400 }}>
            (optional — auto-fills Part 6 accounts)
          </span>
        </label>

        {hasRings ? (
          /* Dropdown when Redux has ML analysis data */
          <select
            id="ring-id-input"
            className="sar-ring-selector"
            value={ringId}
            onChange={(e) => setRingId(e.target.value)}
            disabled={loading}
            aria-label="Select fraud ring"
          >
            <option value="">— No ring selected —</option>
            {fraudRings.map((ring, idx) => (
              <option key={ring.ring_id ?? idx} value={ring.ring_id ?? idx}>
                Ring #{ring.ring_id ?? idx}
                {ring.risk_score !== undefined
                  ? ` — Risk: ${ring.risk_score}%`
                  : ''}
                {ring.member_accounts
                  ? ` (${ring.member_accounts.length} accounts)`
                  : ''}
              </option>
            ))}
          </select>
        ) : (
          /* Text fallback when no ML data is loaded yet */
          <div className="sar-ifsc-screen__input-row">
            <input
              id="ring-id-input"
              className="sar-ifsc-screen__input"
              type="text"
              placeholder="e.g. RING_001 (run ML analysis first for auto-fill)"
              value={ringId}
              onChange={(e) => setRingId(e.target.value)}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
              aria-label="Fraud ring ID"
            />
          </div>
        )}

        {!hasRings && (
          <p className="sar-ifsc-screen__hint" style={{ marginTop: '0.4rem', color: '#f59e0b' }}>
            ⚠ No fraud analysis data loaded. Run ML analysis on the Fraud page first to enable account auto-fill.
          </p>
        )}

        {error && (
          <div className="sar-ifsc-screen__error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
            {retry && (
              <button
                className="sar-ifsc-screen__retry-link"
                onClick={handleFetch}
                aria-label="Retry fetch"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <p className="sar-ifsc-screen__hint">
          11-character IFSC (e.g. SBIN0001234). Bank details will be auto-filled and
          can be edited before generating the PDF.
        </p>
      </div>

      {/* Info strip */}
      <div className="sar-ifsc-screen__info-strip">
        <div className="sar-ifsc-screen__info-item">
          <span className="sar-ifsc-screen__info-dot sar-ifsc-screen__info-dot--blue" />
          Auto-fills bank &amp; branch details
        </div>
        <div className="sar-ifsc-screen__info-item">
          <span className="sar-ifsc-screen__info-dot sar-ifsc-screen__info-dot--green" />
          Auto-fills Part 6 account numbers
        </div>
        <div className="sar-ifsc-screen__info-item">
          <span className="sar-ifsc-screen__info-dot sar-ifsc-screen__info-dot--red" />
          Encrypted PDF output
        </div>
      </div>
    </div>
  );
};

export default IFSCScreen;
