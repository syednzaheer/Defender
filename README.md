# DEFENDER — AI-Based Network Attack Forecasting System

**NTRO / SIH Problem Statement 26153:** AI-Based Network Attack Forecasting from Network Traffic Data  
**Architecture:** React 18 + Vite (Frontend) | Express / Node.js (API Server) | PyTorch (Temporal ML Engine)  
**Scope:** Real-data temporal state-transition forecasting $P(S_{t+1} \mid S_t)$, 22-feature flow/packet fusion contract, $K$-step forward infiltration simulation, MITRE ATT&CK kill-chain mapping, perturbation-based feature attributions, and hardened offline analyst workspace.

---

## 🚀 Quick Start Guide for Evaluators & Judges

Get Defender running in under 5 minutes without external network dependencies.

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.11.9)
- Node.js 18+ (Tested on v24.15.0)

### 2. Environment Setup & Package Installation
```bash
# Create clean Python virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# Upgrade pip and install Defender package with PyTorch & test extras
python -m pip install --upgrade pip
pip install -e '.[world-model,test]'
npm install
```

### 3. Launch React + Express Analyst Workspace (Recommended)
```bash
# Terminal 1: Start hardened Express backend (Port 4000)
npm run server

# Terminal 2: Start Vite React Frontend (Port 5173)
npm run dev
```
Open **http://localhost:5173/** in your browser.  
Click **[ ENTER DEFENDER ]** $\to$ **[ Run Forecast ]** $\to$ **[ USE SAMPLE DATA ]** $\to$ **[ RUN FORECAST SIMULATION ]** to execute PyTorch model inference!

### 4. Secondary Offline Interfaces & Tools
```bash
# Option A — Launch Streamlit offline console:
streamlit run app.py

# Option B — Command-Line (CLI) smoke test:
defender-cli --steps 5
```

### 5. Run Test Suite & Build Verification
```bash
pytest
npm run build
```

---

## 🎯 What is Defender & Why Predictive Defense?

Traditional Intrusion Detection Systems (IDS) ask a **static** question:  
> *"Is this individual packet or flow malicious?"*

**Defender** asks a **predictive** question:  
> *"Given observed past network behavior $S_t$, what is the likely network state $S_{t+1}$ and infiltration progression over the next $K$ time windows?"*

An intrusion is an evolving temporal process:
$$\text{Reconnaissance } (\text{TA0043}) \longrightarrow \text{Initial Access } (\text{TA0001}) \longrightarrow \text{Lateral Movement } (\text{TA0008}) \longrightarrow \text{Command \& Control } (\text{TA0011}) \longrightarrow \text{Exfiltration } (\text{TA0010})$$

Defender learns state transition dynamics $P(S_{t+1} \mid S_t)$ to forecast attack progression **before compromise is completed**, giving security operations teams critical lead-time for preemptive isolation.

---

## 🛠️ How Defender Works (5-Step Pipeline)

1. **Ingest Telemetry**: Dual-level feature extraction combining 17 Flow-Level IPFIX features (source/dest ports, 6-flag TCP bitmask `[SYN, ACK, FIN, RST, PSH, URG]`, IAT mean/variance/max, bytes, packets, bidirectional ratio) and 5 Packet-Level PCAP features (TTL mean/variance, TCP window size, payload size mean, retransmission count).
2. **Represent State ($S_t$)**: Constructs a 22-dimensional normalized state vector $S_t \in \mathbb{R}^{22}$ over timestamped sliding sequence windows ($W=10$).
3. **Learn State Dynamics**: 2-layer PyTorch LSTM model with dual heads: (1) Linear Next-State Head $\hat{S}_{t+1}$ and (2) Sigmoid Hazard Head $P(\text{malicious})$.
4. **Autoregressive $K$-Step Rollout**: Simulates trajectory $K$ time windows ahead by feeding predicted next state $\hat{S}_{t+1}$ back into the sequence window.
5. **Map & Explain**: Maps predicted risk trajectories onto MITRE ATT&CK stages and computes perturbation-based feature attributions ($\Delta P$ per feature when zeroed out).

---

## 📊 Real-Data Benchmark (CSE-CIC-IDS2018) & Scientific Honesty

