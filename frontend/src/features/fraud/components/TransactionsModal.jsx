import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TransactionsModal = ({ data, onClose }) => {
  const { ring, transactions = [] } = data;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Transactions for Ring: ${ring.ring_id}`, 14, 20);
    
    const tableData = transactions.map(tx => [
      tx.transaction_id,
      tx.sender_id,
      tx.receiver_id,
      `$${tx.amount.toLocaleString()}`,
      tx.timestamp
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Transaction ID', 'Sender', 'Receiver', 'Amount', 'Timestamp']],
      body: tableData,
    });
    
    doc.save(`${ring.ring_id}_transactions.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="fraud-modal p-modal lg">
        <div className="modal-header">
          <h2>Ring Transactions - {ring.ring_id}</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="modal-body">
          <p>Total transactions captured in this cluster: {transactions.length}</p>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.transaction_id}</td>
                    <td>{tx.sender_id}</td>
                    <td>{tx.receiver_id}</td>
                    <td className="amount-col">${tx.amount.toLocaleString()}</td>
                    <td>{tx.timestamp}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5">No detailed transaction data available for this ring.</td></tr>
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

export default TransactionsModal;
