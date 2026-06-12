import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mailgenLogo from './assets/mailgen-logo.png';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll height to apply active border to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* 🧭 Navbar */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-content">
          <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={mailgenLogo} alt="MailGen" className="nav-logo-img" />
            <span className="logo-text">MailGen</span>
          </div>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li>
              <button onClick={() => scrollToSection('features')} className="nav-link-btn">
                Features
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('use-cases')} className="nav-link-btn">
                Use Cases
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('pricing')} className="nav-link-btn">
                Pricing
              </button>
            </li>
          </ul>

          {/* Desktop Nav Actions */}
          <div className="nav-actions">
            <Link to="/login" className="btn-login-link">
              Sign In
            </Link>
            <Link to="/signup" className="btn-nav-primary">
              Get Started Free
            </Link>
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button className="hamburger-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className={`bar ${mobileMenuOpen ? 'bar-top-open' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'bar-mid-open' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'bar-bot-open' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="mobile-nav-links">
            <li>
              <button onClick={() => scrollToSection('features')} className="mobile-nav-link-btn">
                Features
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('use-cases')} className="mobile-nav-link-btn">
                Use Cases
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection('pricing')} className="mobile-nav-link-btn">
                Pricing
              </button>
            </li>
            <li className="mobile-actions-divider"></li>
            <li>
              <Link to="/login" className="mobile-login-link" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </li>
            <li>
              <Link to="/signup" className="mobile-signup-btn" onClick={() => setMobileMenuOpen(false)}>
                Get Started Free
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 🦸 Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge animate-fade-down">
            <span className="badge-pulse-dot"></span>
            <span>AI-Powered · No more blank page panic</span>
          </div>

          <h1 className="hero-title animate-fade-up-1">
            Write Formal Mails in <span className="gradient-text">Seconds, Not Hours</span>
          </h1>

          <p className="hero-subtitle animate-fade-up-2">
            Generate professional emails for any situation — leave requests, internship applications,
            complaints, and more. Built for students and working professionals.
          </p>

          <div className="hero-buttons animate-fade-up-3">
            <Link to="/signup" className="btn btn-primary btn-hero">
              ✉ Start Writing Free
            </Link>
            <button onClick={() => scrollToSection('preview')} className="btn btn-ghost btn-hero">
              ▶ See it in action
            </button>
          </div>
        </div>
      </section>

      {/* 🖥️ App Preview Card */}
      <section id="preview" className="preview-section">
        <div className="preview-card-wrapper animate-fade-in">
          <div className="preview-card">
            {/* Fake Browser Top Bar */}
            <div className="browser-bar">
              <div className="browser-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="browser-url">mailgen.app/dashboard</div>
            </div>

            {/* Non-Functional Generator Mockup */}
            <div className="mock-generator">
              <div className="mock-group">
                <label className="mock-label">Mail Type</label>
                <div className="mock-select">📋 Leave Request</div>
              </div>

              <div className="mock-group">
                <label className="mock-label">What do you need to write today?</label>
                <div className="mock-textarea">
                  I need 3 days leave starting Monday due to fever...
                </div>
              </div>

              <div className="mock-group">
                <label className="mock-label">Select Tone</label>
                <div className="mock-pills">
                  <span className="mock-pill active">Formal</span>
                  <span className="mock-pill">Semi-Formal</span>
                  <span className="mock-pill">Urgent</span>
                </div>
              </div>

              <button type="button" className="btn btn-primary mock-submit-btn" disabled>
                ✉ Generate Mail
              </button>

              {/* Output container */}
              <div className="mock-output-box">
                <span className="mock-output-tag">Generated</span>
                <pre className="mock-output-text">
                  Subject: Leave Application for Medical Reasons
                  Date: June 11, 2026

                  Dear Sir/Madam,

                  I am writing to formally request a leave of absence for 3 days, starting from Monday, due to a sudden fever.

                  I have ensured that all my critical tasks are up to date, and I will check my mails periodically for any urgent matters.

                  Thank you for your consideration.

                  Sincerely,
                  Jane Doe
                </pre>
                <div className="mock-output-actions">
                  <button className="mock-action-btn" disabled>📋 Copy</button>
                  <button className="mock-action-btn" disabled>↺ Regenerate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Stats Row */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Mails Generated</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">8</span>
            <span className="stat-label">Mail Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">30s</span>
            <span className="stat-label">Avg. Generation Time</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">3</span>
            <span className="stat-label">Tone Options</span>
          </div>
        </div>
      </section>

      {/* ✨ Features Section */}
      <section id="features" className="section-padding">
        <div className="section-header">
          <span className="section-badge">FEATURES</span>
          <h2 className="section-title">Everything you need</h2>
          <p className="section-subtitle">No templates. No overthinking. Just describe and generate.</p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card">
            <div className="feature-icon-box icon-purple">🤖</div>
            <h3>AI-Powered Writing</h3>
            <p>Describe your situation in plain language and get a perfectly structured formal mail instantly.</p>
          </div>
          {/* Card 2 */}
          <div className="feature-card">
            <div className="feature-icon-box icon-pink">🎯</div>
            <h3>Tone Control</h3>
            <p>Switch between Formal, Semi-Formal, and Urgent tones with a single click.</p>
          </div>
          {/* Card 3 */}
          <div className="feature-card">
            <div className="feature-icon-box icon-blue">📚</div>
            <h3>Mail History</h3>
            <p>All your generated mails are saved. Copy, regenerate, or reference them anytime.</p>
          </div>
          {/* Card 4 */}
          <div className="feature-card">
            <div className="feature-icon-box icon-yellow">⚡</div>
            <h3>8 Mail Types</h3>
            <p>Leave, Internship, Complaints, Follow-ups, Apologies, Offer Acceptance and more.</p>
          </div>
          {/* Card 5 */}
          <div className="feature-card">
            <div className="feature-icon-box icon-green">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your mails are tied to your account. No one else can see what you've written.</p>
          </div>
          {/* Card 6 */}
          <div className="feature-card">
            <div className="feature-icon-box icon-red">📋</div>
            <h3>One-Click Copy</h3>
            <p>Copy the full mail to your clipboard instantly — ready to paste anywhere.</p>
          </div>
        </div>
      </section>

      {/* 👥 Use Cases Section */}
      <section id="use-cases" className="section-padding use-cases-section">
        <div className="section-header">
          <span className="section-badge">USE CASES</span>
          <h2 className="section-title">Made for Everyone</h2>
          <p className="section-subtitle">Whether you're studying or working, we've got you covered.</p>
        </div>

        <div className="use-cases-grid">
          {/* Students */}
          <div className="use-case-card">
            <div className="use-case-header">
              <span className="use-case-emoji">🎓</span>
              <h3>Students</h3>
            </div>
            <p className="use-case-desc">Craft flawless applications and leave letters to professors and administrators.</p>
            <div className="use-case-tags">
              <span className="case-tag tag-purple">Leave Request</span>
              <span className="case-tag tag-purple">Internship Apply</span>
              <span className="case-tag tag-purple">Scholarship</span>
              <span className="case-tag tag-purple">Deadline Extension</span>
            </div>
          </div>

          {/* Professionals */}
          <div className="use-case-card">
            <div className="use-case-header">
              <span className="use-case-emoji">💼</span>
              <h3>Professionals</h3>
            </div>
            <p className="use-case-desc">Communicate clearly and effectively with clients, managers, and HR representatives.</p>
            <div className="use-case-tags">
              <span className="case-tag tag-pink">Resignation</span>
              <span className="case-tag tag-pink">Offer Acceptance</span>
              <span className="case-tag tag-pink">Client Follow-up</span>
              <span className="case-tag tag-pink">Complaint</span>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 Pricing Section (Added for a complete SaaS Landing Page feel!) */}
      <section id="pricing" className="section-padding pricing-section">
        <div className="section-header">
          <span className="section-badge">PRICING</span>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-subtitle">Write better emails today. No credit card required.</p>
        </div>

        <div className="pricing-grid">
          {/* Card 1 */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Free Plan</h3>
              <div className="pricing-price">
                <span className="price">$0</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✨ Mock AI generation</li>
              <li>⚡ 8 standard mail categories</li>
              <li>📋 One-click copy tool</li>
              <li>🏠 Save up to 5 history items</li>
            </ul>
            <Link to="/signup" className="btn btn-secondary pricing-btn">
              Get Started Free
            </Link>
          </div>

          {/* Card 2 */}
          <div className="pricing-card pricing-popular">
            <div className="popular-badge">POPULAR</div>
            <div className="pricing-header">
              <h3>Pro Plan</h3>
              <div className="pricing-price">
                <span className="price">$9</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>🤖 Real Google Gemini AI</li>
              <li>⚡ Unlimited email generation</li>
              <li>🎯 High-quality customized prompts</li>
              <li>🔒 Cloud history & sync</li>
              <li>💬 Priority support</li>
            </ul>
            <Link to="/signup" className="btn btn-primary pricing-btn">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* 📣 CTA Banner */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-radial"></div>
          <h2>Stop staring at a blank email</h2>
          <p>Join thousands of students and professionals who write better mails, faster.</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary btn-cta">
              ✉ Create Free Account
            </Link>
            <button onClick={() => scrollToSection('features')} className="btn btn-ghost btn-cta">
              Learn more →
            </button>
          </div>
        </div>
      </section>

      {/* 🦶 Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span>© 2026 MailGen. Built with ❤</span>
          </div>
          <div className="footer-right">
            <Link to="/login">Sign In</Link>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
