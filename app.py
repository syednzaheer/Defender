"""Zaheer’s SIH26153 Defender Console.

Run with: streamlit run app.py
The app is offline-only: it imports local Python modules and never calls a
network endpoint, cloud API, or remote model service.
"""
from pathlib import Path
import sys

import plotly.graph_objects as go
import streamlit as st

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "src"))
from defender.forecasting import score_traffic  # noqa: E402
from defender.traffic import demo_frame, read_uploaded_csv  # noqa: E402
from defender.world_model_adapter import forecast_with_jahangir_artifact  # noqa: E402
from defender.reliability import assess_input  # noqa: E402

st.set_page_config(page_title="Defender Console | SIH26153", page_icon="D", layout="wide", initial_sidebar_state="expanded")

st.markdown("""
<style>
:root { --ink:#12233f; --muted:#5d6b82; --blue:#1769aa; --red:#c2413b; }
.block-container { padding-top: 2rem; max-width: 1440px; }
.hero { background:#10243e; color:white; padding:2rem 2.3rem; border-radius:8px; margin-bottom:1.4rem; border-left:6px solid #b52d35; }
.hero h1 { margin:0; font-size:2.25rem; letter-spacing:-.04em; }
.hero p { margin:.5rem 0 0; opacity:.86; font-size:1rem; }
.metric-card { background:#f4f7fb; border:1px solid #dfe7f1; border-radius:14px; padding:1rem; min-height:112px; }
.metric-label { color:var(--muted); font-size:.82rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; }
.metric-value { color:var(--ink); font-size:1.55rem; font-weight:800; margin-top:.3rem; }
.small-note { color:var(--muted); font-size:.9rem; }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="hero"><h1>Defender Console</h1><p>SIH26153 · Forward-looking network attack forecasting with MITRE-aware explanations</p></div>', unsafe_allow_html=True)

with st.sidebar:
    st.header("Input traffic")
    upload = st.file_uploader("Upload a CSV flow export", type=["csv"], help="Maximum 50 MB and 500,000 rows. The file is processed in memory and is not persisted.")
    use_demo = st.checkbox("Use bundled deterministic demo", value=upload is None)
    steps = st.slider("Forward simulation steps", min_value=1, max_value=20, value=5)
    model_mode = st.radio(
        "Forecast engine",
        ["Validated real-data LSTM artifact", "Transparent offline scorer", "Jahangir LSTM demo artifact"],
        help="The validated artifact was trained on official CSE-CIC-IDS2018 Wednesday data and evaluated on Thursday data. The synthetic artifact is retained only for provenance comparison.",
    )
    st.divider()
    st.caption("Offline security posture")
    st.caption("No cloud calls · no uploaded-file execution · no credentials · bounded input")

try:
    if upload is not None:
        frame = read_uploaded_csv(upload)
        source_label = upload.name
    elif use_demo:
        frame = demo_frame()
        source_label = "Bundled demo traffic"
    else:
        st.info("Upload a CSV or enable the bundled demo to begin.")
        st.stop()
    reliability_config = None
    if model_mode == "Validated real-data LSTM artifact":
        model_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_world_model_state_dict.pt"
        config_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_model_config.json"
        if not model_path.exists() or not config_path.exists():
            raise ValueError("The validated real-data artifact is not installed in artifacts/cross_day_benchmark.")
        import json
        reliability_config = json.loads(config_path.read_text(encoding="utf-8"))
        result = forecast_with_jahangir_artifact(frame, model_path, config_path, steps)
    elif model_mode == "Jahangir LSTM demo artifact":
        model_path = ROOT / "artifacts" / "models" / "jahangir_world_model_demo.pt"
        config_path = ROOT / "artifacts" / "models" / "jahangir_world_model_demo_config.json"
        if not model_path.exists() or not config_path.exists():
            raise ValueError("The Jahangir demo artifact is not installed in artifacts/models.")
        result = forecast_with_jahangir_artifact(frame, model_path, config_path, steps)
    else:
        result = score_traffic(frame, steps)
except (RuntimeError, ValueError) as exc:
    st.error(str(exc))
    st.stop()

st.success(f"Analysed {len(frame):,} flow records from {source_label}.")
reliability = assess_input(frame, (reliability_config or {}).get("scaler_mean"), (reliability_config or {}).get("scaler_scale"))
if reliability["defer_recommended"]:
    st.warning("Evidence quality warning: packet fields are missing or the input distribution is novel. Treat this forecast as analyst-triage support and verify the underlying telemetry before acting.")
else:
    st.caption(f"Input reliability: packet evidence available; novelty fraction {reliability['novelty_fraction']:.1%}.")

c1, c2, c3, c4 = st.columns(4)
for col, label, value in [(c1, "Predicted stage", result.stage), (c2, "Peak forecast risk", f"{result.timeline.infiltration_probability.max():.1%}"), (c3, "Flagged flows", f"{len(result.flagged_flows):,}"), (c4, "Simulation horizon", f"{steps} steps")]:
    col.markdown(f'<div class="metric-card"><div class="metric-label">{label}</div><div class="metric-value">{value}</div></div>', unsafe_allow_html=True)

st.subheader("Forward infiltration forecast")
fig = go.Figure(go.Scatter(x=result.timeline["forecast_step"], y=result.timeline["infiltration_probability"], mode="lines+markers", line={"color":"#c2413b", "width":4}, marker={"size":9}, hovertemplate="Step %{x}<br>Risk %{y:.1%}<extra></extra>"))
fig.update_yaxes(range=[0, 1], tickformat=".0%", title="Probability")
fig.update_xaxes(dtick=1, title="Future time window")
fig.update_layout(height=360, margin={"l":20,"r":20,"t":20,"b":20}, paper_bgcolor="white", plot_bgcolor="#f8fafc")
st.plotly_chart(fig, use_container_width=True)

left, right = st.columns([1, 1])
with left:
    st.subheader("Driving features")
    st.caption("Transparent feature contributions for the selected stage; positive values increase the stage score.")
    explanation = result.explanations.copy()
    explanation["contribution"] = explanation["contribution"].round(4)
    st.dataframe(explanation, use_container_width=True, hide_index=True)
with right:
    st.subheader("Flagged flows")
    st.caption("Rows at or above the local 55% risk threshold, sorted by risk.")
    st.dataframe(result.flagged_flows, use_container_width=True, hide_index=True)

with st.expander("Method and integration notes"):
    st.markdown(f"""
**Selected engine:** `{result.model_source}`.

**World-model boundary:** The validated artifact connects through the shared 22-column contract and was trained on official CSE-CIC-IDS2018 Wednesday data, then evaluated on Thursday data using the same schema. Its benchmark is a cross-day public-dataset result, not a deployment guarantee. The original Jahangir artifact remains available only as a separately labelled synthetic-demo provenance path.

**Fallback boundary:** The transparent scorer remains available for a deterministic, immediately runnable demonstration. It is not presented as a trained LSTM world model.

**Security controls:** Uploaded data is bounded in size and row count, parsed as CSV only, coerced to numeric values, clipped against extreme values, and never evaluated as code or written to a user-controlled path. Model weights are loaded only from the packaged local path with `weights_only=True`; no URL or arbitrary pickle is accepted.
""")
