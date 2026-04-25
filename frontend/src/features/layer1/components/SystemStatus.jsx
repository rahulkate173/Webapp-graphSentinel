import React from 'react';
import { Activity, CheckCircle2, Server } from 'lucide-react';
import '../styles/system-status.css';

const SystemStatus = () => {
  return (
    <div className="system-status">
      <div className="system-status__header">
        <Server size={18} className="system-status__icon" />
        <h3 className="system-status__title">System Readiness</h3>
      </div>
      
      <div className="system-status__grid">
        <div className="system-status__card">
          <div className="system-status__card-icon status-green">
            <CheckCircle2 size={18} />
          </div>
          <div className="system-status__card-content">
            <span className="system-status__card-label">Graph Database</span>
            <span className="system-status__card-value">Connected & Online</span>
          </div>
        </div>

        <div className="system-status__card">
          <div className="system-status__card-icon status-blue">
            <Activity size={18} />
          </div>
          <div className="system-status__card-content">
            <span className="system-status__card-label">Fraud Models (AI)</span>
            <span className="system-status__card-value">Loaded — Awaiting CSV Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
