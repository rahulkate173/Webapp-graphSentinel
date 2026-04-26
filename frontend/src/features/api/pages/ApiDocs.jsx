import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Key, Code, Shield, Server, Copy, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import '../styles/ApiDocs.css';

const ApiDocs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="api-docs-page">
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

      <div className="api-docs-layout">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <button className="docs-back-btn" onClick={() => navigate('/docs')}>
            <ArrowLeft size={16} /> Back to Docs
          </button>
          <h3 className="docs-sidebar__title">API Reference</h3>
          <nav className="docs-sidebar__nav">
            <a href="#overview" className="docs-sidebar__link"><BookOpen size={16} /><span>Overview</span></a>
            <a href="#api-key" className="docs-sidebar__link"><Key size={16} /><span>Get Your API Key</span></a>
            <a href="#authentication" className="docs-sidebar__link"><Shield size={16} /><span>Authentication</span></a>
            <a href="#base-url" className="docs-sidebar__link"><Server size={16} /><span>Base URL</span></a>
            <a href="#endpoints" className="docs-sidebar__link"><Code size={16} /><span>Endpoints</span></a>
            <a href="#health" className="docs-sidebar__link docs-sidebar__link--indent"><span>GET /health</span></a>
            <a href="#predict" className="docs-sidebar__link docs-sidebar__link--indent"><span>POST /predict</span></a>
            <a href="#predict-explainable" className="docs-sidebar__link docs-sidebar__link--indent"><span>POST /predict_explainable</span></a>
            <a href="#errors" className="docs-sidebar__link"><Shield size={16} /><span>Error Codes</span></a>
            <a href="#rate-limits" className="docs-sidebar__link"><Server size={16} /><span>Rate Limits</span></a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="docs-content">
          <div className="docs-hero">
            <h1>API Documentation</h1>
            <p>Integrate GraphSentinel's money mule detection engine into your own applications and workflows via our RESTful API.</p>
          </div>

          <section id="overview" className="docs-section">
            <h2><BookOpen size={24} /> Overview</h2>
            <p>
              The GraphSentinel API provides programmatic access to our EdgeGAT-based fraud detection engine. 
              You can submit transaction and account data, run analyses, and retrieve detailed results including 
              suspicious accounts, fraud rings, and AI-generated explanations.
            </p>
            <div className="docs-info-card">
              <h4>REST API</h4>
              <p>All API endpoints follow RESTful conventions. Requests and responses use JSON format. File uploads are handled via Cloudinary URLs.</p>
            </div>
          </section>

          <section id="api-key" className="docs-section api-key-section">
            <h2><Key size={24} /> Get Your API Key</h2>
            <p>
              To use the GraphSentinel API, you need an API key for authentication. Follow these steps to obtain your key:
            </p>
            <ol className="docs-steps">
              <li>
                <div className="docs-step-number">1</div>
                <div className="docs-step-content">
                  <h4>Create an Account</h4>
                  <p>If you haven't already, <a href="/register" className="docs-inline-link">register for an account</a> on GraphSentinel.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">2</div>
                <div className="docs-step-content">
                  <h4>Log In to Dashboard</h4>
                  <p>Sign in to your account and navigate to the main Dashboard.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">3</div>
                <div className="docs-step-content">
                  <h4>Navigate to API Docs</h4>
                  <p>In the left sidebar, click on <strong>"API Docs"</strong> to access the API documentation and key management page.</p>
                </div>
              </li>
              <li>
                <div className="docs-step-number">4</div>
                <div className="docs-step-content">
                  <h4>Generate API Key</h4>
                  <p>Click <strong>"Generate API Key"</strong> to create a new key. Copy and store it securely — it will only be shown once.</p>
                </div>
              </li>
            </ol>
            <div className="docs-info-card docs-info-card--warning">
              <h4>⚠️ Keep Your Key Secure</h4>
              <p>Never share your API key publicly or commit it to version control. Use environment variables to store it in your applications.</p>
            </div>
          </section>

          <section id="authentication" className="docs-section">
            <h2><Shield size={24} /> Authentication</h2>
            <p>
              All API requests must include your API key in the request headers:
            </p>
            <div className="docs-code-block">
              <div className="docs-code-header">
                <span>Header</span>
                <button className="docs-copy-btn" onClick={() => handleCopy('Authorization: Bearer YOUR_API_KEY')}>
                  <Copy size={14} /> Copy
                </button>
              </div>
              <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
            </div>
            <p>Replace <code>YOUR_API_KEY</code> with the key obtained from your dashboard.</p>
          </section>

          <section id="base-url" className="docs-section">
            <h2><Server size={24} /> Base URL</h2>
            <p>All API requests should be made to the following base URL:</p>
            <div className="docs-code-block">
              <div className="docs-code-header">
                <span>Base URL</span>
                <button className="docs-copy-btn" onClick={() => handleCopy('https://api.graphsentinel.com/v1')}>
                  <Copy size={14} /> Copy
                </button>
              </div>
              <pre><code>https://api.graphsentinel.com/v1</code></pre>
            </div>
          </section>

          <section id="endpoints" className="docs-section">
            <h2><Code size={24} /> Endpoints</h2>

            <div id="health" className="api-endpoint">
              <div className="api-endpoint-header">
                <span className="api-method api-method--get">GET</span>
                <code className="api-path">/health</code>
              </div>
              <p>Check the health status of the API server and model availability.</p>
              <h4>Response</h4>
              <div className="docs-code-block">
                <div className="docs-code-header"><span>200 OK</span></div>
                <pre><code>{`{
  "status": "healthy",
  "model_loaded": true,
  "version": "1.0.0"
}`}</code></pre>
              </div>
            </div>

            <div id="predict" className="api-endpoint">
              <div className="api-endpoint-header">
                <span className="api-method api-method--post">POST</span>
                <code className="api-path">/predict</code>
              </div>
              <p>Submit transaction and account data for fraud ring detection analysis.</p>
              
              <h4>Request Body</h4>
              <div className="docs-code-block">
                <div className="docs-code-header">
                  <span>JSON</span>
                  <button className="docs-copy-btn" onClick={() => handleCopy('{\n  "transaction_csv_url": "https://res.cloudinary.com/.../transactions.csv",\n  "account_csv_url": "https://res.cloudinary.com/.../accounts.csv"\n}')}>
                    <Copy size={14} /> Copy
                  </button>
                </div>
                <pre><code>{`{
  "transaction_csv_url": "https://res.cloudinary.com/.../transactions.csv",
  "account_csv_url": "https://res.cloudinary.com/.../accounts.csv"
}`}</code></pre>
              </div>

              <h4>Parameters</h4>
              <div className="docs-table-wrapper">
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>transaction_csv_url</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>Cloudinary URL to the transactions CSV file</td>
                    </tr>
                    <tr>
                      <td><code>account_csv_url</code></td>
                      <td>string</td>
                      <td>Yes</td>
                      <td>Cloudinary URL to the accounts CSV file</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4>Response</h4>
              <div className="docs-code-block">
                <div className="docs-code-header"><span>200 OK</span></div>
                <pre><code>{`{
  "suspicious_accounts": [...],
  "fraud_rings": [...],
  "analysis_summary": {
    "total_accounts": 150,
    "suspicious_count": 12,
    "rings_detected": 3
  }
}`}</code></pre>
              </div>
            </div>

            <div id="predict-explainable" className="api-endpoint">
              <div className="api-endpoint-header">
                <span className="api-method api-method--post">POST</span>
                <code className="api-path">/predict_explainable</code>
              </div>
              <p>Run fraud detection with AI-powered explainability. Returns human-readable risk assessments for each detected fraud ring.</p>
              
              <h4>Request Body</h4>
              <p>Same as <code>/predict</code>. The response additionally includes an <code>explanation</code> field for each fraud ring.</p>

              <h4>Response</h4>
              <div className="docs-code-block">
                <div className="docs-code-header"><span>200 OK</span></div>
                <pre><code>{`{
  "suspicious_accounts": [...],
  "fraud_rings": [
    {
      "ring_id": 1,
      "accounts": [...],
      "explanation": "This ring shows classic layering...",
      "risk_score": 0.92
    }
  ],
  "analysis_summary": { ... }
}`}</code></pre>
              </div>
            </div>
          </section>

          <section id="errors" className="docs-section">
            <h2><Shield size={24} /> Error Codes</h2>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>400</code></td><td>Bad Request</td><td>Invalid request body or missing required fields</td></tr>
                  <tr><td><code>401</code></td><td>Unauthorized</td><td>Missing or invalid API key</td></tr>
                  <tr><td><code>403</code></td><td>Forbidden</td><td>API key does not have access to this resource</td></tr>
                  <tr><td><code>404</code></td><td>Not Found</td><td>Endpoint does not exist</td></tr>
                  <tr><td><code>422</code></td><td>Unprocessable Entity</td><td>CSV data format is invalid</td></tr>
                  <tr><td><code>429</code></td><td>Rate Limited</td><td>Too many requests — slow down</td></tr>
                  <tr><td><code>500</code></td><td>Server Error</td><td>Internal server error — contact support</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="rate-limits" className="docs-section">
            <h2><Server size={24} /> Rate Limits</h2>
            <p>API requests are rate-limited to ensure fair usage:</p>
            <div className="docs-table-wrapper">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Requests / Minute</th>
                    <th>Requests / Day</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Free</td><td>10</td><td>100</td></tr>
                  <tr><td>Pro</td><td>60</td><td>5,000</td></tr>
                  <tr><td>Enterprise</td><td>300</td><td>Unlimited</td></tr>
                </tbody>
              </table>
            </div>
            <div className="docs-info-card">
              <h4>Need More?</h4>
              <p>If your use case requires higher rate limits, contact us at <strong>graphSentinelOffice@gmail.com</strong> to discuss enterprise pricing.</p>
            </div>
          </section>

          <div className="docs-cta-section">
            <h2>Start Building with GraphSentinel</h2>
            <p>Get your API key and start integrating fraud detection into your applications.</p>
            <div className="docs-cta-actions">
              <button className="btn btn-hero-cta" onClick={() => navigate('/register')}>Get API Key</button>
              <button className="btn btn-outline-docs" onClick={() => navigate('/docs')}>View Full Docs</button>
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

export default ApiDocs;
