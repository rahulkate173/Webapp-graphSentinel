import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Network } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();

  // Refs for elements to animate
  const navRef = useRef(null);
  const heroLeftRef = useRef(null);
  const heroImageRef = useRef(null);
  const challengeTextRef = useRef(null);
  const featureRefs = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      // 1. Navbar Mount Animation
      gsap.from(".landing-nav > *", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.2
      });

      // 2. Hero Section Mount Animation
      const heroTl = gsap.timeline({ delay: 0.5 });
      heroTl.from(".hero__text > *", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      })
      .from(".hero__image img", {
        x: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
      }, "-=0.6");

      // 3. Challenge Section Scroll Animation (Slide in from left)
      gsap.from(".challenge-grid__text", {
        scrollTrigger: {
          trigger: ".challenge-grid__text",
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        x: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });

      // 3.5 Challenge Section Image Scroll Animation (Slide in from right)
      gsap.from(".challenge-grid__image", {
        scrollTrigger: {
          trigger: ".challenge-section",
          start: "top 80%",
          toggleActions: "play none none reverse"
        },
        x: 100,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
      });
      // 4. Feature Cards Scroll Animation
      const featureCards = gsap.utils.toArray('.feature-card');
      featureCards.forEach((feature) => {
        const textElement = feature.querySelector('.feature-card__text');
        const imageElement = feature.querySelector('.feature-card__image');

        if (textElement) {
          gsap.from(textElement, {
            scrollTrigger: {
              trigger: feature,
              start: "top 80%",
              toggleActions: "play none none reverse"
            },
            x: -100,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
          });
        }

        if (imageElement) {
          gsap.from(imageElement, {
            scrollTrigger: {
              trigger: feature,
              start: "top 80%",
              toggleActions: "play none none reverse"
            },
            x: 100,
            opacity: 0,
            duration: 1,
            delay: 0.3,
            ease: "power3.out"
          });
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing-page">
      {/* Navbar */}
      <div className="navbar-wrapper">
        <header className="landing-nav" ref={navRef}>
          <div className="landing-nav__logo" onClick={() => navigate('/')}>
            <Network size={24} strokeWidth={2.5} className="landing-nav__logo-icon" />
            <span>GraphSentinel</span>
          </div>
          <nav className="landing-nav__links">
            <a href="#features" data-hover="Features"><span>Features</span></a>
            <a href="#docs" data-hover="Docs"><span>Docs</span></a>
            <a href="/pricing" data-hover="Pricing" onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}><span>Pricing</span></a>
          </nav>
          <div className="landing-nav__actions">
            <button className="btn btn-login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Log in</button>
            <a href="https://github.com/Darshan-01-DS/sutra" target="_blank" rel="noopener noreferrer" className="btn btn-github">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
          </div>
        </header>
      </div>


      <section className="hero">
        <div className="hero__container container">
          <div className="hero__text" ref={heroLeftRef}>
            <h1 className="hero__title">
              <span className="hero-title-main">Money Mule</span>
              <span className="hero-title-highlight">Detection</span>
            </h1>
            <p className="hero__subtitle">
              Protect your institution with our comprehensive anti-money mule solution. Transform complex data into actionable insights and spot irregular behavior as it happens.
            </p>
            <div className="hero__cta">
              <button className="btn btn-hero-cta" onClick={() => navigate('/register')}>
                Get Started
              </button>
            </div>
          </div>
          <div className="hero__image" ref={heroImageRef}>
            <img src="/1st.png" alt="GraphSentinel Money Mule Engine" />
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="challenge-section">
        <div className="container challenge-grid">
          <div className="challenge-grid__image">
            <img src="/chain-break.png" alt="A Critical Challenge" />
          </div>
          <div className="challenge-grid__text" ref={challengeTextRef}>
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
          <h2 className="section-title text-center" style={{ marginBottom: '120px' }}>How can GraphSentinel help?</h2>

          <div className="feature-grid">
            {/* Feature 1 */}
            <div className="feature-card" ref={el => featureRefs.current[0] = el}>
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

            {/* Feature 2 (Text Left, Image Right in screenshots!) */}
            <div className="feature-card" ref={el => featureRefs.current[1] = el}>
              <div className="feature-card__text">
                <h3>Deep Insights through Big Data and AI</h3>
                <p>
                  Proprietary AI models analyze massive volumes of transaction logs, customer profiles, and device telemetry to map interconnected fraud rings in high-fidelity.
                </p>
              </div>
              <div className="feature-card__image">
                <img src="https://cdn.prod.website-files.com/5f4fdbbf5df1414c678dd4f7/64f485396ef461a95eb650e0_deep-insights.svg" alt="Big Data and AI" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-card" ref={el => featureRefs.current[2] = el}>
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

      {/* Footer (Armor.shop dark style) */}
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

export default Home;
