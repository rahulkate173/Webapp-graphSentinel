import React, { useEffect, useState } from 'react';
import { X, Activity, AlertTriangle } from 'lucide-react';
import { fetchHistoryDetails } from '../services/history.api';

const HistoryDetailsModal = ({ recordId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchHistoryDetails(recordId);
        setDetails(data);
      } catch (err) {
        setError('Failed to load history details.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [recordId]);

  const renderRings = () => {
    if (!details.fraud_rings || details.fraud_rings.length === 0) {
      return <p style={{ color: '#64748b' }}>No fraud rings detected.</p>;
    }
    return (
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Ring ID</th>
              <th>Pattern</th>
              <th>Members</th>
              <th>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {details.fraud_rings.map((ring, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, color: '#3b82f6' }}>{ring.ring_id || `Ring-${idx+1}`}</td>
                <td>{ring.pattern_type}</td>
                <td>{ring.member_accounts?.length || 0}</td>
                <td>
                  <span className={`history-badge ${ring.risk_score >= 80 ? 'danger' : 'safe'}`}>
                    {ring.risk_score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAccounts = () => {
    if (!details.suspicious_accounts || details.suspicious_accounts.length === 0) {
      return <p style={{ color: '#64748b' }}>No suspicious accounts flagged.</p>;
    }
    return (
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Risk Score</th>
              <th>Detected Patterns</th>
            </tr>
          </thead>
          <tbody>
            {details.suspicious_accounts.map((acc, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{acc.account_id}</td>
                <td>{acc.suspicion_score}</td>
                <td>
                  {acc.ring_id && (
                    <span style={{ 
                      background: '#fee2e2', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '11px',
                      marginRight: '4px',
                      display: 'inline-block',
                      color: '#ef4444',
                      fontWeight: 600
                    }}>
                      {acc.ring_id}
                    </span>
                  )}
                  {acc.detected_patterns && acc.detected_patterns.map((pattern, pIdx) => {
                    const label = typeof pattern === 'string' ? pattern : (pattern.ring_id || pattern.type || 'Unknown');
                    return (
                      <span key={pIdx} style={{ 
                        background: '#f1f5f9', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        marginRight: '4px',
                        display: 'inline-block',
                        color: '#475569',
                        fontWeight: 500
                      }}>
                        {label}
                      </span>
                    );
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal" onClick={e => e.stopPropagation()}>
        <div className="history-modal-header">
          <h2 className="history-modal-title">Analysis Details</h2>
          <button className="history-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="history-modal-loading">
            <Activity className="spin" size={32} />
            <p>Loading full report details...</p>
          </div>
        ) : error ? (
          <div className="history-modal-loading" style={{ color: '#ef4444' }}>
            <AlertTriangle size={32} />
            <p>{error}</p>
          </div>
        ) : (
          <div className="history-modal-body custom-scrollbar">
            <div className="history-section">
              <h3 className="history-section-title">Detected Fraud Rings</h3>
              {renderRings()}
            </div>
            
            <div className="history-section">
              <h3 className="history-section-title">Suspicious Accounts</h3>
              {renderAccounts()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDetailsModal;
