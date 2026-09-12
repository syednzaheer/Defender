# DEFENDER — AI-Based Network Attack Forecasting

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID:** PS 26153  
> **Title:** AI based Network Attack Forecasting from Network Traffic Data  
> **Organization:** National Technical Research Organisation (NTRO)  
> **Category:** Software / Cybersecurity / AI Decision Support  

---

## Executive Summary

**DEFENDER** is an AI-driven network attack forecasting system that models evolving network behavior over time to predict attacker progression *before* compromise is completed.

Unlike traditional Intrusion Detection Systems (IDS) that evaluate isolated packets or static flow records, DEFENDER constructs a continuous, **22-dimensional network state representation** $S_t$, learns temporal state-transition dynamics $P(S_{t+1} \mid S_t)$ using a **two-layer PyTorch LSTM**, and executes an **autoregressive K-step forward simulation** to estimate future infiltration trajectories. The predicted trajectory is mapped to **MITRE ATT&CK stages**, backed by **perturbation-based feature attributions**, and presented in an offline, analyst-friendly decision support dashboard.

```
NETWORK TELEMETRY (CSV / PCAP)
           │
           ▼
22-DIMENSIONAL STATE VECTOR (S_t)
[17 Flow Features + 5 Packet Features]
           │
           ▼
SLIDING TEMPORAL WINDOW (W = 10)
           │
           ▼
TWO-LAYER PYTORCH LSTM WORLD MODEL
[Input: 22 | Hidden: 64 | Dropout: 0.1]
           │
           ▼
K-STEP AUTOREGRESSIVE ROLLOUT
[Predicted States Ŝ_{t+1}...Ŝ_{t+K} & Hazard Scores]
           │
           ▼
MITRE ATT&CK STAGE MAPPING & FEATURE ATTRIBUTION
           │
           ▼
DEFENDER ANALYST DECISION SUPPORT DASHBOARD
```

---

## Key Differentiators: IDS vs. Predictive Defense

| Feature | Traditional IDS / IPS | Generic Static Classifiers | DEFENDER World-Model Engine |
|---|---|---|---|
| **Primary Question** | "Is this current flow malicious?" | "What is the class of this row?" | "Given state $S_t$, where is network behavior heading over $K$ steps?" |
| **Context Window** | Single packet / flow record | Independent table rows | Sliding temporal window ($W = 10$ sequence snapshots) |
| **Output Type** | Static binary verdict / alert | Class label | Trajectory curve $[P_1, P_2, \dots, P_K]$ & stage progression |
| **Lead Time** | Zero (reactive / post-detection) | Zero (reactive point-in-time) | Predictive lead time prior to incident completion |
| **Explainability** | Signature rule ID / static heuristic | Feature importance global weights | Local perturbation sensitivity on simulated future state |

---

## System Architecture & Technical Specification

### 1. Canonical 22-Feature State Representation

DEFENDER unifies flow-level telemetry (volume, timing, ports, flags) with lower-level packet header observations into a canonical 22-element vector $S_t$:

* **Flow-Level Telemetry (17 features):** `source_port`, `destination_port`, `protocol_number`, `tcp_flag_bitmask`, `tcp_syn`, `tcp_ack`, `tcp_fin`, `tcp_rst`, `tcp_psh`, `tcp_urg`, `bytes_per_flow`, `packets_per_flow`, `flow_duration_ms`, `iat_mean_ms`, `iat_variance_ms`, `iat_max_ms`, `bidirectional_flow_ratio`.
* **Packet-Level Telemetry (5 features):** `ttl_mean`, `ttl_variance`, `tcp_window_mean`, `payload_size_mean`, `retransmission_count`.

### 2. PyTorch LSTM World Model

* **Architecture:** 2-layer PyTorch LSTM, input dimension 22, hidden dimension 64, dropout 0.1.
* **Dual Output Heads:**
  1. **Linear Next-State Head:** Predicts the 22-dimensional next state vector $\hat{S}_{t+1}$.
  2. **Sigmoid Hazard Head:** Predicts the infiltration hazard probability $P(\text{malicious})$.
* **Training Objective:** Multi-task loss $L = L_{\text{state}} + \lambda L_{\text{hazard}}$, balancing physical state trajectory accuracy (MSE) with threat classification (BCE).

### 3. Autoregressive K-Step Forward Simulation

Starting from observed sequence window $[S_{t-9}, \dots, S_t]$, step 1 predicts $\hat{S}_{t+1}$ and probability $P_1$. Step 2 feeds $\hat{S}_{t+1}$ back into the temporal window to predict $\hat{S}_{t+2}$ and $P_2$, repeating for $K$ steps ($1 \le K \le 10$).

### 4. MITRE ATT&CK Stage Mapping

Simulated trajectories are mapped across five progression stages:
1. **Reconnaissance (TA0043):** Active scanning, port probing, one-sided TCP attempts.
2. **Initial Access (TA0001):** Foothold attempts, unexpected service connections.
3. **Lateral Movement (TA0008):** Internal east-west connection proliferation.
4. **Command & Control (TA0011):** Low-variance, periodic beaconing patterns.
5. **Exfiltration (TA0010):** Anomalous outbound volume transfers.

### 5. Perturbation-Based Feature Attribution

Feature drivers are calculated by zeroing/perturbing specific state components in the temporal window and evaluating the output hazard delta: $\Delta P = P(\text{base}) - P(\text{perturbed})$.  
*Note: This is perturbation-based sensitivity analysis, explicitly distinguished from Shapley value (SHAP) coalitions.*

---

## Dataset Registry & Benchmark Results

### Dataset Support Status

