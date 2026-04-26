import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, FileText } from 'lucide-react';
import '../styles/Legal.css';

const Terms = () => {
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
          <FileText size={40} className="legal-header-icon" />
          <h1>Terms & Conditions</h1>
          <p className="legal-updated">Last Updated: April 26, 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the GraphSentinel platform ("Service") operated by GraphSentinel Inc. ("we", "us", or "our"), 
              you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, 
              you may not access the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              GraphSentinel provides an AI-powered anti-money laundering platform that uses Graph Neural Networks 
              to detect money mule networks in financial transaction data. The Service includes a web-based dashboard, 
              API access, fraud detection analysis, and report generation tools.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. User Accounts</h2>
            <ul>
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Upload malicious data, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Reverse engineer, decompile, or disassemble any portion of the Service</li>
              <li>Use the Service to process data that you do not have the legal right to process</li>
              <li>Exceed API rate limits or abuse the Service's computational resources</li>
              <li>Resell or redistribute the Service without written authorization</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Data Ownership</h2>
            <p>
              You retain all ownership rights to the data you upload to our Service. By uploading data, 
              you grant us a limited, non-exclusive license to process and analyze that data solely for the 
              purpose of providing the fraud detection service. We do not claim ownership of your data.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. API Usage</h2>
            <ul>
              <li>API keys are issued per user account and must not be shared.</li>
              <li>You must comply with the published rate limits for your subscription tier.</li>
              <li>We reserve the right to revoke API access for violations of these terms.</li>
              <li>API responses are provided "as is" and should be validated by your team before taking action.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Intellectual Property</h2>
            <p>
              The Service, including its original content, features, functionality, machine learning models, 
              and algorithms, is owned by GraphSentinel Inc. and is protected by international copyright, 
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. GraphSentinel Inc. makes no 
              warranties, expressed or implied, regarding the Service's accuracy, reliability, or availability. 
              Our fraud detection results are probabilistic in nature and should not be the sole basis for 
              regulatory or legal action.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall GraphSentinel Inc., its directors, employees, partners, agents, suppliers, 
              or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including but not limited to loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your use of the Service.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless GraphSentinel Inc. and its officers, directors, employees, 
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
              arising from your use of the Service or violation of these terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior 
              notice or liability, for any reason, including breach of these Terms. Upon termination, your 
              right to use the Service will cease immediately. All provisions which should survive termination 
              shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, 
              without regard to its conflict of law provisions. Any disputes arising from these terms 
              shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. Material changes will be 
              notified at least 30 days prior to the new terms taking effect. Continued use of the Service 
              after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Contact Us</h2>
            <p>If you have any questions about these Terms & Conditions, please contact us:</p>
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

export default Terms;
