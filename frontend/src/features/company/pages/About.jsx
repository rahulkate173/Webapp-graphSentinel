import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Target, Shield, Brain, Users, Zap } from 'lucide-react';
import '../styles/Company.css';

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="company-page">
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

      <div className="company-content">
        <div className="company-hero">
          <h1>About GraphSentinel</h1>
          <p className="company-hero-sub">
            We're building the future of financial crime detection using cutting-edge Graph Neural Networks and AI explainability.
          </p>
        </div>

        <section className="company-section">
          <h2>Our Mission</h2>
          <p>
            GraphSentinel was founded with a singular mission: to make the global financial system safer by 
            detecting and disrupting money mule networks. We believe that advanced AI, when applied thoughtfully, 
            can empower financial institutions to stay ahead of increasingly sophisticated fraud operations.
          </p>
          <p>
            Our platform transforms complex transaction data into actionable intelligence, enabling compliance 
            teams to identify suspicious activity before it causes harm. We combine Graph Attention Networks (GAT) 
            with AI-powered explainability to provide not just detection, but understanding.
          </p>
        </section>

        <section className="company-section">
          <h2>What We Do</h2>
          <div className="company-values-grid">
            <div className="company-value-card">
              <Target size={32} className="company-value-icon" />
              <h3>Fraud Ring Detection</h3>
              <p>Our EdgeGAT model analyzes transaction graphs to identify interconnected money mule networks with high precision.</p>
            </div>
            <div className="company-value-card">
              <Brain size={32} className="company-value-icon" />
              <h3>AI Explainability</h3>
              <p>Every detection comes with a human-readable explanation, making it easy for compliance teams to understand and act.</p>
            </div>
            <div className="company-value-card">
              <Shield size={32} className="company-value-icon" />
              <h3>Regulatory Compliance</h3>
              <p>Automated SAR report generation helps institutions meet regulatory requirements efficiently.</p>
            </div>
            <div className="company-value-card">
              <Zap size={32} className="company-value-icon" />
              <h3>Real-Time Processing</h3>
              <p>Process thousands of transactions in seconds with our optimized inference pipeline and live job monitoring.</p>
            </div>
          </div>
        </section>

        <section className="company-section">
          <h2>Our Technology</h2>
          <p>
            At the core of GraphSentinel is an Edge Graph Attention Network (EdgeGAT) — a state-of-the-art 
            graph neural network architecture specifically designed for transaction-level fraud detection. 
            Unlike traditional rule-based systems, our model learns complex patterns from data, adapting 
            to new fraud typologies as they emerge.
          </p>
          <p>
            Our technology stack includes:
          </p>
          <ul>
            <li><strong>EdgeGAT Model:</strong> Custom graph neural network for transaction graph analysis</li>
            <li><strong>AI Explainability Engine:</strong> LLM-powered explanations for fraud ring detections</li>
            <li><strong>Real-Time Processing:</strong> WebSocket-based job monitoring for live analysis tracking</li>
            <li><strong>RESTful API:</strong> Full-featured API for programmatic integration</li>
            <li><strong>SAR Generator:</strong> Automated Suspicious Activity Report creation</li>
          </ul>
        </section>

        <section className="company-section company-cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join financial institutions worldwide using GraphSentinel to fight financial crime.</p>
          <div className="company-cta-actions">
            <button className="btn btn-hero-cta" onClick={() => navigate('/register')}>Get Started</button>
            <button className="btn btn-outline-company" onClick={() => navigate('/contact')}>Contact Us</button>
          </div>
        </section>
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

export default About;
