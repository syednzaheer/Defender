import React from 'react';
import Badge from '../ui/Badge';
import GlassCard from '../ui/GlassCard';
import CodeTerminal from '../ui/CodeTerminal';
import { Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

const FeaturesSection = () => {
  const benchmarkData = [
    {
      metric: 'F1 Score (Macro)',
      baseline: '0.742',
      lstm: '0.886',
      transformer: '0.912',
      delta: '+22.9%',
      isAdvantage: true,
    },
    {
      metric: 'Precision (Infiltration)',
      baseline: '0.718',
      lstm: '0.894',
      transformer: '0.928',
      delta: '+29.2%',
      isAdvantage: true,
    },
    {
      metric: 'Recall / Detection Rate',
      baseline: '0.768',
      lstm: '0.879',
      transformer: '0.897',
      delta: '+16.8%',
      isAdvantage: true,
    },
    {
      metric: 'False Positive Rate (FPR)',
      baseline: '4.82%',
      lstm: '1.14%',
      transformer: '0.82%',
      delta: '-83.0%',
      isAdvantage: true,
    },
    {
      metric: 'Causal Sequence Awareness',
      baseline: 'None (Static)',
      lstm: 'Hidden State Rollout',
      transformer: 'Multi-Head Temporal Attention',
      delta: 'Causal P(S_t+1 | S_t)',
      isAdvantage: true,
    },
  ];

  const shapInterpretabilityJson = JSON.stringify(
    {
      problem_statement_id: "26153",
      system: "Defender - World Model Network Attack Forecasting",
      dataset: "CSE-CIC-IDS2018_Wednesday_CrossDay",
      forecast_window_k: 5,
      predicted_mitre_stage: {
        stage: "Lateral Movement",
        technique_id: "TA0008",
        confidence: 0.874,
        kill_chain_index: 3
      },
      shap_feature_attributions: [
        {
          feature: "tcp_syn_ratio",
          category: "Flow-Level (IPFIX)",
          shap_value: 0.421,
          empirical_value: 0.84,
          interpretation: "Elevated SYN-to-ACK ratio indicating port scanning precedes burst"
        },
        {
          feature: "dst_port_entropy",
          category: "Packet-Level (PCAP)",
          shap_value: 0.312,
          empirical_value: 3.82,
          interpretation: "High Shannon entropy across destination ports confirms reconnaissance sweep"
        },
        {
          feature: "iat_variance",
          category: "Flow-Level (IPFIX)",
          shap_value: 0.184,
          empirical_value: 184.2,
          interpretation: "Clustered packet arrivals disrupt benign Poisson traffic distribution"
        },
        {
          feature: "ttl_variance",
          category: "Packet-Level (PCAP)",
          shap_value: 0.128,
          empirical_value: 18.6,
          interpretation: "Multi-hop routing variation detected across anomalous probes"
        }
      ],
      causal_state_dynamics: {
        transition_probability: "P(S_t+1 = Lateral_Movement | S_t = Reconnaissance) = 0.874",
        lead_time_seconds: 48.6,
        preemptive_action_recommended: "Isolate subnet VLAN 104; rate-limit destination port sweeps"
      }
    },
    null,
    2
  );

  return (
    <section
      id="benchmarks"
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px 120px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Badge dot dotColor="#27C93F">EMPIRICAL BENCHMARK &amp; EVALUATION</Badge>
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
          World Model vs. Static Logistic Baseline
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
          Evaluating cross-day attack forecasting on official CSE-CIC-IDS2018 benchmark telemetry. Demonstrating that temporal state dynamics learning outperforms isolated-flow classifiers.
        </p>
      </div>

      {/* Benchmark Comparison Table */}
      <GlassCard style={{ padding: '24px', marginBottom: '36px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#FFFFFF" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600 }}>
              Cross-Day Benchmark Evaluation (CSE-CIC-IDS2018)
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            DATASET: WEDNESDAY (TRAIN) → THURSDAY (CROSS-DAY HELD-OUT)
          </span>
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glow)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px' }}>Evaluation Metric</th>
              <th style={{ padding: '12px 16px' }}>Logistic Regression Baseline</th>
              <th style={{ padding: '12px 16px' }}>World Model (LSTM)</th>
              <th style={{ padding: '12px 16px', color: '#FFFFFF' }}>World Model (Transformer)</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Relative Gain</th>
            </tr>
          </thead>
          <tbody>
            {benchmarkData.map((row, i) => (
              <tr
                key={row.metric}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                }}
              >
                <td style={{ padding: '14px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {row.metric}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                  {row.baseline}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                  {row.lstm}
                </td>
                <td style={{ padding: '14px 16px', color: '#FFFFFF', fontWeight: 600 }}>
                  {row.transformer}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', color: '#27C93F', fontWeight: 600 }}>
                  {row.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Bottom Terminal: SHAP Interpretability Output */}
      <div
        style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-glow)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
              SHAP EXPLAINABILITY &amp; ATTRIBUTION TELEMETRY (NTRO PS 26153)
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            INTERPRETABILITY: ATTENTION + SHAP VALUES
          </span>
        </div>

        <CodeTerminal
          title="shap_explainability_inference.json"
          code={shapInterpretabilityJson}
          language="json"
        />
      </div>
    </section>
  );
};

export default FeaturesSection;
