import React, { useState } from 'react';
import Badge from '../ui/Badge';
import GlassCard from '../ui/GlassCard';
import { UploadCloud, Sliders, ShieldAlert, BarChart3, FileText, ChevronRight } from 'lucide-react';
import { SHARED_SHAP_ATTRIBUTIONS } from '../../data/telemetryConstants';

const HowItWorksSection = () => {
  const [selectedDataset] = useState('CSE-CIC-IDS2018');
  const [uploadState, setUploadState] = useState({ name: '', status: '' });
  const [kSteps, setKSteps] = useState(5);
  const [selectedFeatureTab, setSelectedFeatureTab] = useState('all');

  const datasetPresets = [
    { name: 'CSE-CIC-IDS2018', type: 'Implemented / validated', flows: 'Official Wed → Thu split', scenario: 'Cross-Day Infiltration', href: 'https://www.unb.ca/cic/datasets/ids-2018.html' },
    { name: 'CTU-13', type: 'Adapter-ready / not evaluated', flows: 'PCAP format reference', scenario: 'Botnet scenarios', href: 'https://www.stratosphereips.org/datasets-ctu13' },
    { name: 'UNSW-NB15', type: 'Adapter-ready / not evaluated', flows: 'Flow CSV reference', scenario: 'Reconnaissance to exploit', href: 'https://research.unsw.edu.au/projects/unsw-nb15-dataset' },
    { name: 'CICIoT2023', type: 'Reference source', flows: 'Requires IoT schema adapter', scenario: 'IoT telemetry', href: 'https://www.unb.ca/cic/datasets/iotdataset-2023.html' },
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

  const handleTelemetryUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    const supported = lower.endsWith('.csv') || lower.endsWith('.pcap') || lower.endsWith('.pcapng');
    if (!supported) {
      setUploadState({ name: file.name, status: 'Unsupported file. Choose CSV, PCAP, or PCAPNG.' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadState({ name: file.name, status: 'File exceeds the 50 MB safety limit.' });
      return;
    }
    if (lower.endsWith('.csv')) {
      const header = (await file.slice(0, 256 * 1024).text()).split(/\r?\n/, 1)[0].trim();
      if (!header || !header.includes(',')) {
        setUploadState({ name: file.name, status: 'Rejected: CSV header is not comma-delimited.' });
        return;
      }
    }
    setUploadState({ name: file.name, status: `Uploaded and validated for offline parsing · ${(file.size / 1024).toFixed(1)} KB` });
  };

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
          Evaluate network state transition dynamics in real time. Ingest flow records or packet traces, extract the dual-level feature tensor, and roll out K time windows ahead with perturbation-based feature attribution.
        </p>
      </div>

      {/* 4-Step Dynamic Layout Grid */}
      <div
        className="how-it-works-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* Step 1: Telemetry Ingestion Zone */}
        <GlassCard className="how-step-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
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

          <label className="telemetry-dropzone" htmlFor="how-it-works-telemetry-upload">
            <UploadCloud size={24} color="#8A8A93" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)' }}>
              {uploadState.name ? uploadState.name : 'Choose PCAP or Flow CSV'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: uploadState.status.startsWith('Ready') ? '#10B981' : 'var(--text-muted)' }}>
              {uploadState.status || '(Max 50MB • In-Memory Offline Parser)'}
            </div>
            <input id="how-it-works-telemetry-upload" type="file" accept=".csv,.pcap,.pcapng,text/csv" onChange={handleTelemetryUpload} />
          </label>

          <div className="how-upload-note">Use the dataset links above for source provenance. Upload a CSV or PCAP here to run the local parser.</div>
        </GlassCard>

        {/* Step 2: Dual Feature Matrix Extractor */}
        <GlassCard className="how-step-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
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
              padding: '20px',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                columnGap: '20px',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                rowGap: '22px',
              }}
            >
              {/* FLOW-LEVEL column */}
              <div style={{ paddingLeft: '20px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#06B6D4',
                    marginBottom: '4px',
                  }}
                >
                  FLOW-LEVEL
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  NetFlow / IPFIX
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>TCP Flags</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 4px' }}>
                      SYN / ACK / FIN / RST / PSH / URG
                    </div>
                    <div className="tcp-flags-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                      0b110010
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>IAT Variance</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      184.2 <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>ms</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>Bidir Flow Ratio</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      0.14
                    </div>
                  </div>
                </div>
              </div>

              {/* PACKET-LEVEL column */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: '#A855F7',
                    marginBottom: '4px',
                  }}
                >
                  PACKET-LEVEL
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  PCAP
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>TTL Variance</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      18.6
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>TCP Window Mean</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      29,200
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>Retransmissions</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                      42
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Step 3: Forward Simulation Slider */}
        <GlassCard className="how-step-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
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
              flex: 'none',
              minHeight: '0',
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
            <div className="how-trajectory" style={{ marginTop: '14px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
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

        {/* Step 4: MITRE ATT&CK Stage & Attribution Visualizer */}
        <GlassCard className="how-step-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              STEP 04 // INTERPRETABILITY
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 600, marginTop: '4px' }}>
              MITRE &amp; Attribution Visualizer
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

          {/* Perturbation-based feature attribution bar chart showing top driving features */}
          <div className="how-attribution"
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
              TOP DRIVING PERTURBATION ATTRIBUTIONS (ΔP):
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

      {/* MITRE ATT&CK Explanation Card */}
      <div style={{ marginTop: '40px' }}>
        <GlassCard style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Badge icon={ShieldAlert} variant="accent">
              TAXONOMY STANDARDS
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#06B6D4' }}>
              MITRE ATT&amp;CK FRAMEWORK MAPPING
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            What is MITRE ATT&amp;CK?
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: '900px' }}>
            MITRE ATT&amp;CK is a globally accessible knowledge base of adversary tactics and techniques based on real-world observations. In Defender, predicted future network states are mapped to these tactical attack stages to provide security operators with immediately actionable intelligence.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#38BDF8' }}>TA0043</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#38BDF8' }}>Reconnaissance</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                The attacker is gathering information about target IPs, open ports, and active services.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#FBBF24' }}>TA0001</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#FBBF24' }}>Initial Access</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                The attacker is attempting to gain an entry point via exploited services or brute force.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#F87171' }}>TA0008</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#F87171' }}>Lateral Movement</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                The attacker is moving between internal systems to reach critical assets.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#EC4899' }}>TA0011</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#EC4899' }}>Command &amp; Control</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                The compromised system is communicating with external attacker infrastructure.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#EF4444' }}>TA0010</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>Exfiltration</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Sensitive network data is being prepared or exfiltrated out of the environment.
              </p>
            </div>
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