Defender is trained and evaluated on official public datasets from the **AWS Open Data Registry**:
- **Training Domain**: `Wednesday-28-02-2018_TrafficForML_CICFlowMeter.csv` (Infiltration Traffic) + `UCAP172.31.69.28` PCAP member (`SHA-256: 45b2ee7a1ff7018f52c85a6ab012d8e3dd981b290b58d7c7df550f52a62d61be`).
- **Held-Out Evaluation Domain**: `Thursday-01-03-2018_TrafficForML_CICFlowMeter.csv` (Web Attacks / DOS) + `UCAP172.31.69.28` PCAP member (`SHA-256: d1ac6b0bc434843d5d96ca3b7ad3792cc966ca65e327dedb11b64ee4c941fc77`).

### Measured Cross-Day Empirical Results

| Model Architecture | F1 Score | Precision | Recall | False Positive Rate | Temporal Modeling |
|---|---:|---:|---:|---:|---|
| **Logistic Regression Baseline** | 0.3649 | 0.2673 | 0.5744 | 61.54% | None (Static Classifier) |
| **PyTorch LSTM World Model** | 0.3492 | 0.2456 | 0.6037 | 72.50% | $P(S_{t+1} \mid S_t)$ Sequence Dynamics |

> **Scientific Honesty Disclosure:** The empirical cross-day benchmark reflects temporal distribution drift between Wednesday and Thursday traffic splits. The LSTM recovered more attack rows but generated elevated false-positive rates. These results are recorded honestly without data fabrication to demonstrate realistic cross-day holdout performance.

---

## 🏗️ Repository Architecture

```
Defender/
├── app.py                      # Offline Streamlit dashboard (secondary Python UI)
├── pyproject.toml              # Python package metadata & dependencies (setuptools)
├── package.json                # Node.js Express & React Vite dependencies
├── generate_pcap.py            # Scapy PCAP stream generator
├── artifacts/                  # Persisted model weights, configs, and metrics
│   ├── cross_day_benchmark/    # Official CSE-CIC-IDS2018 PyTorch LSTM weights & metrics
│   ├── models/                 # Demo PyTorch LSTM model weights & config
│   ├── real_benchmark/         # Real fused index data and feature schema
│   └── sample_data/            # Local demo CSV flow data
├── docs/                       # Architectural specs & empirical benchmark reports
│   └── architecture/           # System design & integration overview
├── public/                     # Static assets & downloadable sample_traffic.csv
├── scripts/                    # Training, evaluation, and PR-curve calibration scripts
├── server/                     # Express REST API & Python subprocess bridge
│   ├── index.js                # Express API server with path containment checks (Port 4000)
│   └── bridge.py               # Python bridge invoking src/defender
├── src/                        # Core source code
│   ├── components/             # React UI components (Sidebar, Workspace, Sections)
│   ├── data/                   # Shared UI constants
│   └── defender/               # Core Python package (traffic, forecasting, world_model_adapter)
├── vendor/                     # Subsystem modules
│   ├── data_pipeline/          # Feature extraction & preprocessing
│   └── world_model_research/   # LSTM model research & rollout notebooks
└── tests/                      # Pytest regression suite
```

---

## 🔒 Security Posture & Hardening

- **100% Offline Operation**: No cloud API keys, remote inference, telemetry, or external network requests.
- **Path Traversal Protection**: Backend file path inputs (`csv_path`) are strictly validated against project root containment to prevent unauthorized file access.
- **Bounded Input Validation**: Uploads are capped at 50 MB / 500,000 rows, parsed strictly as numeric telemetry data, and discarded after in-memory processing.
- **Safe Deserialization**: PyTorch state dictionary is loaded with `weights_only=True` from checked local file paths. No dynamic `eval` or `exec`.

---

## 📜 Problem Traceability & Submission Checklist

- [x] Network traffic telemetry ingestion (CSV flow & Scapy PCAP)
- [x] Dual-level 22-feature contract (17 flow + 5 packet)
- [x] Timestamped temporal network state representation $S_t$
- [x] Temporal state-transition learning $P(S_{t+1} \mid S_t)$ via PyTorch LSTM
- [x] Autoregressive $K$-step forward infiltration trajectory rollout
- [x] MITRE ATT&CK kill-chain stage mapping (Recon, Access, Lateral, C2, Exfil)
- [x] Perturbation-based feature attributions
- [x] Honest empirical benchmark vs. Logistic Regression baseline
- [x] Working offline web interface (React Product Workspace + Framer Motion + Sidebar)
- [x] Automated pytest test suite passing
