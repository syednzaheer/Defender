import React, { useState } from 'react';
import { Github, Shield, Terminal, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(5, 5, 7, 0.95)',
        padding: '60px 24px 40px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Brand Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!logoError ? (
              <img
                src="/logos/brand-logo.svg"
                alt="Defender"
                width={32}
                height={32}
                onError={() => setLogoError(true)}
              />
            ) : (
              <Shield size={24} color="#FFFFFF" />
            )}
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '18px' }}>
              DEFENDER
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '340px', lineHeight: 1.6 }}>
            World Model Network Attack Forecasting System built for NTRO Problem Statement 26153. Predictive cyber defence via learned state dynamics P(S<sub>t+1</sub> | S<sub>t</sub>).
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href="https://github.com/syednzaheer/Defender"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Repository"
              style={{
                color: 'var(--text-secondary)',
                padding: '8px',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Github size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Supported Datasets */}
        <div>
          <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '0.05em' }}>
            OFFLINE DATASETS &amp; TELEMETRY
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              • CSE-CIC-IDS2018 (Wed/Thu Temporal Split)
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              • CTU-13 Botnet Scenarios
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              • UNSW-NB15 Flow Features
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              • CICIoT2023 Telemetry
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              • Raw PCAP (PyShark / Scapy Packet Parser)
            </li>
          </ul>
        </div>

        {/* Column 3: MITRE ATT&CK Stages */}
        <div>
          <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '0.05em' }}>
            MITRE ATT&amp;CK PROJECTION
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              1. Reconnaissance (TA0043)
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              2. Initial Access (TA0001)
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              3. Lateral Movement (TA0008)
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              4. Command &amp; Control (TA0011)
            </li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              5. Exfiltration (TA0010)
            </li>
          </ul>
        </div>

        {/* Column 4: PS 26153 Governance */}
        <div>
          <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '0.05em' }}>
            CHALLENGE GOVERNANCE
          </h3>
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>PS ID</span>
              <span style={{ color: 'var(--text-primary)' }}>26153</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>ORGANIZATION</span>
              <span style={{ color: '#FFFFFF' }}>NTRO</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>THEME</span>
              <span style={{ color: 'var(--text-primary)' }}>Cybersecurity</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>MODE</span>
              <span style={{ color: '#27C93F' }}>100% OFFLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Tech Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <div>
          Defender — World Model Network Attack Forecasting System • NTRO PS 26153
        </div>
        <div>
          Scientific boundary: Local temporal validation, cross-day benchmark &amp; SHAP attribution.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
