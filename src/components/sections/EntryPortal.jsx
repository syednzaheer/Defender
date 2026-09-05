import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import { Shield, ArrowRight, Activity, Lock, CheckCircle2 } from 'lucide-react';

const EntryPortal = ({ onEnter }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEnter = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onEnter();
    }, 450); // 450ms smooth transition
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10,
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 450ms ease, transform 450ms ease',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        
        {/* Logo Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '6px 16px', borderRadius: '20px', marginBottom: '28px' }}>
          <Shield size={16} color="#06B6D4" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#06B6D4', letterSpacing: '0.08em', fontWeight: 600 }}>
            NTRO PS 26153 // PREDICTIVE CYBER DEFENSE
          </span>
        </div>

        {/* Hero Title */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            margin: '0 0 16px',
          }}
        >
          DEFENDER
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 36px',
          }}
        >
          The system forecasts how network activity may evolve before an attack fully develops.
        </p>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '36px', textAlign: 'left' }}>
          <GlassCard style={{ padding: '16px' }}>
            <Activity size={18} color="#06B6D4" style={{ marginBottom: '8px' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#F4F4F6' }}>
              State Dynamics
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              P(S_{'{t+1}'} | S_t) Temporal Model
            </span>
          </GlassCard>

          <GlassCard style={{ padding: '16px' }}>
            <Lock size={18} color="#10B981" style={{ marginBottom: '8px' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#F4F4F6' }}>
              Offline Ready
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              Self-contained PyTorch Artifact
            </span>
          </GlassCard>

          <GlassCard style={{ padding: '16px' }}>
            <CheckCircle2 size={18} color="#FBBF24" style={{ marginBottom: '8px' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#F4F4F6' }}>
              MITRE ATT&amp;CK
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              Stage Progression Mapping
            </span>
          </GlassCard>
        </div>

        {/* Enter CTA Button */}
        <button
          onClick={handleEnter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#06B6D4',
            color: '#000000',
            fontFamily: 'var(--font-body)',
            fontWeight: 800,
            fontSize: '16px',
            padding: '14px 36px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)',
            transition: 'all 0.2s ease',
          }}
        >
          Enter Defender <ArrowRight size={18} />
        </button>

        <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px' }}>
          SIH 2026 Submission Build // Evaluated on CSE-CIC-IDS2018
        </span>

      </div>
    </div>
  );
};

export default EntryPortal;
