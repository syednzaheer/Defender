# DEFENDER — Technical Presentation Deck (5 Slides Max)

> **SIH 2026 — PS 26153 (NTRO)**  
> **Title:** AI based Network Attack Forecasting from Network Traffic Data  
> **Format:** 5-Slide Technical Executive Overview  

---

## Slide 1: Problem Statement & Innovation Vision

### Problem Statement (SIH PS 26153 — NTRO)
*"AI based Network Attack Forecasting from Network Traffic Data"*

### The Core Challenge
- **Limitations of Traditional IDS:** Static signatures and isolated point-in-time flow classifiers evaluate traffic *after* an alert occurs, providing zero lead time.
- **The DEFENDER Paradigm:** Network security is a continuous physical sequence. By learning temporal state-transition dynamics $P(S_{t+1} \mid S_t)$, DEFENDER forecasts attacker trajectory $K$ steps into the future *before* compromise is completed.

### Key Value Proposition
1. **Predictive Lead Time:** Early warning signals prior to lateral movement or data exfiltration.
2. **Unified State Representation:** 22-dimensional feature schema unifying flow metadata with packet-header observations.
3. **Analyst Decision Support:** Actionable MITRE stage mapping, perturbation feature attributions, and offline assistance.

---

## Slide 2: Technical Architecture & 22-Feature World Model

```
NETWORK TELEMETRY ──► 22-DIMENSIONAL STATE S_t ──► SLIDING WINDOW (W=10) ──► PYTORCH LSTM ──► K-STEP ROLLOUT
```

### 1. Canonical State Schema ($S_t \in \mathbb{R}^{22}$)
- **17 Flow Features:** Ports, Protocol, TCP Flag Bitmask, individual TCP Flags (SYN/ACK/FIN/RST/PSH/URG), Volume, Packet Counts, Flow Duration, IAT Statistics (Mean, Variance, Max), Bidirectional Ratio.
- **5 Packet Features:** TTL Mean/Variance, TCP Window Mean, Payload Size Mean, Retransmissions.

### 2. PyTorch LSTM Engine Specification
- **Model:** 2-Layer PyTorch LSTM (Input: 22, Hidden: 64, Dropout: 0.1).
- **Dual Output Heads:**
  - *Next-State Head:* Predicts physical state vector $\hat{S}_{t+1} \in \mathbb{R}^{22}$ (MSE Loss).
  - *Hazard Head:* Predicts infiltration probability $P \in [0, 1]$ (BCE Loss).
- **Autoregressive Rollout:** Recursively feeds predicted state $\hat{S}_{t+k}$ into the input window to generate $K$-step probability trajectories.

---

## Slide 3: Explainability & MITRE ATT&CK Stage Mapping

### 1. ATT&CK Progression Mapping
Simulated trajectories are mapped across five high-level adversary tactics:
$$\text{Reconnaissance (TA0043)} \longrightarrow \text{Initial Access (TA0001)} \longrightarrow \text{Lateral Movement (TA0008)} \longrightarrow \text{Command \& Control (TA0011)} \longrightarrow \text{Exfiltration (TA0010)}$$

### 2. Perturbation-Based Feature Attribution
- **Methodology:** Measures hazard sensitivity $\Delta P = P(\text{base}) - P(\text{perturbed feature } f_i = 0)$.
- **Analyst Utility:** Highlights exact traffic drivers (e.g. rising TCP SYN ratio or low IAT variance) without requiring black-box game-theoretic approximations.

### 3. Reliability & Data Quality Protocols
- Flags missing packet headers, evaluates novelty fractions, and outputs `defer_recommended: true` when input data deviates from learned training distributions.

---

## Slide 4: Empirical Benchmark & Dataset Provenance

### Dataset Registry Status
- **VERIFIED / RUNNABLE:** `CSE-CIC-IDS2018` (Official AWS Open Data).
- **ADAPTER-READY:** `CIC-IDS2017`, `CICIoT2023`, `UNSW-NB15`, `CTU-13`.
- **REFERENCE ONLY:** `LANL Authentication`, `DARPA IDS`.

### Canonical Cross-Day Empirical Results
*Split: Wednesday-28-02-2018 (Train) $\to$ Thursday-01-03-2018 (Held-Out Test)*

| Model | Precision | Recall | F1 Score | FPR | Paradigm |
|---|---|---|---|---|---|
| **Logistic Regression Baseline** | 0.2673 | 0.5744 | **0.3649** | **61.54%** | Point Classifier |
| **Temporal LSTM World Model** | 0.2456 | **0.6037** | 0.3492 | 72.50% | Sequence State Transitions $P(S_{t+1}\mid S_t)$ |

*Scientific Honesty Note:* The LSTM improves attack row recall ($60.37\%$), capturing progressive threat sequences. Real-world domain drift between Wednesday infiltration and Thursday attack types is documented transparently.

---

## Slide 5: System Implementation & Production Readiness

### Complete Stack Implementation
- **Frontend:** React 19, Vite 7, Framer Motion, Recharts, Lucide Icons, Cyber Chat UI.
- **Backend API:** Express 4, Node.js, tRPC, cross-platform Python subprocess bridge.
- **ML Engine:** Python 3.10+, PyTorch 2.x, Pandas, NumPy.
- **CYPER Assistant:** Offline knowledge retrieval engine with 35+ domain modules.

### Verification & Ship-Readiness
- [x] Static Type Checking (`npm run check`) — **PASSED**
- [x] Frontend & API Unit Tests (`npm test`) — **PASSED (4/4 Files)**
- [x] Python Engine Tests (`python -m pytest`) — **PASSED (7/7 Tests)**
- [x] Production Build (`npm run build`) — **PASSED**
- [x] 100% Local / Offline Execution Certified
