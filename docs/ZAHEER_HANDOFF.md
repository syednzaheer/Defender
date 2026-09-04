# Zaheer Handoff Note

This package covers Zaheer’s assigned block from the Work Division: **MITRE mapping, explainability, and the offline Streamlit demo interface**. It also includes the secure input boundary needed to connect Abdul’s feature pipeline.

The handoff is intentionally honest. The app runs immediately using a transparent deterministic fallback. It must not be presented as Jahangir’s trained LSTM or used to manufacture benchmark metrics. Once the validated world-model artifact exists, add a local adapter that returns the documented forecast contract and preserve the UI and security controls.

## What to show the team leader

Run `pip install -e .`, then `streamlit run app.py`. Use the bundled demo to show the risk curve, stage label, driving-feature table, and flagged-flow table. Run `pytest` to show the upload boundary and output contract are regression-tested. Run `zaheer-defender` for a terminal proof of the same flow.

## Review questions already addressed

The app does not call external services, expose secrets, execute input, trust filenames, write uploaded content, or silently call a cloud AI API. It clearly separates a transparent fallback from the trained world-model claim. The final team submission still needs real, source-backed MITRE citations and real benchmark outputs from the research and development owners.
