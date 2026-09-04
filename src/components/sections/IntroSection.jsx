import React from 'react';
import Badge from '../ui/Badge';
import GlassCard from '../ui/GlassCard';
import { Layers, Activity, GitBranch, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';

const IntroSection = () => {
  const cards = [
    {
      icon: <Layers size={24} color="#FFFFFF" />,
      tag: 'FEATURE PIPELINE // 01',
      title: 'Dual-Level Traffic Feature Ingestion',
      subtitle: 'Flow-Level NetFlow/IPFIX + Packet-Level PCAP Signals',
      description:
        'Combines flow-level aggregates (source/dest IP & port, TCP flag bitmask SYN/ACK/FIN/RST/PSH/URG, bytes & packets per flow, duration, IAT mean/variance/max, bidirectional ratios) with granular packet-level telemetry (TTL values & variance, TCP window size, IP fragment flags, payload size distribution, and retransmission counts).',
      badgeText: 'NETFLOW + PCAP',
    },
    {
      icon: <Activity size={24} color="#FFFFFF" />,
      tag: 'CORE ENGINE // 02',
      title: 'P(S_{t+1} | S_t) Dynamics Learning',
      subtitle: 'Sequence Models: LSTM, Temporal Transformer & GNNs',
      description:
        'Moves fundamentally beyond static intrusion classification where flows are evaluated in isolation. Learns the causal transition dynamics of how network states evolve over time windows, capturing probe sequences, SYN-preceding-ACK floods, and reconnaissance timing before lateral movement manifests.',
      badgeText: 'STATE TRANSITION DYNAMICS',
    },
    {
      icon: <GitBranch size={24} color="#FFFFFF" />,
      tag: 'PROACTIVE DEFENCE // 03',
      title: 'K-Step Forward Simulation',
      subtitle: 'Infiltration Trajectory Projection & MITRE Mapping',
      description:
        'Performs rollouts K steps into the future from current observed traffic state S_t. Computes the cumulative infiltration probability timeline and projects the trajectory directly onto MITRE ATT&CK stages (Reconnaissance → Initial Access → Lateral Movement → C2 → Exfiltration) with SHAP attribution.',
      badgeText: 'K-STEP ROLLOUT',
    },
  ];

  return (
    <section
      id="intro"
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Badge>PROBLEM STATEMENT REALITY CHECK</Badge>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          Static Classification vs. World Model Simulation
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-secondary)',
            fontSize: '16px',
            maxWidth: '780px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Traditional intrusion detection evaluates packets in isolation. An infiltration is an evolving causal process over time. Defender learns network physics via state dynamics P(S<sub>t+1</sub> | S<sub>t</sub>) to forecast attack trajectories before compromise completes.
        </p>
      </div>

      {/* 3-Column Card Grid */}
      <div
        className="intro-card-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}
      >
        {cards.map((card, idx) => (
          <GlassCard key={idx} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Card Header with Icon & Tag */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                {card.tag}
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '19px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
                lineHeight: 1.3,
              }}
            >
              {card.title}
            </h3>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '14px',
              }}
            >
              {card.subtitle}
            </div>

            {/* Description */}
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                flex: 1,
                marginBottom: '20px',
              }}
            >
              {card.description}
            </p>

            {/* Bottom Status pill */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--accent-white)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {card.badgeText}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .intro-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default IntroSection;
