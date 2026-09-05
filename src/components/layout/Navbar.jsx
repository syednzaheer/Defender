import React, { useState } from 'react';
import { Menu, Shield, ExternalLink, Activity } from 'lucide-react';
import Badge from '../ui/Badge';

const Navbar = ({ activeTab, onTabChange, onOpenMobileNav }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(7, 9, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Name */}
        <div
          onClick={() => onTabChange('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
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
                  backgroundColor: 'rgba(6, 182, 212, 0.15)',
                  borderRadius: '8px',
                }}
              >
                <Shield size={20} color="#06B6D4" />
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
                color: '#06B6D4',
                letterSpacing: '0.06em',
              }}
            >
              NTRO PS 26153 // PREDICTIVE CYBER DEFENSE
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '24px',
          }}
          className="desktop-nav-links"
        >
          <button
            onClick={() => onTabChange('home')}
            className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('how_it_works')}
            className={`nav-tab-btn ${activeTab === 'how_it_works' ? 'active' : ''}`}
          >
            How It Works
          </button>
          <button
            onClick={() => onTabChange('forecast')}
            className={`nav-tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
          >
            Run Forecast
          </button>
          <button
            onClick={() => onTabChange('evidence')}
            className={`nav-tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          >
            Evidence &amp; Benchmark
          </button>
        </nav>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="desktop-status-pill" style={{ display: 'none' }}>
            <Badge dot dotColor="#10B981">
              OFFLINE MODEL READY
            </Badge>
          </div>

          <button
            onClick={() => onTabChange('forecast')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#06B6D4',
              color: '#000000',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '13px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
              transition: 'all 0.2s ease',
            }}
            className="navbar-cta"
          >
            <Activity size={14} /> Run Forecast
          </button>

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
        .nav-tab-btn {
          font-family: var(--font-body);
          font-size: 14px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px 0;
          transition: color 0.2s ease;
        }
        .nav-tab-btn:hover {
          color: var(--text-primary);
        }
        .nav-tab-btn.active {
          color: #06B6D4;
          font-weight: 600;
          border-bottom: 2px solid #06B6D4;
        }
        .navbar-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 18px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </header>
  );
};

export default Navbar;
