import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, BookOpen, LogIn, Upload, Target, FileText, Activity, Clock, ArrowLeft, ChevronRight, Key } from 'lucide-react';
import '../styles/Documentation.css';

const Documentation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
    { id: 'creating-account', title: 'Creating an Account', icon: LogIn },
    { id: 'logging-in', title: 'Logging In', icon: LogIn },
    { id: 'uploading-data', title: 'Uploading Data', icon: Upload },
    { id: 'dashboard-overview', title: 'Dashboard Overview', icon: Activity },
    { id: 'fraud-detection', title: 'Fraud Ring Detection', icon: Target },
    { id: 'job-monitoring', title: 'Job Monitoring', icon: Activity },
    { id: 'analysis-history', title: 'Analysis History', icon: Clock },
    { id: 'sar-reports', title: 'SAR Report Generation', icon: FileText },
    { id: 'api-access', title: 'API Access', icon: Key },
  ];

  return (
    <div className="docs-page">
      {/* Navbar */}
      <div className="navbar-wrapper">
        <header className="landing-nav">
          <div className="landing-nav__logo" onClick={() => navigate('/')}>
            <Network size={24} strokeWidth={2.5} className="landing-nav__logo-icon" />
            <span>GraphSentinel</span>
          </div>
          <nav className="landing-nav__links">
            <a href="/#features" data-hover="Features"><span>Features</span></a>
            <a href="/docs" data-hover="Docs" onClick={(e) => { e.preventDefault(); navigate('/docs'); }}><span>Docs</span></a>
            <a href="/pricing" data-hover="Pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}><span>Pricing</span></a>
          </nav>
          <div className="landing-nav__actions">
            <button className="btn btn-login" onClick={() => navigate('/login')}>Log in</button>
            <a href="https://github.com/rahulkate173/Webapp-graphSentinel" target="_blank" rel="noopener noreferrer" className="btn btn-github">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
          </div>
        </header>
      </div>

      <div className="docs-layout">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <button className="docs-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Home
          </button>
          <h3 className="docs-sidebar__title">Documentation</h3>
          <nav className="docs-sidebar__nav">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <a key={section.id} href={`#${section.id}`} className="docs-sidebar__link">
                  <Icon size={16} />
                  <span>{section.title}</span>
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="docs-content">
          <div className="docs-hero">
            <h1>GraphSentinel Documentation</h1>
            <p>Complete guide to using GraphSentinel's Money Mule Detection platform. Learn how to set up your account, upload data, and detect fraud rings.</p>
          </div>

          <section id="getting-started" className="docs-section">
            <h2><BookOpen size={24} /> Getting Started</h2>
            <p>
              GraphSentinel is an AI-powered anti-money laundering platform that uses Graph Neural Networks (GNN) 
              and Edge Graph Attention Networks (EdgeGAT) to detect money mule networks in financial transaction data.
            </p>
            <div className="docs-info-card">
              <h4>What is a Money Mule?</h4>
              <p>
                A money mule is a person who transfers illegally acquired money on behalf of others. They are 
                recruited by criminals to help launder proceeds from fraud, drug trafficking, and other crimes. 
                GraphSentinel identifies these networks by analyzing transaction patterns and relationships.
              </p>
            </div>
            <h3>Platform Overview</h3>
            <ul>
              <li><strong>Upload:</strong> Submit your transaction and account data files.</li>
              <li><strong>Analyze:</strong> Our AI engine builds a transaction graph and runs inference.</li>
              <li><strong>Detect:</strong> Suspicious accounts and fraud rings are identified automatically.</li>
              <li><strong>Report:</strong> Generate Suspicious Activity Reports (SARs) for compliance teams.</li>
            </ul>
          </section>

          <section id="creating-account" className="docs-section">
            <h2><LogIn size={24} /> Creating an Account</h2>
            <p>To start using GraphSentinel, you first need to create an account:</p>
            <ol className="docs-steps">
              <li>
                <div className="docs-step-number">1</div>
                <div className="docs-step-content">
                  <h4>Navigate to Registration</h4>
                  <p>Click the <strong>"Get Started"</strong> button on the homepage, or go directly to <code>/register</code>.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">2</div>
                <div className="docs-step-content">
                  <h4>Fill in Your Details</h4>
                  <p>Enter your full name, email address, and choose a secure password. Your password should be at least 8 characters long.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">3</div>
                <div className="docs-step-content">
                  <h4>Submit Registration</h4>
                  <p>Click <strong>"Register"</strong> to create your account. You will be redirected to the login page upon success.</p>
                </div>
              </li>
            </ol>
          </section>

          <section id="logging-in" className="docs-section">
            <h2><LogIn size={24} /> Logging In</h2>
            <p>Once you have an account, you can log in to access the dashboard:</p>
            <ol className="docs-steps">
              <li>
                <div className="docs-step-number">1</div>
                <div className="docs-step-content">
                  <h4>Go to Login Page</h4>
                  <p>Click <strong>"Log in"</strong> in the top navigation bar, or navigate directly to <code>/login</code>.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">2</div>
                <div className="docs-step-content">
                  <h4>Enter Credentials</h4>
                  <p>Type in your registered email address and password.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">3</div>
                <div className="docs-step-content">
                  <h4>Access Dashboard</h4>
                  <p>Upon successful authentication, you will be redirected to the main <strong>Dashboard</strong> where you can begin analyzing transaction data.</p>
                </div>
              </li>
            </ol>
            <div className="docs-info-card docs-info-card--warning">
              <h4>⚠️ Session Expiry</h4>
              <p>Your session token will expire after a period of inactivity. You will be automatically redirected to the login page if this happens.</p>
            </div>
          </section>

          <section id="uploading-data" className="docs-section">
            <h2><Upload size={24} /> Uploading Data</h2>
            <p>GraphSentinel requires two CSV files for analysis:</p>

            <h3>1. Transaction Data CSV</h3>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Description</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Timestamp</td><td>Date/time of transaction</td><td>2024-01-15 14:30:00</td></tr>
                  <tr><td>From Bank</td><td>Sending bank identifier</td><td>BANK_A</td></tr>
                  <tr><td>Account (From)</td><td>Sender account number</td><td>ACC_001</td></tr>
                  <tr><td>To Bank</td><td>Receiving bank identifier</td><td>BANK_B</td></tr>
                  <tr><td>Account (To)</td><td>Receiver account number</td><td>ACC_002</td></tr>
                  <tr><td>Amount Received</td><td>Amount received</td><td>5000.00</td></tr>
                  <tr><td>Receiving Currency</td><td>Currency of received amount</td><td>USD</td></tr>
                  <tr><td>Amount Paid</td><td>Amount paid</td><td>4950.00</td></tr>
                  <tr><td>Payment Currency</td><td>Currency of payment</td><td>USD</td></tr>
                  <tr><td>Payment Format</td><td>Transfer method</td><td>Wire</td></tr>
                </tbody>
              </table>
            </div>

            <h3>2. Account Data CSV</h3>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Description</th>
                    <th>Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Bank ID</td><td>Bank identifier</td><td>BANK_A</td></tr>
                  <tr><td>Account Number</td><td>Unique account number</td><td>ACC_001</td></tr>
                  <tr><td>Entity ID</td><td>Entity identifier</td><td>ENT_001</td></tr>
                  <tr><td>Entity Name</td><td>Account holder name</td><td>John Doe</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Upload Steps</h3>
            <ol className="docs-steps">
              <li>
                <div className="docs-step-number">1</div>
                <div className="docs-step-content">
                  <h4>Navigate to Upload</h4>
                  <p>From the sidebar, click <strong>"Upload"</strong> to access the file ingestion page.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">2</div>
                <div className="docs-step-content">
                  <h4>Select Files</h4>
                  <p>Drag and drop your CSV files or click to browse. Upload both the transaction file and account file.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">3</div>
                <div className="docs-step-content">
                  <h4>Submit for Analysis</h4>
                  <p>Click <strong>"Run Analysis"</strong> to submit your data. The system will process and return results.</p>
                </div>
              </li>
            </ol>
          </section>

          <section id="dashboard-overview" className="docs-section">
            <h2><Activity size={24} /> Dashboard Overview</h2>
            <p>
              The Dashboard provides a comprehensive overview of your latest analysis results, including:
            </p>
            <ul>
              <li><strong>Summary Statistics:</strong> Total accounts analyzed, suspicious accounts found, and fraud rings detected.</li>
              <li><strong>Risk Distribution:</strong> Visual breakdown of accounts by risk level (High, Medium, Low).</li>
              <li><strong>Recent Activity:</strong> Timeline of your most recent analysis jobs and their statuses.</li>
              <li><strong>Quick Actions:</strong> One-click access to upload new data, view fraud rings, or generate reports.</li>
            </ul>
          </section>

          <section id="fraud-detection" className="docs-section">
            <h2><Target size={24} /> Fraud Ring Detection</h2>
            <p>
              The Fraud Rings page provides an interactive visualization of detected money mule networks.
            </p>
            <h3>Key Features</h3>
            <ul>
              <li><strong>Network Graph:</strong> Interactive graph visualization showing account relationships and fund flows.</li>
              <li><strong>AI Explainability:</strong> Each fraud ring includes an AI-generated explanation of why it was flagged.</li>
              <li><strong>Risk Scores:</strong> Individual risk scores for each account in the detected ring.</li>
              <li><strong>Transaction Flow:</strong> Detailed view of how money flows through the network.</li>
            </ul>
          </section>

          <section id="job-monitoring" className="docs-section">
            <h2><Activity size={24} /> Job Monitoring</h2>
            <p>
              Track all your analysis jobs in real-time from the Jobs page:
            </p>
            <ul>
              <li><strong>Live Status:</strong> Real-time updates via WebSocket connections.</li>
              <li><strong>Job Queue:</strong> View pending, running, and completed jobs.</li>
              <li><strong>Error Handling:</strong> Detailed error messages if a job fails.</li>
            </ul>
          </section>

          <section id="analysis-history" className="docs-section">
            <h2><Clock size={24} /> Analysis History</h2>
            <p>
              View a complete history of all analyses performed on your account:
            </p>
            <ul>
              <li>Date and time of each analysis run.</li>
              <li>Number of accounts and transactions processed.</li>
              <li>Summary of results including detected fraud rings.</li>
              <li>Ability to re-view past results.</li>
            </ul>
          </section>

          <section id="sar-reports" className="docs-section">
            <h2><FileText size={24} /> SAR Report Generation</h2>
            <p>
              Generate professional Suspicious Activity Reports (SARs) directly from your analysis results:
            </p>
            <ol className="docs-steps">
              <li>
                <div className="docs-step-number">1</div>
                <div className="docs-step-content">
                  <h4>Navigate to SAR Report</h4>
                  <p>Click <strong>"SAR Report"</strong> in the sidebar after running an analysis.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">2</div>
                <div className="docs-step-content">
                  <h4>Review & Customize</h4>
                  <p>Review the auto-generated report content. Add notes or customize details as needed.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">3</div>
                <div className="docs-step-content">
                  <h4>Download PDF</h4>
                  <p>Generate and download a professionally formatted PDF report ready for compliance submission.</p>
                </div>
              </li>
            </ol>
          </section>

          <section id="api-access" className="docs-section">
            <h2><Key size={24} /> API Access</h2>
            <p>
              GraphSentinel provides a RESTful API for programmatic access to our fraud detection engine. 
              For complete API documentation including endpoint references and authentication, visit our 
              dedicated <Link to="/api-docs" className="docs-inline-link">API Documentation <ChevronRight size={14} /></Link> page.
            </p>
            <div className="docs-info-card">
              <h4>Quick API Overview</h4>
              <p>
                The API allows you to submit transaction data, run analyses, and retrieve results programmatically. 
                You'll need an API key to authenticate your requests. Visit the API Documentation page accessible from the sidebar 
                within the dashboard to learn how to obtain your key.
              </p>
            </div>
          </section>

          <div className="docs-cta-section">
            <h2>Ready to Get Started?</h2>
            <p>Create your account and start detecting money mule networks today.</p>
            <div className="docs-cta-actions">
              <button className="btn btn-hero-cta" onClick={() => navigate('/register')}>Create Account</button>
              <button className="btn btn-outline-docs" onClick={() => navigate('/login')}>Log In</button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer armor-footer">
        <div className="container armor-footer-container">
          <div className="armor-footer-brand-section">
            <div className="armor-footer-logo">
              <Network size={40} strokeWidth={3} className="text-white" />
              <span>GraphSentinel</span>
            </div>
            <p className="armor-footer-mission">
              GraphSentinel builds expressive, design-driven tech for financial institutions, risk teams, and the curious.
            </p>
            <div className="armor-footer-company-info">
              GraphSentinel Inc.<br/>
              Registered Office: Shiv Darshan, Parvati, Pune<br/>
              Email: graphSentinelOffice@gmail.com<br/>
              (Mon-Sat, 11 AM - 7 PM)
            </div>
          </div>
          <div className="armor-footer-links-section">
            <div className="armor-footer-col">
              <h4>products</h4>
              <a href="/#features">money mule detection</a>
              <a href="/api-docs" onClick={(e) => { e.preventDefault(); navigate('/api-docs'); }}>api documentation</a>
            </div>
            <div className="armor-footer-col">
              <h4>company</h4>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>about us</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>contact us</a>
            </div>
            <div className="armor-footer-col">
              <h4>socials</h4>
              <a href="https://github.com/rahulkate173/Webapp-graphSentinel" target="_blank" rel="noopener noreferrer">github</a>
            </div>
            <div className="armor-footer-col">
              <h4>quick links</h4>
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }}>privacy policy</a>
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>terms of service</a>
            </div>
          </div>
        </div>
        <div className="container armor-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Managed by GraphSentinel Inc. All rights reserved.</p>
          <div className="armor-footer-bottom-links">
            <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }}>Privacy Policy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