1. **VERIFIED / RUNNABLE:**  
   * **CSE-CIC-IDS2018 (Official AWS Open Data):** Canonical dataset for model training, state-dict weights, and held-out cross-day evaluation.
2. **ADAPTER-READY / COMPATIBLE:**  
   * `CIC-IDS2017`, `CICIoT2023`, `UNSW-NB15`, `CTU-13` (mapped into the 22-feature schema via standard ingestion adapters).
3. **REFERENCE ONLY:**  
   * `LANL Authentication Dataset`, `DARPA IDS Archive` (used for taxonomy validation and threat intelligence benchmarking).

### Canonical Empirical Cross-Day Benchmark

Evaluated on the official chronological holdout split:  
* **Training Split:** `Wednesday-28-02-2018` (Infiltration traffic)  
* **Held-Out Test Split:** `Thursday-01-03-2018` (Held-out cross-day traffic)

| Model Architecture | Precision | Recall | F1 Score | False Positive Rate (FPR) | Modeling Paradigm |
|---|---|---|---|---|---|
| **Logistic Regression Baseline** | 0.2673 | 0.5744 | **0.3649** | **61.54%** | Static Point Classifier |
| **Temporal LSTM World Model** | 0.2456 | **0.6037** | 0.3492 | 72.50% | Sequence State Transitions $P(S_{t+1}\mid S_t)$ |

*Honest Benchmark Disclosure:* The temporal LSTM improves attack row recall ($0.6037$ vs $0.5744$), capturing progressive threat activity. However, cross-day distribution drift between Wednesday infiltration and Thursday web/DOS attack profiles resulted in elevated false positives ($72.50\%$). DEFENDER exposes these empirical findings transparently without data fabrication.

---

## Submission Artifacts

Per SIH PS 26153 submission guidelines:
- **Source Code Repository:** Complete React/TypeScript frontend, Express server, Python PyTorch engine, and test suite.
- **README / Setup Guide:** [`README.md`](README.md) (this document).
- **Architecture Specification (2 Pages Max):** [`ARCHITECTURE.md`](ARCHITECTURE.md).
- **Demo Script (2 Minutes Max):** [`docs/submission/DEMO_SCRIPT.md`](docs/submission/DEMO_SCRIPT.md).
- **Technical Presentation (5 Slides Max):** [`docs/submission/PRESENTATION_OUTLINE.md`](docs/submission/PRESENTATION_OUTLINE.md).

---

## Quick Start & Installation

### Prerequisites
- **Node.js:** v20.0.0 or higher
- **npm:** v10.0.0 or higher
- **Python:** v3.10 or higher (with `torch`, `pandas`, `numpy`)

### 1. Installation
```bash
# Clone the repository and install Node.js dependencies
npm install

# Create the local Python environment used by the forecast engine
npm run setup:python
```

### 2. Static Type Check & Code Verification
```bash
npm run check
```

### 3. Run Automated Unit & Integration Tests
```bash
# Run Vitest suite (frontend & API routes)
npm test

# Run the Python model and ingestion suite
.venv/bin/python -m pytest Defender/Backend/models/python/tests

# Verify the committed LSTM artifact and CSV path
npm run smoke:python
```

### 4. Start Development Server
```bash
npm run dev
```
Open the local URL (default: `http://localhost:3000`).

The forecast route reports a clear setup error when the local Python engine is
not installed; it does not present fabricated model output as a successful run.

### 5. Production Build & Execution
```bash
npm run build
npm start
```

---

## How to Run the Demo & Forecast

1. Open the application in your browser and click **Enter Defender**.
2. Navigate to **Run Forecast** in the sidebar.
3. **Quick Demo Mode:** Click **Run Defender Demo** to execute the 22-feature state extraction, PyTorch LSTM inference, K-step rollout, MITRE stage mapping, and perturbation attribution.
4. **CSV / PCAP File Ingestion:** Select **Upload Custom Telemetry**, upload a CSV or PCAP file (up to 50 MB), and view live local model predictions.
5. **CYPER Assistant Interaction:** Open **Cyber Chat** in the bottom-right or sidebar to ask natural-language questions about network concepts, attack stages, feature attributions, or project architecture.

---

## Repository Structure

```
Defender/
├── application/
│   ├── client/                  # React + Vite dashboard & Cyber Chat UI
│   │   ├── src/
│   │   │   ├── original/        # Landing page, forecast workspace, evidence charts
│   │   │   └── cyperbot/        # CYPER offline assistant engine & knowledge base
│   ├── server/                  # Express server, tRPC API & Python subprocess bridge
│   └── shared/                  # Shared TypeScript types & constants
├── Defender/Backend/models/     # Python ML engine
│   ├── python/defender/         # State canonicalizer, LSTM model, rollout & attribution
│   └── artifacts/               # PyTorch state dicts, configs & benchmark metrics
├── docs/                        # Submission artifacts
│   ├── ARCHITECTURE.md          # 2-page architecture specification
│   └── submission/              # Demo video script & 5-slide presentation outline
├── package.json
└── README.md
```

---

## Scope & Limitations

1. **Decision Support Focus:** DEFENDER provides prioritization evidence and trajectory warnings. It is an analyst aid, not an autonomous block engine.
2. **Missing Packet Fields:** When flow-only CSVs lack lower-level packet headers (e.g. TTL or TCP window size), DEFENDER records packet features as missing and computes reliability metadata (`defer_recommended`) rather than hallucinating values.
3. **Offline Execution:** Core inference and CYPER assistant responses run completely locally without cloud API dependencies.

---

## License

This project is licensed under the MIT License. See `package.json` for details.
