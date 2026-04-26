import React, { useEffect, useState } from 'react';
import Layout from '../../layer1/components/Layout';
import { fetchHistory } from '../services/history.api';
import { Clock, DownloadCloud, AlertTriangle, Search, Activity, CalendarDays, FileText } from 'lucide-react';
import HistoryDetailsModal from '../components/HistoryDetailsModal';
import '../styles/history.css';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory();
        setHistory(data || []);
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="history-page custom-scrollbar">
        <div className="history-header">
          <div className="history-title-group">
            <Clock className="history-header-icon" />
            <div>
              <h1 className="history-title">Analysis History</h1>
              <p className="history-subtitle">Review past ML analyses and transaction reports.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="history-empty">
            <Activity className="spin" size={32} color="#94a3b8" />
            <p>Loading your timeline...</p>
          </div>
        ) : error ? (
          <div className="history-empty error">
            <AlertTriangle size={32} color="#ef4444" />
            <p>{error}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <Search size={32} color="#94a3b8" />
            <p>No past analyses found. Go to the dashboard to scan files.</p>
          </div>
        ) : (
          <div className="history-grid">
            {history.map((record) => (
              <div key={record._id} className="history-card">
                <div className="history-card-header">
                  <div className="history-card-date">
                    <CalendarDays size={16} />
                    <span>{formatDate(record.analyzed_at)}</span>
                  </div>
                  <span className={`history-badge ${record.summary?.fraud_rings_detected > 0 ? 'danger' : 'safe'}`}>
                    {record.summary?.fraud_rings_detected > 0 ? 'High Risk' : 'Clear'}
                  </span>
                </div>
                
                <div className="history-card-body">
                  <div className="history-stat">
                    <span className="history-stat-label">Accounts Analyzed</span>
                    <span className="history-stat-value">{record.summary?.total_accounts_analyzed ?? 0}</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-label">Suspicious Flagged</span>
                    <span className="history-stat-value">{record.summary?.suspicious_accounts_flagged ?? 0}</span>
                  </div>
                  <div className="history-stat">
                    <span className="history-stat-label">Rings Detected</span>
                    <span className="history-stat-value danger">{record.summary?.fraud_rings_detected ?? 0}</span>
                  </div>
                </div>

                <div className="history-card-footer">
                  <button 
                    onClick={() => setSelectedRecordId(record._id)} 
                    className="history-link" 
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <FileText size={16} /> View Full Report
                  </button>
                  <a href={record.transactions_cloudinary_url} target="_blank" rel="noreferrer" className="history-link">
                    <DownloadCloud size={16} /> Transactions CSV
                  </a>
                  <a href={record.accounts_cloudinary_url} target="_blank" rel="noreferrer" className="history-link">
                    <DownloadCloud size={16} /> Accounts CSV
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRecordId && (
        <HistoryDetailsModal 
          recordId={selectedRecordId} 
          onClose={() => setSelectedRecordId(null)} 
        />
      )}
    </Layout>
  );
};

export default HistoryPage;
