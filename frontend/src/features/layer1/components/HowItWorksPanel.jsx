import React from 'react';
import { Sparkles, Database, BrainCircuit, Network, BarChart3 } from 'lucide-react';

const HowItWorksPanel = () => {
  return (
    <div className="how-it-works">
      <div className="how-it-works__header">
        <Sparkles className="how-it-works__icon" size={24} />
        <h2 className="how-it-works__title">How it works</h2>
      </div>

      <div className="how-it-works__steps">
        {/* Step 1 */}
        <div className="how-it-works__step">
          <div className="how-it-works__step-number">1</div>
          <div className="how-it-works__step-content">
            <h3 className="how-it-works__step-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#2563eb" /> Data Ingestion
            </h3>
            <p className="how-it-works__step-description">
              Upload your raw CSV files securely. Our processing engine ingests transaction logs, trims out noise, and automatically standardizes timestamps, sender IDs, and recipient profiles for seamless analysis.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="how-it-works__step">
          <div className="how-it-works__step-number">2</div>
          <div className="how-it-works__step-content">
            <h3 className="how-it-works__step-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrainCircuit size={18} color="#d97706" /> ML Anomaly Detection
            </h3>
            <p className="how-it-works__step-description">
              Proprietary AI and Machine Learning models scan the dataset to flag anomalies. It actively searches for suspicious behaviour like rapid account-to-account movements, layered transfers, and typical smurfing patterns.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="how-it-works__step">
          <div className="how-it-works__step-number">3</div>
          <div className="how-it-works__step-content">
            <h3 className="how-it-works__step-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Network size={18} color="#16a34a" /> Graph Construction
            </h3>
            <p className="how-it-works__step-description">
              Suspect accounts are linked to map out massive fraud ecosystems. We trace multi-hop connections and calculate node-dependency scores to visualize the entire financial supply chain of illicit operations.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="how-it-works__step">
          <div className="how-it-works__step-number">4</div>
          <div className="how-it-works__step-content">
            <h3 className="how-it-works__step-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#d32f2f" /> Actionable Insights
            </h3>
            <p className="how-it-works__step-description">
              Review flagged clusters in an intuitive dashboard. Easily export threat intelligence reports as PDFs, freeze high-risk nodes, and implement swift countermeasures to disrupt fraud rings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPanel;
