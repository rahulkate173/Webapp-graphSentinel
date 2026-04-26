import React from 'react';
import Layout from '../../layer1/components/Layout';
import JobMonitorPanel from '../components/JobMonitorPanel';
import { Activity } from 'lucide-react';
import '../styles/JobMonitor.css';

const JobMonitorPage = () => {
  return (
    <Layout>
      <div className="job-monitor-page custom-scrollbar">
        <div className="job-monitor-page__header">
          <div className="job-monitor-page__icon">
            <Activity size={24} strokeWidth={2.5} color="#ff5e5e" />
          </div>
          <div>
            <h1 className="job-monitor-page__title">Real-Time Job Monitor</h1>
            <p className="job-monitor-page__subtitle">
              Track the live status of external API submissions and async fraud analysis jobs.
            </p>
          </div>
        </div>

        <div className="job-monitor-page__content">
          <JobMonitorPanel />
        </div>
      </div>
    </Layout>
  );
};

export default JobMonitorPage;
