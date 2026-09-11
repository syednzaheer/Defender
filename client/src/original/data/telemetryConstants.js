export const SHARED_SHAP_ATTRIBUTIONS = [
  { feature: 'tcp_syn_ratio', category: 'Flow-level', impact: 0.42, interpretation: 'Elevated SYN-to-ACK ratio indicates reconnaissance.' },
  { feature: 'dst_port_entropy', category: 'Flow-level', impact: 0.31, interpretation: 'High destination-port entropy supports a sweep pattern.' },
  { feature: 'iat_variance_ms', category: 'Flow-level', impact: 0.18, interpretation: 'Clustered arrivals alter the benign timing distribution.' },
  { feature: 'ttl_variance', category: 'Packet-level', impact: 0.13, interpretation: 'TTL variation provides packet-level path context.' },
  { feature: 'retransmission_count', category: 'Packet-level', impact: 0.10, interpretation: 'Repeated delivery attempts add transport-level signal.' },
];
