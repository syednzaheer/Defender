import React from 'react';
import { X, ExternalLink, Shield } from 'lucide-react';
import Badge from '../ui/Badge';

const MobileNav = ({ isOpen, onClose, onTabChange }) => {
  if (!isOpen) return null;

  const navigateTab = (tab) => {
    if (onTabChange) onTabChange(tab);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(7, 9, 14, 0.96)',
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
        <button
          onClick={() => navigateTab('home')}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: 'var(--text-primary)',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          Home
        </button>
        <button
          onClick={() => navigateTab('how_it_works')}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: 'var(--text-primary)',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          How It Works
        </button>
        <button
          onClick={() => navigateTab('forecast')}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: '#06B6D4',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Run Forecast Workspace
        </button>
        <button
          onClick={() => navigateTab('evidence')}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '18px',
            color: 'var(--text-primary)',
            background: 'none',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          Evidence &amp; Benchmark
        </button>
      </div>

      {/* Bottom Status & CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
        <Badge dot dotColor="#10B981">
          P(S_t+1 | S_t) DYNAMICS READY
        </Badge>
        <button
          onClick={() => navigateTab('forecast')}
          style={{
            textAlign: 'center',
            backgroundColor: '#06B6D4',
            color: '#000000',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '15px',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ⚡ Run Forecast
        </button>
      </div>
    </div>
  );
};

export default MobileNav;
