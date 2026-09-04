import React from 'react';
import { Database, ShieldCheck, Cpu, GitCommit, FileSpreadsheet } from 'lucide-react';

const DatasetTickerItem = ({ name, type, icon }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        cursor: 'default',
        whiteSpace: 'nowrap',
      }}
      className="dataset-ticker-item"
    >
      {icon}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-muted)',
          }}
        >
          {type}
        </span>
      </div>
    </div>
  );
};

const LogoTicker = () => {
  const datasets = [
    { name: 'CSE-CIC-IDS2018', type: 'Flows & Raw PCAP', icon: <Database size={18} color="#FFFFFF" /> },
    { name: 'CTU-13 Scenarios', type: 'Botnet PCAP & NetFlow', icon: <FileSpreadsheet size={18} color="#FFFFFF" /> },
    { name: 'UNSW-NB15', type: 'Temporal Flow Telemetry', icon: <Cpu size={18} color="#FFFFFF" /> },
    { name: 'CICIoT2023', type: 'IoT Attack Traffic', icon: <Database size={18} color="#FFFFFF" /> },
    { name: 'MITRE ATT&CK', type: 'Tactics & Kill-Chain', icon: <ShieldCheck size={18} color="#FFFFFF" /> },
    { name: 'PyShark / Scapy', type: 'Packet Feature Pipeline', icon: <GitCommit size={18} color="#FFFFFF" /> },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 16px 64px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}
      >
        SUPPORTED DATASETS &amp; ATTACK BENCHMARK TAXONOMY (NTRO PS 26153)
      </div>

      {/* Centered Row on desktop & Swipe-Scroll on mobile */}
      <div
        className="logo-ticker-container"
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '8px 12px',
        }}
      >
        {datasets.map((item) => (
          <DatasetTickerItem
            key={item.name}
            name={item.name}
            type={item.type}
            icon={item.icon}
          />
        ))}
      </div>

      <style>{`
        .logo-ticker-container::-webkit-scrollbar {
          display: none;
        }
        .dataset-ticker-item:hover {
          border-color: var(--border-glow);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }
        @media (max-width: 900px) {
          .logo-ticker-container {
            justify-content: flex-start !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LogoTicker;
