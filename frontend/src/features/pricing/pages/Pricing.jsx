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
      {/* Navbar */}
      <div className="navbar-wrapper">
        <header className="landing-nav">
          <div className="landing-nav__logo" onClick={() => navigate('/')}>
            <Network size={24} strokeWidth={2.5} className="landing-nav__logo-icon" />
            <span>GraphSentinel</span>
          </div>
          <nav className="landing-nav__links">
            <a href="/#features" data-hover="Features" onClick={() => navigate('/')}><span>Features</span></a>
            <a href="/#how-it-works" data-hover="How it works" onClick={() => navigate('/')}><span>How it works</span></a>
            <a href="/pricing" data-hover="Pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}><span>Pricing</span></a>
          </nav>
          <div className="landing-nav__actions">
            <button className="btn btn-login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Log in</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </header>
      </div>

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

      {/* Footer (Armor.shop dark style) */}
      <footer className="footer armor-footer" style={{ marginTop: 'auto' }}>
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
              Registered Office: 39, Shivkrupa, Swami Vivekanand Society, Pune, Maharashtra 411009, India<br/>
              Contact: +91 9511631215 | Email: graphsential@gmail.com<br/>
              (Mon-Sat, 11 AM - 7 PM)
            </div>
          </div>

          <div className="armor-footer-links-section">
            <div className="armor-footer-col">
              <h4>products</h4>
              <a href="#">card payment fraud</a>
              <a href="#">merchant initiated fraud</a>
              <a href="#">money mule detection</a>
              <a href="#">api documentation</a>
            </div>
            
            <div className="armor-footer-col">
              <h4>company</h4>
              <a href="#">about us</a>
              <a href="#">careers</a>
              <a href="#">contact us</a>
              <a href="#">blog</a>
            </div>

            <div className="armor-footer-col">
              <h4>socials</h4>
              <a href="#">instagram</a>
              <a href="#">youtube</a>
              <a href="#">linkedin</a>
              <a href="#">github</a>
            </div>

            <div className="armor-footer-col">
              <h4>quick links</h4>
              <a href="#">privacy policy</a>
              <a href="#">terms of service</a>
              <a href="#">help center</a>
              <a href="#">community</a>
            </div>
          </div>
          
        </div>
        
        <div className="container armor-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Managed by GraphSentinel Inc. All rights reserved.</p>
          <div className="armor-footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
