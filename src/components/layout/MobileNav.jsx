import React from 'react';
import { X, ExternalLink, Shield } from 'lucide-react';
import Badge from '../ui/Badge';

const MobileNav = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 5, 7, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logos/brand-logo.svg" alt="Defender" width={28} height={28} />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px' }}>
            DEFENDER
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close menu"
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
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <a
          href="#intro"
          onClick={onClose}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          Reality Check: Static vs. World Model
        </a>
        <a
          href="#simulation"
          onClick={onClose}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          Live PCAP/CSV Attack Forecasting
        </a>
        <a
          href="#benchmarks"
          onClick={onClose}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          Model Benchmark &amp; SHAP
        </a>
        <a
          href="/public/llms.txt"
          target="_blank"
          rel="noreferrer"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          NTRO PS 26153 Specs <ExternalLink size={16} />
        </a>
      </div>

      {/* Bottom Status & CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
        <Badge dot dotColor="#27C93F">
          P(S_t+1 | S_t) DYNAMICS READY
        </Badge>
        <a
          href="#simulation"
          onClick={onClose}
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--accent-white)',
            color: '#000000',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '15px',
            padding: '14px',
            borderRadius: '9999px',
            textDecoration: 'none',
          }}
        >
          Run Attack Simulation
        </a>
      </div>
    </div>
  );
};

export default MobileNav;
