import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import '../styles/Pricing.css';
import '../../home/styles/Home.css'; // Import Home css for nav and footer styling
import { submitPricingRequest } from '../services/pricing.api';

const Pricing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessEmail: '',
    jobTitle: '',
    phoneNumber: '',
    websiteUrl: '',
    transactionsPerMonth: '',
    message: '',
    country: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submitPricingRequest(formData);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        businessEmail: '',
        jobTitle: '',
        phoneNumber: '',
        websiteUrl: '',
        transactionsPerMonth: '',
        message: '',
        country: '',
      });
    } catch (err) {
      setError(err.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page" style={{ backgroundColor: '#f1f3f8', backgroundImage: 'none', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar specific to Landing Page */}
      <header className="landing-nav" style={{ position: 'relative', backgroundColor: 'transparent', width: '100%' }}>
        <div className="landing-nav__logo" onClick={() => navigate('/')}>
          <Network size={28} strokeWidth={2.5} className="landing-nav__logo-icon" />
          <span>GraphSentinel</span>
        </div>
        <nav className="landing-nav__links">
          <a href="/#features" onClick={() => navigate('/')}>Features</a>
          <a href="/#how-it-works" onClick={() => navigate('/')}>How it works</a>
          <a href="/pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>Pricing</a>
        </nav>
        <div className="landing-nav__actions">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Log in</a>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>
            Get Started
          </button>
        </div>
      </header>

      <div className="pricing-container" style={{ flex: 1 }}>
        <div className="pricing-content">
          <div className="pricing-text-section">
            <h1>
              Contact us so we can<br />
              guide you through our<br />
              pricing.
            </h1>
            <p>
              Let us know how many transactions your company processes per month, and we'll get back to you with the pricing that applies to your case.
            </p>
          </div>

          <div className="pricing-form-section">
            {success && <div className="submit-success">Thank you! Your inquiry has been submitted.</div>}
            {error && <div className="submit-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="pricing-input-group">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First name*"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="pricing-input-group">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last name*"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="pricing-input-group">
                <input
                  type="email"
                  name="businessEmail"
                  placeholder="Business Email*"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="pricing-input-group">
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="Job title*"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="pricing-input-group">
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="pricing-input-group">
                <input
                  type="url"
                  name="websiteUrl"
                  placeholder="Company Website URL"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                />
              </div>
              <div className="pricing-input-group">
                <input
                  type="text"
                  name="transactionsPerMonth"
                  placeholder="Transactions per month"
                  value={formData.transactionsPerMonth}
                  onChange={handleChange}
                />
              </div>
              <div className="pricing-input-group">
                <textarea
                  name="message"
                  placeholder="Message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="1"
                ></textarea>
              </div>
              <div className="pricing-input-group">
                <input
                  type="text"
                  name="country"
                  placeholder="Country/Region"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="pricing-submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
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

export default Pricing;
