import React from 'react';
import Layout from './components/Layout';
import UploadZone from './components/UploadZone';
import HowItWorksPanel from './components/HowItWorksPanel';
import SystemStatus from './components/SystemStatus';

const IngestionLayout = () => {

  return (
    <Layout>
      <div className="app-grid">
        <div className="app-grid__column-left">
          {/* UploadZone is self-contained — no props needed */}
          <UploadZone />
          <SystemStatus />
        </div>
        <div className="app-grid__column-right">
          <HowItWorksPanel />
        </div>
      </div>
    </Layout>
  );
};

export default IngestionLayout;

