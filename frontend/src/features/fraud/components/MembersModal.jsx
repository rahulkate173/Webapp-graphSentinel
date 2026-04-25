import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MembersModal = ({ data, onClose }) => {
  const { ring, members = [] } = data;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Members of Ring: ${ring.ring_id}`, 14, 20);
    
    const tableData = members.map(m => {
      if (typeof m === 'string') return [m, 'N/A', 'N/A'];
      return [
        m.account_id || 'Unknown',
        m.suspicion_score || 'N/A',
        m.detected_patterns ? m.detected_patterns.join(', ') : 'N/A'
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [['Account ID', 'Suspicion Score', 'Detected Patterns']],
      body: tableData,
    });
    
    doc.save(`${ring.ring_id}_members.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="fraud-modal p-modal">
        <div className="modal-header">
          <h2>Member Accounts - {ring.ring_id}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="modal-body">
          <p>This ring consists of {members?.length || 0} member accounts.</p>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Suspicion Score</th>
                  <th>Patterns</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? members.map((m, idx) => {
                  const isString = typeof m === 'string';
                  return (
                    <tr key={idx}>
                      <td>{isString ? m : (m.account_id || 'Unknown')}</td>
                      <td>{isString ? 'N/A' : (m.suspicion_score || 'N/A')}</td>
                      <td>{isString ? 'N/A' : (m.detected_patterns ? m.detected_patterns.join(', ') : 'N/A')}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="3">No member data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary flex-btn" onClick={downloadPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
