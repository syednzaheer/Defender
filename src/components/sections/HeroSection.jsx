import React, { useState } from 'react';
import Badge from '../ui/Badge';
import { Play, FileCode, ShieldCheck, Activity, Cpu } from 'lucide-react';

const HeroSection = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '120px',
        paddingBottom: '80px',
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
      <div style={{ marginBottom: '28px' }}>
        <Badge dot dotColor="#27C93F">
          NTRO PS 26153 • WORLD MODEL ATTACK FORECASTING
        </Badge>
      </div>

      {/* Main Title (Strictly single h1) */}
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '1050px',
          margin: '0 auto 20px auto',
        }}
      >
        Predictive Cyber Defence via Network World Models
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
        Ingest packet &amp; flow telemetry. Learn state-transition dynamics P(S<sub>t+1</sub> | S<sub>t</sub>). Forecast attack progression before compromise.
      </p>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
        <a
          href="#simulation"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--accent-white)',
            color: '#000000',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '15px',
            padding: '12px 28px',
            borderRadius: '9999px',
            textDecoration: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          className="hero-cta-button"
        >
          <Play size={16} fill="#000000" /> Run PCAP / CSV Simulation
        </a>

        <a
          href="#intro"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-glass)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            padding: '12px 24px',
            borderRadius: '9999px',
            textDecoration: 'none',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'all 0.2s ease',
          }}
          className="hero-secondary-button"
        >
          <Cpu size={15} /> View World Model Specs
        </a>
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
