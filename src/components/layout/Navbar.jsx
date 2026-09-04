import React, { useState } from 'react';
import { Menu, Shield, ExternalLink, Activity } from 'lucide-react';
import Badge from '../ui/Badge';

const Navbar = ({ onOpenMobileNav }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(5, 5, 7, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Name */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {!logoError ? (
              <img
                src="/logos/brand-logo.svg"
                alt="Defender Emblem"
                width={36}
                height={36}
                onError={() => setLogoError(true)}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <div
                className="svg-fallback-skeleton"
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={20} color="#FFFFFF" />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '18px',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              DEFENDER
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
              }}
            >
              NTRO PS 26153 // WORLD MODEL FORECASTING
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '28px',
          }}
          className="desktop-nav-links"
        >
          <a href="#intro" className="nav-link">Reality Check</a>
          <a href="#simulation" className="nav-link">Offline Inference</a>
          <a href="#benchmarks" className="nav-link">Benchmarks &amp; SHAP</a>
          <a href="/public/llms.txt" target="_blank" rel="noreferrer" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            PS 26153 Spec <ExternalLink size={12} />
          </a>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="desktop-status-pill" style={{ display: 'none' }}>
            <Badge dot dotColor="#27C93F">
              WORLD MODEL ACTIVE // OFFLINE
            </Badge>
          </div>

          <a
            href="#simulation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--accent-white)',
              color: '#000000',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '13px',
              padding: '8px 18px',
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="navbar-cta"
          >
            Run Simulation
          </a>

          {/* Mobile hamburger button */}
          <button
            onClick={onOpenMobileNav}
            aria-label="Open Navigation Menu"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="mobile-nav-toggle"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .desktop-status-pill {
            display: inline-flex !important;
          }
          .mobile-nav-toggle {
            display: none !important;
          }
        }
        .nav-link {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .nav-link:hover {
          color: var(--text-primary);
        }
        .navbar-cta:hover {
          transform: scale(1.02);
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
