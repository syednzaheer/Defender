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
        paddingTop: '32px',
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

      {/* Home Hero Banner Visual */}
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          margin: '0 auto 36px auto',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <img
          src="/imgs/banner.png"
          alt="Defender Predictive Cyber Defense Banner"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
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
        Predict the Attack
        <br />
        <span style={{ color: '#06B6D4' }}>Before the Compromise</span>
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
        AI-powered network attack forecasting using temporal network behavior{' '}
        <code
          style={{
            color: '#06B6D4',
            whiteSpace: 'nowrap',
          }}
        >
          P(S_{'{t+1}'} | S_t)
        </code>
        . Ingest packet &amp; flow telemetry and predict multi-step infiltration trajectories before
        compromise occurs.
      </p>

      {/* CTA Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '40px',
        }}
      >
        {/* Try the Demo */}
        <button
          onClick={() => onTabChange && onTabChange('demo')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#10B981',
            color: '#000000',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '15px',
            padding: '12px 28px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          className="hero-cta-button"
        >
          <Play size={16} fill="#000000" /> Try the Demo
        </button>

        {/* Run a Forecast */}
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

        {/* See How It Works */}
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

        {/* Explore the Evidence */}
        <button
          onClick={() => onTabChange && onTabChange('evidence')}
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
          <ShieldCheck size={15} color="#06B6D4" /> Explore the Evidence
        </button>
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