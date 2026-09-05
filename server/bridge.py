"""Python bridge script for Node.js Express server.

Input: JSON payload via stdin or command line arguments.
Output: Structured JSON forecast or ingestion payload to stdout.
"""
import sys
import json
from pathlib import Path

# Ensure src/ is on Python path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from zaheer_sih26153.traffic import read_uploaded_csv, demo_frame
from zaheer_sih26153.forecasting import score_traffic
from zaheer_sih26153.world_model_adapter import forecast_with_jahangir_artifact
from zaheer_sih26153.reliability import assess_input


def handle_forecast(payload):
    steps = int(payload.get("steps", 5))
    model_mode = payload.get("model_mode", "Validated real-data LSTM artifact")
    csv_path = payload.get("csv_path")
    use_demo = payload.get("use_demo", False) or not csv_path

    if csv_path and Path(csv_path).is_file():
        with open(csv_path, "rb") as f:
            frame = read_uploaded_csv(f)
        source_label = Path(csv_path).name
    else:
        frame = demo_frame()
        source_label = "Bundled demo traffic"

    reliability_config = None
    if model_mode == "Validated real-data LSTM artifact":
        model_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_world_model_state_dict.pt"
        config_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_model_config.json"
        if not model_path.exists() or not config_path.exists():
            result = score_traffic(frame, steps)
        else:
            reliability_config = json.loads(config_path.read_text(encoding="utf-8"))
            result = forecast_with_jahangir_artifact(frame, model_path, config_path, steps)
    elif model_mode == "Jahangir LSTM demo artifact":
        model_path = ROOT / "artifacts" / "models" / "jahangir_world_model_demo.pt"
        config_path = ROOT / "artifacts" / "models" / "jahangir_world_model_demo_config.json"
        if not model_path.exists() or not config_path.exists():
            result = score_traffic(frame, steps)
        else:
            result = forecast_with_jahangir_artifact(frame, model_path, config_path, steps)
    else:
        result = score_traffic(frame, steps)

    reliability = assess_input(
        frame,
        (reliability_config or {}).get("scaler_mean"),
        (reliability_config or {}).get("scaler_scale")
    )

    # Build canonical JSON payload
    timeline_records = result.timeline.to_dict(orient="records")
    explanation_records = result.explanations.to_dict(orient="records")
    flagged_records = result.flagged_flows.head(50).to_dict(orient="records")

    return {
        "success": True,
        "source_label": source_label,
        "total_flows": len(frame),
        "model_source": result.model_source,
        "predicted_stage": result.stage,
        "peak_risk": float(result.timeline["infiltration_probability"].max()),
        "timeline": timeline_records,
        "explanations": explanation_records,
        "flagged_flows": flagged_records,
        "reliability": reliability,
    }


def handle_ingest(payload):
    csv_path = payload.get("csv_path")
    if csv_path and Path(csv_path).is_file():
        with open(csv_path, "rb") as f:
            frame = read_uploaded_csv(f)
        filename = Path(csv_path).name
    else:
        frame = demo_frame()
        filename = "demo_traffic.csv"

    # Return summary feature stats
    means = frame.mean().to_dict()
    return {
        "success": True,
        "filename": filename,
        "total_rows": len(frame),
        "columns": list(frame.columns),
        "feature_means": {k: float(v) for k, v in means.items()},
    }


def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            raw_input = "{}"
        payload = json.loads(raw_input)
        cmd = payload.get("command", "forecast")

        if cmd == "ingest":
            out = handle_ingest(payload)
        else:
            out = handle_forecast(payload)

        print(json.dumps(out, indent=2))
    except Exception as exc:
        print(json.dumps({
            "success": False,
            "error": str(exc),
            "type": type(exc).__name__,
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
