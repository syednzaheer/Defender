# DEFENDER Technical Architecture & Design Document

> **SIH 2026 — PS 26153 (NTRO)**  
> **System Name:** DEFENDER — AI-Based Network Attack Forecasting System  
> **Document Scope:** System Architecture, Data Pipelines, PyTorch World Model, API Boundaries & Reliability Protocols  

---

## 1. High-Level Architecture Overview

DEFENDER is architected as an offline, multi-tier decision-support application. It bridges web-based analyst interaction (React/Vite), backend telemetry validation & routing (Express/Node.js), and a deep sequence forecasting engine (PyTorch/Python).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                               │
│  React 19 + Vite 7 (client/src/original)                                    │
│  - Cyber Binary Splash (Entry Portal)                                       │
│  - Forecast Workspace & Dynamic Recharts Trajectory Timeline                │
│  - MITRE ATT&CK Stage Indicator & Perturbation Attribution Panel            │
│  - Flagged Flows Table & Technical Evidence Viewer                          │
│  - CYPER Analyst Assistant (Cyber Chat UI + Knowledge Retrieval Engine)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP POST /api/v1/forecast (JSON / Base64 Telemetry)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API & BRIDGE LAYER                             │
│  Express 4 + Node.js (server/)                                              │
│  - Header & File-Type Safety Validation (.csv, .pcap, .pcapng)              │
│  - Bounded Memory & Temporary Disk Handler (50 MB Max Limit)                │
│  - Cross-Platform Python Subprocess Bridge (`runBridge`)                    │
│  - Deterministic Transparent Fallback Handler                               │
│  - CYPER Assistant Route handler (`POST /api/v1/cyper/chat`)                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Subprocess stdin/stdout JSON Protocol
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MODEL INFERENCE LAYER                            │
│  PyTorch 2.x + Pandas + NumPy (Defender/Backend/models/python)               │
│  - Canonical 22-Feature Matrix Extraction & Preprocessing                   │
│  - Sliding Sequence Window Construction (W = 10)                            │
│  - Two-Layer PyTorch LSTM World Model (Input: 22, Hidden: 64, Dropout: 0.1)  │
│  - Dual Output Heads: Linear Next-State Head Ŝ_{t+1} & Sigmoid Hazard Head  │
│  - Autoregressive K-Step Forward Simulation Engine                          │
│  - Perturbation-Based Feature Attribution                                   │
│  - Reliability Assessment & Novelty Detection Module                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Telemetry Ingestion & State Representation

DEFENDER ingests both flow summary exports (CSV) and raw packet captures (PCAP/PCAPNG). Telemetry records are parsed, validated, and normalized into a continuous 22-dimensional network state vector $S_t$:

$$S_t = \begin{bmatrix} f_{\text{flow\_1}}, f_{\text{flow\_2}}, \dots, f_{\text{flow\_17}}, p_{\text{pkt\_1}}, \dots, p_{\text{pkt\_5}} \end{bmatrix}^T \in \mathbb{R}^{22}$$

### Feature Schema Composition
1. **Flow-Level Telemetry (17 Features):** Source Port, Destination Port, Protocol Number, TCP Flag Bitmask, TCP SYN, TCP ACK, TCP FIN, TCP RST, TCP PSH, TCP URG, Bytes per Flow, Packets per Flow, Flow Duration (ms), IAT Mean (ms), IAT Variance (ms), IAT Max (ms), Bidirectional Flow Ratio.
2. **Packet-Level Telemetry (5 Features):** TTL Mean, TTL Variance, TCP Window Mean, Payload Size Mean, Retransmission Count.

When lower-level packet fields are absent (e.g. basic NetFlow CSVs), the engine marks packet fields as missing and evaluates a reliability score (`defer_recommended: true`) rather than generating synthetic packet attributes.

---

## 3. World Model & Temporal Simulation Engine

### State Dynamics Formulation
Traditional intrusion detection evaluates isolated observations $P(Y \mid X_t)$. DEFENDER models state-transition dynamics:

$$P(S_{t+1} \mid S_t, S_{t-1}, \dots, S_{t-W+1})$$

Where $W = 10$ is the sliding temporal history window.

### Network LSTM Architecture
* **Encoder:** 2-Layer LSTM with 64 hidden units per layer and $0.1$ dropout.
* **State Head:** Linear layer mapping hidden state $h_t \in \mathbb{R}^{64} \to \hat{S}_{t+1} \in \mathbb{R}^{22}$.
* **Hazard Head:** Multi-layer Perceptron ($64 \to 32 \to 1$) with ReLU activation and Sigmoid output producing infiltration probability $P_t \in [0, 1]$.

### Autoregressive Rollout Algorithm
For a forecast horizon of $K$ steps ($1 \le K \le 10$):

$$\text{For } k = 1 \dots K: \quad (\hat{S}_{t+k}, P_k) = \text{LSTM}(\mathbf{W}_{k-1}), \quad \mathbf{W}_k = \text{Concat}(\mathbf{W}_{k-1}[1:], \hat{S}_{t+k})$$

The output is a predicted threat trajectory curve $\mathbf{P} = [P_1, P_2, \dots, P_K]$ alongside predicted state evolution $[\hat{S}_{t+1}, \dots, \hat{S}_{t+K}]$.

---

## 4. MITRE Stage Mapping & Feature Attribution

### Stage Classification Rules
The predicted state trajectory is classified into five MITRE ATT&CK stages using heuristic weighted linear scoring on predicted feature values:
* **Reconnaissance (TA0043):** Driven by high `tcp_syn`, `source_port` dispersion, and short `flow_duration_ms`.
* **Initial Access (TA0001):** Driven by targeted `destination_port` access and TCP handshake anomalies.
* **Lateral Movement (TA0008):** Driven by east-west traffic expansion and `bidirectional_flow_ratio` changes.
* **Command & Control (TA0011):** Driven by low `iat_variance_ms` and periodic low-volume bursts.
* **Exfiltration (TA0010):** Driven by elevated `bytes_per_flow` outbound volume.

### Perturbation-Based Sensitivity Analysis
To explain predictions without expensive game-theoretic SHAP sampling, DEFENDER measures local feature sensitivity by perturbing feature vector elements in the state window:

$$\text{Contribution}(f_i) = P(\text{base window}) - P(\text{window with } f_i = 0)$$

The resulting contributions are ranked to highlight top driving features for analyst review.

---

## 5. Security, Isolation & Reliability Boundaries

1. **Subprocess Isolation:** The Express server invokes the Python engine via a strict stdin/stdout JSON interface using temporary file descriptors. Input file paths are strictly validated within `artifacts/uploads` before process execution.
2. **Deterministic Fallback:** If the PyTorch model artifact or Python environment is unavailable, the API returns a transparent fallback benchmark derived from empirical CSE-CIC-IDS2018 evaluation, ensuring the dashboard walkthrough remains usable.
3. **Data Safety:** Uploaded telemetry files are processed in-memory or on ephemeral temporary storage, which is purged immediately in a `finally` execution block.
4. **Offline Autonomy:** All forecasting, visualizations, and CYPER assistant responses operate 100% locally without cloud API dependencies.
