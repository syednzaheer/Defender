/**
 * telemetryConstants.js
 *
 * Shared static, non-K-dependent constants for the Defender PS 26153 UI.
 *
 * ISOLATION RULE: This module ONLY exports non-dynamic, non-K-step data.
 * Do NOT import K-slider functions (getMitreStage, probability rollout curves)
 * here. Keep all dynamic state computation live inside HowItWorksSection.jsx.
 */

/**
 * SHAP feature attribution rankings — static, fixed from the cross-day
 * benchmark evaluation on CSE-CIC-IDS2018 (Wed → Thu).
 * These values are shared across HowItWorksSection.jsx and FeaturesSection.jsx
 * to ensure single-source consistency and avoid divergence.
 */
export const SHARED_SHAP_ATTRIBUTIONS = [
  {
    feature: 'tcp_syn_ratio',
    category: 'Flow-Level (IPFIX)',
    impact: 0.421,
    empiricalValue: 0.84,
    interpretation: 'Elevated SYN-to-ACK ratio indicating port scanning precedes burst',
  },
  {
    feature: 'dst_port_entropy',
    category: 'Packet-Level (PCAP)',
    impact: 0.312,
    empiricalValue: 3.82,
    interpretation: 'High Shannon entropy across destination ports confirms reconnaissance sweep',
  },
  {
    feature: 'iat_variance',
    category: 'Flow-Level (IPFIX)',
    impact: 0.184,
    empiricalValue: 184.2,
    interpretation: 'Clustered packet arrivals disrupt benign Poisson traffic distribution',
  },
  {
    feature: 'ttl_variance',
    category: 'Packet-Level (PCAP)',
    impact: 0.128,
    empiricalValue: 18.6,
    interpretation: 'Multi-hop routing variation detected across anomalous probes',
  },
  {
    feature: 'tcp_window_mean',
    category: 'Packet-Level (PCAP)',
    impact: 0.096,
    empiricalValue: 29200,
    interpretation: 'Window size buffer exhaustion under SYN-flood conditions',
  },
];

/**
 * MITRE ATT&CK stage taxonomy used for kill-chain projection.
 * Static ordered array — tactic ordering matches PS 26153 specification.
 */
export const MITRE_STAGES = [
  { tactic_id: 'TA0043', stage: 'Reconnaissance',    color: '#38BDF8' },
  { tactic_id: 'TA0001', stage: 'Initial Access',    color: '#FBBF24' },
  { tactic_id: 'TA0008', stage: 'Lateral Movement',  color: '#F87171' },
  { tactic_id: 'TA0011', stage: 'Command & Control', color: '#EC4899' },
  { tactic_id: 'TA0010', stage: 'Exfiltration',      color: '#EF4444' },
];

/**
 * Dataset presets for Telemetry Ingestion Zone.
 * Non-dynamic reference data for Step 1 UI.
 */
export const DATASET_PRESETS = [
  {
    name: 'cic_ids_2018_wed_infiltration.csv',
    type: 'Flow CSV',
    flows: '48,290 records',
    scenario: 'Cross-Day Infiltration (PS 26153 canonical)',
  },
  {
    name: 'ctu13_neris_botnet_capture.pcap',
    type: 'Raw PCAP',
    flows: '128,400 packets',
    scenario: 'Botnet Fast-Flux Probe',
  },
  {
    name: 'unsw_nb15_temporal_flows.csv',
    type: 'Flow CSV',
    flows: '32,150 records',
    scenario: 'Reconnaissance to Exploit',
  },
];
