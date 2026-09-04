import React, { useState } from 'react';
import Badge from '../ui/Badge';
import GlassCard from '../ui/GlassCard';
import { UploadCloud, CheckCircle2, Sliders, ShieldAlert, BarChart3, FileText, ChevronRight } from 'lucide-react';
import { SHARED_SHAP_ATTRIBUTIONS } from '../../data/telemetryConstants';

const HowItWorksSection = () => {
  const [selectedDataset, setSelectedDataset] = useState('cic_ids_2018_wed_infiltration.csv');
  const [kSteps, setKSteps] = useState(5);
  const [selectedFeatureTab, setSelectedFeatureTab] = useState('all');

  const datasetPresets = [
    { name: 'cic_ids_2018_wed_infiltration.csv', type: 'Flow CSV', flows: '48,290 records', scenario: 'Cross-Day Infiltration' },
    { name: 'ctu13_neris_botnet_capture.pcap', type: 'Raw PCAP', flows: '128,400 packets', scenario: 'Botnet Fast-Flux Probe' },
    { name: 'unsw_nb15_temporal_flows.csv', type: 'Flow CSV', flows: '32,150 records', scenario: 'Reconnaissance to Exploit' },
  ];

  // Dynamic simulation curves based on selected dataset and K steps
  const baseProbabilities = {
    'cic_ids_2018_wed_infiltration.csv': [0.12, 0.28, 0.54, 0.76, 0.87, 0.92, 0.95, 0.97, 0.98, 0.99],
    'ctu13_neris_botnet_capture.pcap': [0.08, 0.19, 0.41, 0.63, 0.79, 0.86, 0.91, 0.94, 0.96, 0.98],
    'unsw_nb15_temporal_flows.csv': [0.15, 0.34, 0.62, 0.81, 0.89, 0.94, 0.96, 0.98, 0.99, 1.0],
  };

  const currentCurve = baseProbabilities[selectedDataset] || baseProbabilities['cic_ids_2018_wed_infiltration.csv'];
  const activeProb = (currentCurve[kSteps - 1] * 100).toFixed(1);

  // MITRE stage mapping based on probability / K
  const getMitreStage = (k) => {
    if (k <= 2) return { stage: 'RECONNAISSANCE', id: 'TA0043', color: '#38BDF8' };
    if (k <= 4) return { stage: 'INITIAL ACCESS', id: 'TA0001', color: '#FBBF24' };
    if (k <= 7) return { stage: 'LATERAL MOVEMENT', id: 'TA0008', color: '#F87171' };
    if (k <= 9) return { stage: 'COMMAND & CONTROL', id: 'TA0011', color: '#EC4899' };
    return { stage: 'EXFILTRATION', id: 'TA0010', color: '#EF4444' };
  };

  const activeMitre = getMitreStage(kSteps);

  const shapFeatures = SHARED_SHAP_ATTRIBUTIONS.map((item) => ({
    feature: item.feature,
    category: item.category.includes('Flow') ? 'Flow' : 'Packet',
    shap: item.impact,
    desc: item.interpretation,
  }));

  return (
    <section
      id="simulation"
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Badge dot dotColor="#27C93F">LIVE OFFLINE INFERENCE ENGINE</Badge>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '14px',
          }}
        >
          Live PCAP/CSV Attack Forecasting Demo
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-secondary)',
            fontSize: '16px',
            maxWidth: '740px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Evaluate network state transition dynamics in real time. Ingest flow records or packet traces, extract the dual-level feature tensor, and roll out K time windows ahead with SHAP feature attribution.
        </p>
      </div>

      {/* 4-Step Dynamic Layout Grid */}
      <div
        className="how-it-works-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
        }}
      >
        {/* Step 1: Telemetry Ingestion Zone */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              STEP 01 // TELEMETRY
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, marginTop: '4px' }}>
              Telemetry Ingestion Zone
            </h3>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            Accepts raw <code style={{ color: 'var(--text-primary)' }}>.pcap</code> or flow <code style={{ color: 'var(--text-primary)' }}>.csv</code> (CIC-IDS-2018 / CTU-13 / UNSW-NB15).
          </p>

          <div
            style={{
              border: '1px dashed var(--border-glow)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              marginBottom: '12px',
            }}
          >
            <UploadCloud size={24} color="#8A8A93" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)' }}>
              Drop PCAP or Flow CSV
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              (Max 50MB • In-Memory Offline Parser)
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              LOAD VALIDATED PRESET:
            </div>
            {datasetPresets.map((ds) => {
              const active = selectedDataset === ds.name;
              return (
                <button
                  key={ds.name}
                  onClick={() => setSelectedDataset(ds.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${active ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontWeight: 600, color: active ? '#FFFFFF' : 'var(--text-primary)' }}>{ds.type}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ds.flows}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {ds.name}
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Step 2: Dual Feature Matrix Extractor */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              STEP 02 // DUAL MATRIX
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, marginTop: '4px' }}>
              Dual Feature Extractor
            </h3>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
            Simultaneously extracts flow aggregates and timing-sensitive packet indicators:
          </p>

          <div
            style={{
              backgroundColor: '#000000',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flex: 1,
            }}
          >
            <div style={{ color: '#FFFFFF', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
              FLOW-LEVEL (NetFlow/IPFIX)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} color="#27C93F" /> TCP Flags (SYN/ACK/FIN/RST/PSH/URG)
              </span>
              <span style={{ color: '#FFFFFF' }}>[1, 1, 0, 0, 1, 0]</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} color="#27C93F" /> IAT Variance (ms)
              </span>
              <span style={{ color: '#FFFFFF' }}>184.2</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} color="#27C93F" /> Bidir Flow Ratio
              </span>
              <span style={{ color: '#FFFFFF' }}>0.14</span>
            </div>

            <div style={{ color: '#FFFFFF', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px', marginTop: '6px' }}>
              PACKET-LEVEL (PCAP)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} color="#27C93F" /> TTL Variance
              </span>
              <span style={{ color: '#FFFFFF' }}>18.6</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} color="#27C93F" /> TCP Window Mean
              </span>
              <span style={{ color: '#FFFFFF' }}>29,200</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#A1A1AA' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={12} color="#27C93F" /> Retransmission Count
              </span>
              <span style={{ color: '#FFFFFF' }}>42</span>
            </div>
          </div>
        </GlassCard>

        {/* Step 3: Forward Simulation Slider */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              STEP 03 // FORWARD ROLLOUT
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, marginTop: '4px' }}>
              Forward Simulation Slider
            </h3>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Adjust rollout horizon <code style={{ color: '#FFFFFF' }}>K = 1...10</code> to forecast infiltration probability evolution:
          </p>

          <div
            style={{
              backgroundColor: '#000000',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                HORIZON (K-STEPS)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                K = {kSteps} windows
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={kSteps}
              onChange={(e) => setKSteps(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            />

            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  P(Infiltration @ S_t+{kSteps}):
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: activeMitre.color }}>
                  {activeProb}%
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${activeProb}%`,
                    backgroundColor: activeMitre.color,
                    transition: 'width 0.2s ease, background-color 0.2s ease',
                  }}
                />
              </div>
            </div>

            {/* Step probabilities timeline */}
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                TIME-SERIES TRAJECTORY:
              </div>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '36px' }}>
                {currentCurve.slice(0, 10).map((p, idx) => {
                  const isCurrent = idx + 1 === kSteps;
                  return (
                    <div
                      key={idx}
                      title={`Step ${idx + 1}: ${(p * 100).toFixed(0)}%`}
                      onClick={() => setKSteps(idx + 1)}
                      style={{
                        flex: 1,
                        height: `${Math.max(p * 100, 10)}%`,
                        backgroundColor: isCurrent ? activeMitre.color : 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '2px 2px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <span>K=1</span>
                <span>K=5</span>
                <span>K=10</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Step 4: MITRE ATT&CK Stage & SHAP Visualizer */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              STEP 04 // INTERPRETABILITY
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, marginTop: '4px' }}>
              MITRE &amp; SHAP Visualizer
            </h3>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
            Maps predicted future state to kill chain and displays top driving features:
          </p>

          {/* Active predicted attack stage pill */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${activeMitre.color}`,
              borderRadius: '8px',
              marginBottom: '14px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              PREDICTED ATTACK STAGE ({activeMitre.id}):
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                fontWeight: 700,
                color: activeMitre.color,
                marginTop: '2px',
              }}
            >
              {activeMitre.stage} ({activeProb}%)
            </div>
          </div>

          {/* SHAP Feature Attribution bar chart showing top driving features */}
          <div
            style={{
              backgroundColor: '#000000',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px 12px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
              TOP DRIVING SHAP ATTRIBUTIONS:
            </div>

            {shapFeatures.map((item) => (
              <div key={item.feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', marginBottom: '2px' }}>
                  <span style={{ color: '#F4F4F6' }}>{item.feature}</span>
                  <span style={{ color: '#27C93F' }}>+{item.shap}</span>
                </div>
                <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.shap * 180}%`,
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .how-it-works-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .how-it-works-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HowItWorksSection;
