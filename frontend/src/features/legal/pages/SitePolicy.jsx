import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Shield } from 'lucide-react';
import '../styles/Legal.css';

const SitePolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
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

      <div className="legal-content">
        <div className="legal-header">
          <Shield size={40} className="legal-header-icon" />
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last Updated: April 26, 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              GraphSentinel Inc. ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our GraphSentinel 
              platform ("Service"), including our website, dashboard, and API.
            </p>
            <p>
              By accessing or using our Service, you agree to the collection and use of information in accordance 
              with this Privacy Policy. If you do not agree with the terms of this policy, please do not access the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>When you register for an account, we may collect:</p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Organization name (if applicable)</li>
              <li>Password (stored in encrypted form)</li>
            </ul>

            <h3>2.2 Transaction Data</h3>
            <p>
              When you upload data for analysis, we process transaction and account CSV files. This data is used 
              solely for the purpose of fraud detection analysis and is not shared with third parties.
            </p>

            <h3>2.3 Usage Data</h3>
            <p>We automatically collect certain information when you use our Service, including:</p>
            <ul>
              <li>IP address and browser type</li>
              <li>Pages visited and time spent on pages</li>
              <li>API usage metrics and request logs</li>
              <li>Device and operating system information</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our Service</li>
              <li>Process and analyze your uploaded transaction data for fraud detection</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Send you important updates about the Service</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information and uploaded data. 
              This includes encryption of data in transit (TLS/SSL) and at rest, regular security audits, 
              and access controls. However, no method of transmission over the Internet is 100% secure, and we 
              cannot guarantee absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide 
              you services. Uploaded transaction data is retained for a maximum of 90 days after analysis, after 
              which it is permanently deleted. You may request deletion of your data at any time by contacting us.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> We may share data with trusted third-party services that assist in operating our platform (e.g., cloud hosting providers).</li>
              <li><strong>Legal Requirements:</strong> We may disclose data if required by law, court order, or governmental regulation.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access, update, or delete your personal information</li>
              <li>Request a copy of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Object to the processing of your personal data</li>
              <li>File a complaint with a data protection authority</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our Service and hold certain 
              information. Cookies are used for authentication, security, and analytics purposes. You can instruct 
              your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Our Service is not intended for use by anyone under the age of 18. We do not knowingly collect 
              personally identifiable information from children. If we discover that a child has provided us 
              with personal information, we will delete it immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review 
              this page periodically for any changes.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> graphSentinelOffice@gmail.com</li>
              <li><strong>Address:</strong> Shiv Darshan, Parvati, Pune</li>
            </ul>
          </section>
        </div>
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

export default SitePolicy;
