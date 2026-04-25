import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import { Network, Sparkles, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navbar specific to Landing Page */}
      <header className="landing-nav">
        <div className="landing-nav__logo" onClick={() => navigate('/')}>
          <Network size={28} strokeWidth={2.5} className="landing-nav__logo-icon" />
          <span>GraphSentinel</span>
        </div>
        <nav className="landing-nav__links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="/pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>Pricing</a>
        </nav>
        <div className="landing-nav__actions">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Log in</a>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section using bg.png from public folder */}
      <section className="hero">
        <div className="hero__container container">
          <div className="hero__text">
            <h1 className="hero__title">
              <span className="hero-title-main">Money Mule</span>
              <br />
              <span className="hero-title-highlight">Detection</span>
            </h1>
            <p className="hero__subtitle">
              Protect your institution with our comprehensive anti-money mule solution. Transform complex data into actionable insights and spot irregular behavior as it happens.
            </p>
            <div className="hero__cta">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                Get Started
              </button>
            </div>
          </div>
          <div className="hero__image">
            <img src="/1st.png" alt="GraphSentinel Money Mule Engine" />
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="challenge-section">
        <div className="container challenge-grid">
          <div className="challenge-grid__image">
            <img src="/public/chain-break.png" alt="A Critical Challenge" />
          </div>
          <div className="challenge-grid__text">
            <h2 className="section-title">A Critical Challenge for Financial Institutions</h2>
            <p className="section-description">
              Money mules are essential to modern cybercrime and fraud operations. By identifying and neutralizing money mule accounts, you can disrupt the entire illicit financial supply chain. GraphSentinel provides unparalleled visibility into these networks.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title text-center">How can GraphSentinel help?</h2>

          <div className="feature-grid">
            {/* Feature 1 (Image Right) */}
            <div className="feature-card">
              <div className="feature-card__text">
                <h3>Spot Irregular Behaviour As It Happens</h3>
                <p>
                  Our engine instantly flags layering transfers, smurfing patterns, and rapid account-to-account movements indicative of mule networks.
                </p>
              </div>
              <div className="feature-card__image">
                <img src="https://cdn.prod.website-files.com/5f4fdbbf5df1414c678dd4f7/64f48485f4808529ee0fa1bf_irregular-behaviour.svg" alt="Spot Irregular Behaviour" />
              </div>
            </div>

            {/* Feature 2 (Image Left via CSS reordering or reverse class) */}
            <div className="feature-card" style={{ direction: 'rtl' }}>
              <div className="feature-card__text" style={{ direction: 'ltr' }}>
                <h3>Deep Insights through Big Data and AI</h3>
                <p>
                  Proprietary AI models analyze massive volumes of transaction logs, customer profiles, and device telemetry to map interconnected fraud rings in high-fidelity.
                </p>
              </div>
              <div className="feature-card__image">
                <img src="https://cdn.prod.website-files.com/5f4fdbbf5df1414c678dd4f7/64f485396ef461a95eb650e0_deep-insights.svg" alt="Big Data and AI" />
              </div>
            </div>

            {/* Feature 3 (Image Right) */}
            <div className="feature-card">
              <div className="feature-card__text">
                <h3>Evolving Protection for Evolving Threats</h3>
                <p>
                  Our machine learning pipeline continuously adapts to new mule typologies and evasion tactics, ensuring you stay one step ahead of organized fraud.
                </p>
              </div>
              <div className="feature-card__image">
                <img src="https://cdn.prod.website-files.com/5f4fdbbf5df1414c678dd4f7/64f485604133b5962d4f36fd_evolving-protection.svg" alt="Evolving Protection" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Floating Card Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Defend your institution from money mule activities</h2>
            <p>Schedule a demo today and protect your financial ecosystem.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              <Network size={28} strokeWidth={2.5} />
              <span>GraphSentinel</span>
            </div>
            <p className="footer-desc">Advanced graph-based fraud detection for the modern financial stack.</p>
          </div>
          <div className="footer-col">
            <h4>Products</h4>
            <a href="#">Card Payment Fraud</a>
            <a href="#">Merchant Initiated Fraud</a>
            <a href="#">Money Mule Detection</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About us</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Blog</a>
            <a href="#">Case Studies</a>
            <a href="#">Documentation</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>&copy; {new Date().getFullYear()} GraphSentinel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
