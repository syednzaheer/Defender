import React, { useState } from 'react';
import Badge from '../ui/Badge';
import { Play, FileCode, ShieldCheck, Activity, Cpu } from 'lucide-react';

const HeroSection = ({ onTabChange }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '120px',
        paddingBottom: '60px',
        paddingLeft: '24px',
        paddingRight: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Top Badge */}
      <div style={{ marginBottom: '24px' }}>
        <Badge dot dotColor="#10B981">
          NTRO PS 26153 • WORLD MODEL ATTACK FORECASTING
        </Badge>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.12,
          letterSpacing: '-0.03em',
          maxWidth: '1050px',
          margin: '0 auto 20px auto',
        }}
      >
        Predict the Attack <span style={{ color: '#06B6D4' }}>Before the Compromise</span>
      </h1>

      {/* Sub-Heading */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)',
          fontSize: 'clamp(15px, 2.2vw, 18px)',
          maxWidth: '780px',
          margin: '0 auto 36px auto',
          lineHeight: 1.6,
        }}
      >
        AI-powered network attack forecasting using temporal network behavior <code style={{ color: '#06B6D4' }}>P(S_{'{t+1}'} | S_t)</code>. Ingest packet &amp; flow telemetry and predict multi-step infiltration trajectories before compromise occurs.
      </p>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
        <button
          onClick={() => onTabChange && onTabChange('forecast')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#06B6D4',
            color: '#000000',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '15px',
            padding: '12px 28px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          className="hero-cta-button"
        >
          <Play size={16} fill="#000000" /> Run a Forecast
        </button>

        <button
          onClick={() => onTabChange && onTabChange('how_it_works')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '14px',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          className="hero-secondary-button"
        >
          <Cpu size={15} color="#06B6D4" /> See How It Works
        </button>

        <button
          onClick={() => onTabChange && onTabChange('evidence')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          className="hero-secondary-button"
        >
          <ShieldCheck size={14} /> Explore the Evidence
        </button>
      </div>

      {/* Central Emblem: Centered glass hex icon container housing /logos/brand-logo.svg */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '12px',
        }}
      >
        {/* Subtle background radiant glow behind hex container */}
        <div
          style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(5, 5, 7, 0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
          className="pulse-glow"
        />

        <div
          style={{
            width: '120px',
            height: '120px',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glow)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxShadow: '0 0 35px rgba(255, 255, 255, 0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {!logoError ? (
            <img
              src="/logos/brand-logo.svg"
              alt="Defender Emblem"
              width={80}
              height={80}
              onError={() => setLogoError(true)}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <div
              className="svg-fallback-skeleton"
              style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={44} color="#FFFFFF" />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hero-cta-button:hover {
          transform: scale(1.02);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }
        .hero-secondary-button:hover {
          border-color: var(--border-glow);
          background: rgba(255, 255, 255, 0.06);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
