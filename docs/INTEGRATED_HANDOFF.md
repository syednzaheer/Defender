# SIH26153 Integrated Handoff

**Owner:** Syed Nomaan Zaheer  
**Integrated contributors:** Abdul Mannan — data pipeline and baseline; Jahangir Ali — LSTM world-model core; Zaheer — MITRE mapping, explanations, secure dashboard.

## What is now connected

The project now contains a shared canonical feature contract, a local adapter for Jahangir’s LSTM artifact, and Zaheer’s existing dashboard output contract. Abdul’s source snapshot and metrics are included under `vendor/abdul_coder_a/`; Jahangir’s notebook/configuration/rollout evidence is included under `vendor/jahangir_coder_b/`; the copied LSTM artifact is under `artifacts/models/`.

The live data path is:

> CSV upload → bounded offline parsing → canonical 21-feature frame → forecast engine → K-step infiltration timeline → MITRE stage mapping → explanations and flagged flows → Streamlit dashboard.

The shared feature vocabulary is defined in `src/defender/integration_contract.py`. It retains Abdul’s 17 real flow-level features and reserves five packet-derived fields required by the problem statement. If packet telemetry is absent, those five fields are zero-filled and recorded as unavailable; they are never silently inferred from unrelated flow fields.

## Model provenance rules

The packaged Jahangir artifact is a genuine PyTorch LSTM state dictionary with a next-state head and infiltration-probability head. Its originating notebook still uses a deterministic dummy data generator and trains on 16 unnamed features. Consequently, the dashboard labels it **“Jahangir LSTM artifact — synthetic-demo provenance”** and the README/PPT must not present it as the real-data world-model benchmark.

For the final technical claim, Jahangir must retrain the same architecture on the canonicalized Abdul matrix, using a documented feature list, the same train/validation/test boundary, and real dataset provenance. The resulting artifact should replace the demo file and retain the same adapter interface.

The transparent scorer remains available as the immediate default. It is auditable and useful for demo flow, but it is not a trained world model. This distinction is intentional and protects the team from claiming more than the current evidence proves.

## Run

From this directory:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[test]'
python -m pytest
streamlit run app.py
```

Select **Transparent offline scorer** for the deterministic fallback. Select **Jahangir LSTM demo artifact** only to demonstrate the connected adapter and explicitly labelled demo artifact. Upload a CSV or use the bundled demo traffic.

## Real-data retraining gate

Before replacing the demo artifact, run Abdul’s pipeline on the exact real dataset selected by the team:

```bash
python vendor/abdul_coder_a/data_loader.py --input MachineLearningCVE --output clean_features.csv
python vendor/abdul_coder_a/train_baseline.py --input clean_features.csv --split day --normalized-out normalized_features.csv
```

Then adapt Jahangir’s notebook into an importable training script that loads `normalized_features.csv`, uses the exact canonical feature list, constructs chronological windows without shuffling across the boundary, saves a state dictionary plus feature schema, and evaluates on the same held-out test segment. The final benchmark must report F1, precision, recall, and FPR for both Abdul’s LogisticRegression and Jahangir’s LSTM on the same test definition.

## Security controls

The app does not call remote services, execute uploaded content, accept model URLs, or write uploaded bytes to user-controlled paths. PyTorch weights are loaded only from the packaged local path with `weights_only=True`. Pickle files from Abdul’s repository are not loaded by the dashboard. Upload size and row limits remain enforced in memory.

## Remaining required work before a “real world-model” claim

The current integration is **connected and runnable**, but it is not yet a scientifically valid real-data LSTM benchmark because Jahangir’s committed weights came from dummy data. The remaining gate is retraining and evaluation on Abdul’s actual normalized matrix, then exporting model metadata and feature attributions. Do not remove this warning from the README or demo until that gate is complete.
