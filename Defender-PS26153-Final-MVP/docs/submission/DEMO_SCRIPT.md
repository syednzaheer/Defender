# DEFENDER — 2-Minute Hackathon Presentation & Video Script

> **SIH 2026 — PS 26153 (NTRO)**  
> **Target Video Duration:** $\le 120$ Seconds (2 Minutes)  
> **Key Goal:** Demonstrate AI-based attack forecasting, temporal world-model state transitions, MITRE ATT&CK stage mapping, feature attributions, and local CYPER assistant interaction.

---

## Video Timeline & Voiceover Script

### 0:00 – 0:20 | Segment 1: Problem & Vision (20s)
* **Visual:** Open landing page -> Cyber Binary Splash screen -> Click "Enter Defender".
* **Voiceover:**  
  *"Traditional Intrusion Detection Systems only ask if a single packet or flow is malicious right now. But complex network attacks unfold across multiple stages over time. For SIH Problem Statement 26153, organized by NTRO, we built **DEFENDER** — an AI-based network attack forecasting system that models state transitions and predicts attacker progression before compromise is completed."*

---

### 0:20 – 0:50 | Segment 2: Live Forecast & 22-Feature World Model (30s)
* **Visual:** Navigate to **Run Forecast** -> Click **Run Defender Demo**. Show loading stage animation (Ingest -> Canonical 22-Feature Matrix -> PyTorch LSTM -> K-Step Rollout).
* **Voiceover:**  
  *"Watch our forecasting pipeline in action. DEFENDER ingests telemetry, converts flow and packet attributes into a canonical 22-dimensional state vector, and feeds a 10-step sliding window into a 2-layer PyTorch LSTM. It executes an autoregressive K-step forward simulation, predicting future network states and infiltration probabilities up to 5 steps into the future."*

---

### 0:50 – 1:20 | Segment 3: Evidence, MITRE Stage & Feature Attributions (30s)
* **Visual:** Scroll to the forecast results dashboard. Point cursor to:
  1. The rising **Infiltration Probability Timeline** chart.
  2. The **Predicted MITRE Stage** badge (`Lateral Movement / Command & Control`).
  3. The **Top Driving Features** bar chart (highlighting `tcp_syn_ratio`, `destination_port`, `iat_variance_ms`).
  4. The **Flagged Flows Table**.
* **Voiceover:**  
  *"Here is the decision support dashboard. The probability timeline reveals how risk escalates across future simulated windows. DEFENDER maps this progression directly to MITRE ATT&CK stages and calculates perturbation-based feature attributions so analysts can immediately see which network behaviors are driving the forecast."*

---

### 1:20 – 1:45 | Segment 4: CYPER Offline Assistant & Benchmark Honesty (25s)
* **Visual:** Open **Cyber Chat** in the bottom-right. Type *"Why did the model predict Command & Control?"* -> Show CYPER's instant offline response. Then open **Evidence & Benchmark** page.
* **Voiceover:**  
  *"DEFENDER includes **CYPER**, a built-in offline analyst guide that explains the live forecast, network dynamics, and feature attributions without any cloud API dependency. On our Evidence page, we report honest empirical results on the official CSE-CIC-IDS2018 cross-day benchmark — demonstrating higher attack recall while transparently documenting real-world domain drift."*

---

### 1:45 – 2:00 | Segment 5: Conclusion & Call to Action (15s)
* **Visual:** Switch back to Home screen showing quick start commands (`npm install`, `npm run dev`).
* **Voiceover:**  
  *"DEFENDER is fully local, reproducible, and ready to deploy. Clone it, run the model, and experience the next generation of predictive network defense. Thank you."*

---

## Technical Checklist for Video Recording
- [x] Clear display of 22-dimensional feature extraction.
- [x] Visible 5-step forward infiltration probability timeline.
- [x] Clear rendering of MITRE ATT&CK stage progression.
- [x] Perturbation-based feature attributions panel.
- [x] Interaction with CYPER offline assistant.
- [x] CSE-CIC-IDS2018 cross-day empirical benchmark table displayed.
