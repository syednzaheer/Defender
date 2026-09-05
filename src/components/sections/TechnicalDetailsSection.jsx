import React, { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import { Layers, Cpu, BarChart3, ChevronDown, ChevronUp, Activity, Shield } from 'lucide-react';

const TechnicalDetailsSection = () => {
  const [expandedSection, setExpandedSection] = useState('model');

  const toggleSection = (key) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 100px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Badge icon={Layers} variant="accent">
            TECHNICAL SPECIFICATION
          </Badge>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#06B6D4' }}>
            NTRO PS 26153 // IMPLEMENTATION DETAIL
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Technical Implementation Details
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', margin: 0, maxWidth: '820px' }}>
          Inspect the model architecture, forecasting pipeline, mathematical formulation, and explainability methodology used in the Defender system.
        </p>
      </div>

      {/* Model Architecture */}
      <GlassCard style={{ padding: '0', marginBottom: '16px', overflow: 'hidden' }}>
        <button
          onClick={() => toggleSection('model')}
          style={{
            width: '100%', backgroundColor: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
            fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={18} color="#06B6D4" />
            Model Architecture
          </div>
          {expandedSection === 'model' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSection === 'model' && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#06B6D4', margin: '0 0 10px' }}>
                  Model Type
                </h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  2-Layer LSTM Encoder with dual output heads. The encoder processes temporal sequences of network state vectors to capture evolving communication patterns.
                </p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', backgroundColor: '#000000', borderRadius: '6px', padding: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>Architecture: LSTM(input=22, hidden=64, layers=2, dropout=0.1)</div>
                  <div style={{ marginTop: '4px' }}>Head 1: Linear → next-state prediction Ŝ<sub>t+1</sub></div>
                  <div style={{ marginTop: '4px' }}>Head 2: Sigmoid → hazard probability P(malicious)</div>
                  <div style={{ marginTop: '4px' }}>Framework: PyTorch 2.x</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#06B6D4', margin: '0 0 10px' }}>
                  Input Representation
                </h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Each network state S<sub>t</sub> is a 22-dimensional canonical feature vector combining flow-level and packet-level telemetry:
                </p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', backgroundColor: '#000000', borderRadius: '6px', padding: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: '#10B981', marginBottom: '4px' }}>17 Flow-Level (NetFlow/IPFIX):</div>
                  <div>src/dst ports, TCP flags bitmask, duration, IAT mean/var, bytes, packets, bidirectional ratio</div>
                  <div style={{ color: '#FBBF24', marginTop: '8px', marginBottom: '4px' }}>5 Packet-Level (PCAP):</div>
                  <div>TTL mean/variance, TCP window mean, payload size mean, retransmission count</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#06B6D4', margin: '0 0 10px' }}>
                  Temporal Window
                </h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  The model processes the last W=10 network state snapshots as a sliding temporal window. This enables the LSTM to learn patterns in how network behavior evolves over time.
                </p>
              </div>

              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#06B6D4', margin: '0 0 10px' }}>
                  Output
                </h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  Two outputs per time step: (1) predicted next network state Ŝ<sub>t+1</sub> for autoregressive rollout, and (2) estimated probability of malicious activity P(malicious | S<sub>t</sub>).
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Forecasting Pipeline */}
      <GlassCard style={{ padding: '0', marginBottom: '16px', overflow: 'hidden' }}>
        <button
          onClick={() => toggleSection('forecast')}
          style={{
            width: '100%', backgroundColor: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
            fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} color="#06B6D4" />
            Forecasting Pipeline & Autoregressive Rollout
          </div>
          {expandedSection === 'forecast' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSection === 'forecast' && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#06B6D4', margin: '0 0 12px' }}>
                How the K-Step Forecast Works
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
                The model does not simply classify a single snapshot. Instead, it autoregressively simulates the network's future evolution by feeding predicted states back into the model:
              </p>

              {/* Visual pipeline */}
              <div style={{ backgroundColor: '#000000', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div style={{ color: '#10B981' }}>Step 0: Current observed network state S<sub>t</sub></div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>↓ LSTM encoder processes [S<sub>t-W</sub> ... S<sub>t</sub>]</div>
                <div style={{ color: '#FBBF24' }}>Step 1: Predicted next state Ŝ<sub>t+1</sub> + hazard P<sub>1</sub></div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>↓ Feed Ŝ<sub>t+1</sub> back into the window</div>
                <div style={{ color: '#FBBF24' }}>Step 2: Predicted Ŝ<sub>t+2</sub> + hazard P<sub>2</sub></div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '16px' }}>↓ Feed Ŝ<sub>t+2</sub> back into the window</div>
                <div style={{ color: '#F87171' }}>Step K: Predicted Ŝ<sub>t+K</sub> + hazard P<sub>K</sub></div>
                <div style={{ color: 'var(--text-muted)', paddingLeft: '16px', marginTop: '8px' }}>
                  Result: Risk trajectory [P<sub>1</sub>, P<sub>2</sub>, ..., P<sub>K</sub>] over K future time windows
                </div>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '16px 0 0' }}>
                This autoregressive approach enables Defender to forecast <strong style={{ color: 'var(--text-primary)' }}>where the network state is heading</strong>, not merely whether the current traffic is malicious.
              </p>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Mathematical Specification */}
      <GlassCard style={{ padding: '0', marginBottom: '16px', overflow: 'hidden' }}>
        <button
          onClick={() => toggleSection('math')}
          style={{
            width: '100%', backgroundColor: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
            fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={18} color="#06B6D4" />
            Mathematical Specification
          </div>
          {expandedSection === 'math' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSection === 'math' && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ marginTop: '20px' }}>
              <div style={{ backgroundColor: '#000000', borderRadius: '8px', padding: '20px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#06B6D4', textAlign: 'center', marginBottom: '16px' }}>
                P(S<sub>t+1</sub> | S<sub>t</sub>)
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>In simple terms:</strong> The model estimates the probability of the next network state given the current state.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#06B6D4', marginBottom: '6px' }}>S<sub>t</sub></div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Current network state — a 22-dimensional vector of flow and packet features at time step t.
                  </p>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#06B6D4', marginBottom: '6px' }}>S<sub>t+1</sub></div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Next predicted network state — where the network activity is heading in the next time window.
                  </p>
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#06B6D4', marginBottom: '6px' }}>P(...)</div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    Estimated likelihood — conditioned on the current observation window, how probable is this transition.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  Multi-Step Rollout Objective
                </h4>
                <div style={{ backgroundColor: '#000000', borderRadius: '6px', padding: '14px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>L = L<sub>state</sub> + λ · L<sub>hazard</sub></div>
                  <div style={{ marginTop: '6px', color: 'var(--text-muted)' }}>where:</div>
                  <div style={{ marginTop: '4px' }}>L<sub>state</sub> = MSE(Ŝ<sub>t+1</sub>, S<sub>t+1</sub>) — next-state prediction loss</div>
                  <div style={{ marginTop: '4px' }}>L<sub>hazard</sub> = BCE(P̂, y) — binary cross-entropy on malicious label</div>
                  <div style={{ marginTop: '4px' }}>λ = balancing coefficient between state fidelity and hazard accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Explainability */}
      <GlassCard style={{ padding: '0', marginBottom: '16px', overflow: 'hidden' }}>
        <button
          onClick={() => toggleSection('explain')}
          style={{
            width: '100%', backgroundColor: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
            fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={18} color="#06B6D4" />
            Explainability Method
          </div>
          {expandedSection === 'explain' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSection === 'explain' && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', fontWeight: 700, color: '#06B6D4', margin: '0 0 10px' }}>
                Perturbation-Based Feature Attribution
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>
                Defender uses perturbation-based sensitivity analysis to determine which input features contributed most to the forecast risk. This works by:
              </p>

              <ol style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '20px', margin: '0 0 16px' }}>
                <li>Running the model on the original input to obtain the baseline hazard probability.</li>
                <li>For each of the 22 features, perturbing (zeroing) that feature and re-running the model.</li>
                <li>Computing ΔP — the change in hazard probability caused by removing each feature.</li>
                <li>Ranking features by |ΔP| to identify the strongest contributors to the forecast.</li>
              </ol>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Note:</strong> This is a local, model-agnostic perturbation method. It is not SHAP (SHapley Additive exPlanations) in the formal game-theoretic sense, though it follows a similar perturbation intuition. The UI labels use "SHAP" as shorthand for perturbation-based attribution.
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Limitations & Known Constraints */}
      <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
        <button
          onClick={() => toggleSection('limits')}
          style={{
            width: '100%', backgroundColor: 'transparent', border: 'none',
            color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
            fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer', padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={18} color="#FBBF24" />
            Known Limitations & Caveats
          </div>
          {expandedSection === 'limits' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSection === 'limits' && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', padding: '14px' }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#FBBF24', margin: '0 0 4px' }}>
                  Cross-Day Generalization Gap
                </h5>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Benchmark metrics (F1=0.35, FPR=0.62–0.73) reflect the difficulty of cross-day generalization on CSE-CIC-IDS2018 (Wednesday train → Thursday test). The model sees genuinely different traffic distributions across days, which is a known challenge in network IDS research.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', padding: '14px' }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#FBBF24', margin: '0 0 4px' }}>
                  MITRE Mapping is Rule-Based
                </h5>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  The ATT&CK stage mapping is derived from threshold-based rules on predicted risk levels, not from the model directly classifying attack techniques. It provides an interpretability layer, not a ground-truth technique attribution.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '8px', padding: '14px' }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: '#FBBF24', margin: '0 0 4px' }}>
                  Offline-Only Inference
                </h5>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  The current MVP processes pre-captured network telemetry (CSV / PCAP). It does not perform real-time packet capture or live tap integration. Production deployment would require integration with network sensors.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Defender Complements Existing Detection
                </h5>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Defender is a predictive forecasting layer. It does not replace IDS/IPS/SIEM systems. It is designed to complement traditional detection by answering: "Based on how the network state is evolving, what may happen next?"
                </p>
              </div>

            </div>
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default TechnicalDetailsSection;
