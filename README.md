# Defender Console — SIH26153

**Owner:** Syed Nomaan Zaheer  
**Problem:** AI-Based Network Attack Forecasting from Network Traffic Data  
**Scope:** Official-data temporal forecasting, MITRE ATT&CK stage mapping, packet/flow evidence, explainability, and secure offline analyst interface.

This repository is the integrated SIH26153 MVP. It is an offline-first Streamlit system that accepts a flow CSV, produces a K-step infiltration-risk timeline, identifies a MITRE-aligned stage, lists evidence, and displays flagged flows. It includes a validated local LSTM artifact trained on official CSE-CIC-IDS2018 Wednesday data and evaluated on Thursday data, plus a transparent fallback and a separately labelled synthetic-provenance demo artifact. No source edits, cloud credentials, model downloads, or external API calls are required.

> **Scientific boundary:** the real-data benchmark is a cross-day public-dataset experiment, not a deployment guarantee. Its first measured result is retained honestly even though the LSTM does not yet outperform LogisticRegression on F1 or false-positive rate. The interface labels model provenance and keeps the transparent fallback available.

## Run it

From this directory, use a clean virtual environment:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
streamlit run app.py
```

Then open the local URL printed by Streamlit. Select **Use bundled deterministic demo** to see the complete experience immediately, or upload a CSV from the sidebar. The CLI is also available:

```bash
zaheer-defender
zaheer-defender path/to/flows.csv --steps 5
```

Run the tests with `pytest` after installing the test extra:

```bash
pip install -e '.[test]'
pytest
```

## Accepted CSV contract

The loader accepts common CIC/CTU-style aliases and canonicalises them. Missing optional fields are safely filled with zero so the dashboard can work with a partial flow export. The following canonical features are supported:

| Group | Features |
|---|---|
| Identity and transport | `source_port`, `destination_port`, `protocol_number`, `tcp_syn`, `tcp_ack`, `tcp_fin`, `tcp_rst`, `tcp_psh`, `tcp_urg` |
| Flow statistics | `bytes_per_flow`, `packets_per_flow`, `flow_duration_ms`, `iat_mean_ms`, `iat_variance_ms`, `iat_max_ms`, `bidirectional_flow_ratio` |
| Packet-derived statistics | `ttl_mean`, `ttl_variance`, `tcp_window_mean`, `payload_size_mean`, `retransmission_count` |

A textual `tcp_flags` or `flags` column is also understood for standard `S`, `A`, `F`, `R`, `P`, and `U` indicators. Malformed numeric cells become zero; infinities are removed; extreme values are clipped. Uploads are capped at 50 MB and 500,000 rows and are processed in memory.

## Integrated three-coder build

This directory includes the shared integration contract, official PCAP extraction utilities, real-data cross-day trainer, and local Jahangir adapter. The Streamlit sidebar offers **Validated real-data LSTM artifact**, **Transparent offline scorer**, and **Jahangir LSTM demo artifact** engines. See `docs/INTEGRATED_HANDOFF.md` and `docs/REAL_DATA_BENCHMARK.md` for provenance and limitations.

The validated artifact is trained on official CSE-CIC-IDS2018 Wednesday data and held out on Thursday data. The original Jahangir weights remain labelled **synthetic-demo provenance** and are never used as evidence for the real benchmark.

## Project map

| Path | Purpose |
|---|---|
| `app.py` | Streamlit dashboard and presentation layer |
| `src/zaheer_sih26153/traffic.py` | In-memory, bounded CSV ingestion and canonical feature extraction |
| `src/zaheer_sih26153/forecasting.py` | Offline scoring, forward curve, MITRE stage mapping, and explanations |
| `src/zaheer_sih26153/integration_contract.py` | Shared 22-feature schema and forecast payload validation |
| `src/zaheer_sih26153/world_model_adapter.py` | Local Jahangir LSTM adapter with explicit provenance |
| `artifacts/cross_day_benchmark/` | Official-data LSTM weights, scaler, config, and benchmark metrics
| `artifacts/models/` | Packaged local Jahangir synthetic-demo weights and configuration |
| `vendor/` | Traceable snapshots of Abdul’s and Jahangir’s submitted work |
| `src/zaheer_sih26153/cli.py` | Local command-line runner |
| `tests/` | Security and behaviour regression tests |
| `docs/` | Submission-facing notes and integration guidance |
| `artifacts/sample_data/` | Safe local sample input |

## MITRE mapping logic

The current mapping is a transparent evidence heuristic over traffic features. Reconnaissance is associated with SYN/RST-heavy, low-reciprocity probing; Initial Access with completed handshakes and payload-bearing flows; Lateral Movement with internal-service port activity and bidirectional traffic; Command and Control with persistent, timing-regular two-way communication; and Exfiltration with larger payloads, bytes, and sustained flow activity. These are detection cues, not proof of adversary intent. The production submission should preserve this caveat and replace heuristic evidence with validated model outputs and citations where required.

## Integration contract for Jahangir’s model

The dashboard expects a forecast result with four pieces: a table containing `forecast_step` and `infiltration_probability`; one predicted stage from the five supported stages; an explanation table containing `feature`, `contribution`, and `stage`; and a flagged-flow table containing `flow_index`, `infiltration_probability`, and `predicted_stage`. The model adapter must remain local, deterministic under a fixed seed, and explicit about artifact provenance. No model should be loaded from a URL at runtime.

## Security posture

This project intentionally avoids several common AI-generated cybersecurity leaks. It has no API keys, telemetry, remote inference, shell execution, dynamic imports, `eval`, `exec`, temporary file paths derived from uploads, or unsafe deserialisation. Uploaded bytes are size-limited, parsed only as CSV, and discarded after processing. The UI never claims a heuristic score is a trained model result. For deployment, pin dependency versions, run as a non-root user, restrict the listener to localhost or an authenticated reverse proxy, and scan the repository before publication.

## Submission checklist

Before sending this repository to the team leader, run the tests, run the CLI demo, launch Streamlit, upload one representative flow CSV, capture the timeline and explanation panel, and retain `docs/REAL_DATA_BENCHMARK.md` with the measured cross-day metrics. Do not invent F1, precision, recall, or FPR values. The first measured LSTM result is not superior to the baseline and must be presented exactly that way.

## Problem traceability

This contribution implements the integrated MVP path for flow/packet feature fusion, forward infiltration probability, MITRE-stage annotation, evidence display, real-data baseline/world-model training, and an offline demonstration interface. The three workstreams are connected through the shared contract. The remaining full-compliance items are complete per-flow PCAP/CSV five-tuple joining, model-specific attribution, calibration/drift controls, and broader deployment validation; these are documented as next engineering gates rather than claimed as finished.
