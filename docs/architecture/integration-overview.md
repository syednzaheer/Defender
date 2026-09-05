# Defender Integration Architecture & Data Contract Overview

## Executive Overview
**Defender** (NTRO Problem Statement 26153) is an AI-based network attack forecasting system that processes network traffic telemetry (IPFIX flows and PCAP headers) to predict future infiltration risks and attack progression trajectories before compromise completion.

---

## Modular Component Division

The Defender platform is built from three domain-oriented subsystems:

1. **Data Pipeline & Ingestion Layer**:
   - Ingests CSV flow logs and PCAP packet captures.
   - Extracts 22 canonical features (17 IPFIX flow metrics + 5 packet-level fields).
   - Located in `vendor/data_pipeline/` and `src/defender/traffic.py`.

2. **World Model Research & Temporal Forecasting Layer**:
   - 2-Layer PyTorch LSTM architecture trained on chronological windows (window size $W=10$, hidden dimension $H=64$).
   - Predicts next state vector $\hat{S}_{t+1}$ and hazard probability $P(\text{malicious})$.
   - Evaluated on cross-day held-out test splits (Wednesday 28 Feb 2018 training, Thursday 1 March 2018 evaluation on CSE-CIC-IDS2018).
   - Located in `vendor/world_model_research/`, `src/defender/world_model_adapter.py`, and `artifacts/cross_day_benchmark/`.

3. **Dashboard & Analyst Interface Layer**:
   - React + Vite frontend with Node.js Express API server and Python process bridge.
   - Real-time K-step risk curve, MITRE ATT&CK 5-stage progression mapping, perturbation-based feature attribution, and flagged flow table.
   - Located in `src/components/`, `server/`, and `src/defender/forecasting.py`.

---

## Canonical Feature Schema (22-Feature Contract)

| Index | Feature Name | Layer | Description |
|-------|--------------|-------|-------------|
| 0 | `source_port` | Flow | L4 Source Port |
| 1 | `destination_port` | Flow | L4 Destination Port |
| 2 | `protocol_number` | Flow | IP Protocol Number (6=TCP, 17=UDP) |
| 3 | `tcp_flag_bitmask` | Flow | Encoded TCP Flag Combination |
| 4 | `tcp_syn` | Flow | SYN Flag Indicator |
| 5 | `tcp_ack` | Flow | ACK Flag Indicator |
| 6 | `tcp_fin` | Flow | FIN Flag Indicator |
| 7 | `tcp_rst` | Flow | RST Flag Indicator |
| 8 | `tcp_psh` | Flow | PSH Flag Indicator |
| 9 | `tcp_urg` | Flow | URG Flag Indicator |
| 10 | `bytes_per_flow` | Flow | Total Transferred Bytes |
| 11 | `packets_per_flow` | Flow | Total Packet Count |
| 12 | `flow_duration_ms` | Flow | Flow Duration in Milliseconds |
| 13 | `iat_mean_ms` | Flow | Mean Inter-Arrival Time |
| 14 | `iat_variance_ms` | Flow | Inter-Arrival Time Variance |
| 15 | `iat_max_ms` | Flow | Maximum Inter-Arrival Time |
| 16 | `bidirectional_flow_ratio` | Flow | Ratio of Fwd to Bwd Packets |
| 17 | `ttl_mean` | Packet | Mean IP Time-To-Live |
| 18 | `ttl_variance` | Packet | IP TTL Variance |
| 19 | `tcp_window_mean` | Packet | Mean TCP Window Size |
| 20 | `payload_size_mean` | Packet | Mean Application Payload Size |
| 21 | `retransmission_count` | Packet | TCP Retransmission Count |

---

## Security & Isolation Boundaries

- **Input Path Validation**: All CSV and PCAP ingestion inputs passed to `/api/v1/ingest` and `/api/v1/forecast` are sanitized via path containment checks ensuring no path traversal (`/etc/passwd`, relative escapes) can be executed.
- **Offline Inference**: All model inference runs strictly locally via PyTorch state dictionaries without external network dependencies.
