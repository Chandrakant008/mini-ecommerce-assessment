import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface HelpModalContent {
  title: string;
  body: React.ReactNode;
}

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<{
    type: 'idle' | 'error' | 'success';
    message: string;
  }>({ type: 'idle', message: '' });

  // Informational help modal state to prevent broken routes
  const [activeModal, setActiveModal] = useState<HelpModalContent | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setNewsletterStatus({
        type: 'error',
        message: 'Please enter your email address.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setNewsletterStatus({
        type: 'error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    // Success simulation
    setNewsletterStatus({
      type: 'success',
      message: 'Thanks for subscribing to ApexStore updates!',
    });
    setEmail('');
  };

  const openHelpModal = (title: string, body: React.ReactNode) => {
    setActiveModal({ title, body });
  };

  const closeHelpModal = () => {
    setActiveModal(null);
  };

  return (
    <footer className="ecommerce-footer" role="contentinfo" aria-label="ApexStore Footer">
      <div className="footer-main-container">
        {/* Column 1: Registered Office & Contact Information */}
        <div className="footer-column office-column">
          <h3 className="footer-heading-orange">Register Office</h3>
          <div className="footer-address-block">
            <p className="company-name">ApexStore Electronics & Retail Pvt. Ltd.</p>
            <p className="address-text">
              #28/1A, 100 Feet Road, Near CMH Road,
              <br />
              Indiranagar, Bangalore – 560 038, Karnataka.
            </p>
          </div>

          <div className="footer-contact-group">
            <h4 className="footer-heading-orange">Call Us On</h4>
            <p className="contact-line">
              <span className="city-label">Bangalore:</span>{' '}
              <a href="tel:08042464343" className="contact-link">
                080 42464343
              </a>{' '}
              <span className="hours-note">(10 AM - 7 PM)</span>
            </p>
            <p className="contact-line">
              <span className="city-label">Hyderabad:</span>{' '}
              <a href="tel:04042464343" className="contact-link">
                040 42464343
              </a>{' '}
              <span className="hours-note">(10 AM - 7 PM)</span>
            </p>
          </div>

          <div className="footer-contact-group">
            <h4 className="footer-heading-orange">Mail Us To</h4>
            <p className="contact-line">
              <a href="mailto:support@apexstore.in" className="contact-link mail-link">
                support@apexstore.in
              </a>
            </p>
          </div>
        </div>

        {/* Column 2: Quick Links to Catalog Categories */}
        <div className="footer-column quick-links-column">
          <h3 className="footer-heading-orange">Quick Links</h3>
          <ul className="footer-nav-list">
            <li>
              <Link to="/?category=Electronics&search=Phone" className="footer-nav-link">
                Smartphones
              </Link>
            </li>
            <li>
              <Link to="/?category=Electronics&search=Laptop" className="footer-nav-link">
                Laptops & Computers
              </Link>
            </li>
            <li>
              <Link to="/?category=Audio" className="footer-nav-link">
                Headphones & Audio
              </Link>
            </li>
            <li>
              <Link to="/?category=Wearables" className="footer-nav-link">
                Smartwatches & Wearables
              </Link>
            </li>
            <li>
              <Link to="/?category=Accessories" className="footer-nav-link">
                Accessories & Storage
              </Link>
            </li>
            <li>
              <Link to="/" className="footer-nav-link">
                Browse All Products
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Help & Policies */}
        <div className="footer-column help-column">
          <h3 className="footer-heading-orange">Help</h3>
          <ul className="footer-nav-list">
            <li>
              <button
                type="button"
                className="footer-link-button"
                onClick={() =>
                  openHelpModal(
                    'ApexStore Terms & Conditions',
                    <div>
                      <p>
                        Welcome to ApexStore. All orders are fulfilled based on live warehouse inventory
                        availability verified at checkout. Prices include applicable GST.
                      </p>
                      <p style={{ marginTop: '0.75rem' }}>
                        Stock allocations are reserved upon order confirmation. Maximum purchase limits
                        apply strictly based on real-time stock.
                      </p>
                    </div>
                  )
                }
              >
                ApexStore Policy & Terms
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-button"
                onClick={() =>
                  openHelpModal(
                    'Shipping & Delivery Information',
                    <div>
                      <p>
                        <strong>Standard Shipping:</strong> Dispatched within 24 hours of confirmation.
                      </p>
                      <p style={{ marginTop: '0.5rem' }}>
                        <strong>Delivery Timelines:</strong> 2–4 business days across metro locations and
                        3–6 days for regional destinations.
                      </p>
                      <p style={{ marginTop: '0.5rem' }}>
                        Free shipping is offered across all current catalog items.
                      </p>
                    </div>
                  )
                }
              >
                Shipping Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-button"
                onClick={() =>
                  openHelpModal(
                    'Return & Replacement Policy',
                    <div>
                      <p>
                        ApexStore offers a <strong>7-day replacement guarantee</strong> for defective or
                        damaged items delivered to customers.
                      </p>
                      <p style={{ marginTop: '0.5rem' }}>
                        Products must be returned in original manufacturer packaging with all serial
                        numbers, barcodes, and included accessories intact.
                      </p>
                    </div>
                  )
                }
              >
                Return Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-button"
                onClick={() =>
                  openHelpModal(
                    'Privacy & Data Security',
                    <div>
                      <p>
                        ApexStore values your privacy. We do not sell or lease personal customer data to
                        third parties.
                      </p>
                      <p style={{ marginTop: '0.5rem' }}>
                        All sessions, cart actions, and checkout requests are encrypted using industry-standard
                        HTTPS/TLS protocols.
                      </p>
                    </div>
                  )
                }
              >
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Newsletter, Social Icons, and App Download */}
        <div className="footer-column newsletter-column">
          <h3 className="footer-heading-orange">Subscribe To Our Newsletter</h3>

          {/* Newsletter Form */}
          <form className="footer-newsletter-form" onSubmit={handleSubscribe} noValidate>
            <div className="newsletter-input-group">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Enter Your Email Address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                className="newsletter-email-input"
                placeholder="Enter Your Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (newsletterStatus.type !== 'idle') {
                    setNewsletterStatus({ type: 'idle', message: '' });
                  }
                }}
                aria-label="Email address for newsletter"
              />
              <button type="submit" className="newsletter-submit-btn">
                Subscribe
              </button>
            </div>

            {/* Newsletter Validation Message */}
            {newsletterStatus.type === 'error' && (
              <div className="newsletter-msg newsletter-error" role="alert">
                <AlertCircle size={14} />
                <span>{newsletterStatus.message}</span>
              </div>
            )}
            {newsletterStatus.type === 'success' && (
              <div className="newsletter-msg newsletter-success" role="status">
                <CheckCircle2 size={14} />
                <span>{newsletterStatus.message}</span>
              </div>
            )}
          </form>

          {/* Social Media Icons (Circular white badges with dark icons) */}
          <div className="footer-social-section" aria-label="Social media channels">
            <div className="social-icons-row">
              {/* Facebook */}
              <a
                href="#facebook"
                onClick={(e) => e.preventDefault()}
                className="social-icon-btn"
                aria-label="ApexStore on Facebook"
                title="ApexStore on Facebook"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="#linkedin"
                onClick={(e) => e.preventDefault()}
                className="social-icon-btn"
                aria-label="ApexStore on LinkedIn"
                title="ApexStore on LinkedIn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* X / Twitter */}
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                className="social-icon-btn"
                aria-label="ApexStore on X (Twitter)"
                title="ApexStore on X (Twitter)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#instagram"
                onClick={(e) => e.preventDefault()}
                className="social-icon-btn"
                aria-label="ApexStore on Instagram"
                title="ApexStore on Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#youtube"
                onClick={(e) => e.preventDefault()}
                className="social-icon-btn"
                aria-label="ApexStore on YouTube"
                title="ApexStore on YouTube"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Download Our App Section */}
          <div className="footer-app-section">
            <h4 className="footer-heading-orange app-subheading">Download Our App:</h4>
            <div
              className="google-play-badge"
              role="img"
              aria-label="Get it on Google Play - Mobile app coming soon"
            >
              <div className="play-icon-svg">
                <svg width="22" height="24" viewBox="0 0 24 26" fill="none">
                  <path
                    d="M1.2 0.8C0.8 1.2 0.5 1.9 0.5 2.8V23.2C0.5 24.1 0.8 24.8 1.2 25.2L1.3 25.3L13.5 13.1V12.9L1.3 0.7L1.2 0.8Z"
                    fill="#2196F3"
                  />
                  <path
                    d="M17.6 17.2L13.5 13.1V12.9L17.6 8.8L17.7 8.9L22.6 11.6C24 12.4 24 13.6 22.6 14.4L17.7 17.1L17.6 17.2Z"
                    fill="#FFC107"
                  />
                  <path
                    d="M17.7 17.1L13.5 12.9L1.2 25.2C1.7 25.7 2.5 25.8 3.5 25.2L17.7 17.1Z"
                    fill="#4CAF50"
                  />
                  <path
                    d="M17.7 8.9L3.5 0.8C2.5 0.2 1.7 0.3 1.2 0.8L13.5 13.1L17.7 8.9Z"
                    fill="#F44336"
                  />
                </svg>
              </div>
              <div className="badge-text-group">
                <span className="badge-small-text">GET IT ON</span>
                <span className="badge-brand-text">Google Play</span>
              </div>
            </div>
            <span className="app-note-text">ApexStore Mobile Experience Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="bottom-bar-content">
          <p className="copyright-text">
            ApexStore © {new Date().getFullYear()}. All Rights Reserved
          </p>
        </div>
      </div>

      {/* Informational Help Modal (Accessible, non-breaking) */}
      {activeModal && (
        <div
          className="help-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          onClick={closeHelpModal}
        >
          <div
            className="help-modal-card"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeHelpModal();
            }}
          >
            <div className="help-modal-header">
              <div className="help-title-group">
                <ShieldCheck size={20} className="modal-shield-icon" />
                <h3 id="help-modal-title" className="modal-title">
                  {activeModal.title}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeHelpModal}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="help-modal-body">{activeModal.body}</div>
            <div className="help-modal-footer">
              <button type="button" className="btn btn-primary btn-sm" onClick={closeHelpModal}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
