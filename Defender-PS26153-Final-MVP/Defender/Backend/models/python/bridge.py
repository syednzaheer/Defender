"""Local JSON bridge for Defender's offline inference engine."""
import json
import sys
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(PACKAGE_DIR))
ROOT = Path(__file__).resolve().parents[1]

from defender.traffic import demo_frame, read_uploaded_capture, read_uploaded_csv
from defender.forecasting import score_traffic
from defender.world_model_adapter import forecast_with_trained_artifact
from defender.reliability import assess_input
from defender.integration_contract import SCHEMA_VERSION

METRICS_PATH = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_benchmark_metrics.json"


def _read_input(csv_path: str | None, use_demo: bool):
    if use_demo or not csv_path:
        return demo_frame(), "Bundled demo traffic", "demo"
    target_path = Path(csv_path).resolve()
    if not target_path.is_file() or not str(target_path).startswith(str(ROOT)):
        raise ValueError("Uploaded input is not available inside the temporary upload directory.")
    suffix = target_path.suffix.lower()
    with open(target_path, "rb") as handle:
        if suffix == ".csv":
            frame = read_uploaded_csv(handle)
            input_format = "csv"
        elif suffix in {".pcap", ".pcapng"}:
            frame = read_uploaded_capture(handle, suffix)
            input_format = suffix[1:]
        else:
            raise ValueError("Unsupported telemetry format. Use CSV, PCAP, or PCAPNG.")
    return frame, target_path.name, input_format


def _benchmark_metrics():
    try:
        return json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def handle_forecast(payload):
    raw_steps = payload.get("steps", 5)
    if isinstance(raw_steps, bool) or not isinstance(raw_steps, int):
        raise ValueError("steps must be an integer between 1 and 10")
    steps = max(1, min(10, raw_steps))
    model_mode = payload.get("model_mode") or "Validated real-data LSTM artifact"
    frame, source_label, input_format = _read_input(payload.get("csv_path"), bool(payload.get("use_demo", False)))

    reliability_config = None
    fallback_used = False
    if model_mode == "Validated real-data LSTM artifact":
        model_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_world_model_state_dict.pt"
        config_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_model_config.json"
        if model_path.exists() and config_path.exists():
            reliability_config = json.loads(config_path.read_text(encoding="utf-8"))
            result = forecast_with_trained_artifact(frame, model_path, config_path, steps)
        else:
            result = score_traffic(frame, steps)
            fallback_used = True
    elif model_mode in {"Demo LSTM artifact", "Trained LSTM demo artifact"}:
        model_path = ROOT / "artifacts" / "models" / "demo_world_model.pt"
        config_path = ROOT / "artifacts" / "models" / "demo_world_model_config.json"
        if not model_path.exists() or not config_path.exists():
            raise ValueError("The requested demo LSTM artifact is not installed.")
        result = forecast_with_trained_artifact(frame, model_path, config_path, steps)
    elif model_mode == "Deterministic transparent scorer":
        result = score_traffic(frame, steps)
        fallback_used = True
    else:
        raise ValueError(f"Unsupported model mode: {model_mode}")

    reliability = assess_input(frame, (reliability_config or {}).get("scaler_mean"), (reliability_config or {}).get("scaler_scale"))
    timeline_records = result.timeline.to_dict(orient="records")
    explanation_records = result.explanations.to_dict(orient="records")
    flagged_records = result.flagged_flows.head(100).to_dict(orient="records")
    metrics = _benchmark_metrics()
    return {
        "success": True,
        "source_label": source_label,
        "input_format": input_format,
        "schema_version": SCHEMA_VERSION,
        "total_flows": len(frame),
        "model_source": result.model_source,
        "predicted_stage": result.stage,
        "stage_trajectory": result.stage_trajectory or [result.stage] * len(timeline_records),
        "peak_risk": float(result.timeline["infiltration_probability"].max()),
        "timeline": timeline_records,
        "explanations": explanation_records,
        "flagged_flows": flagged_records,
        "reliability": reliability,
        "benchmark_metrics": metrics.get("temporal_world_model") if metrics else None,
        "benchmark_fallback": fallback_used,
    }


def handle_ingest(payload):
    frame, filename, input_format = _read_input(payload.get("csv_path"), bool(payload.get("use_demo", False)))
    means = frame.mean().to_dict()
    return {
        "success": True,
        "filename": filename,
        "input_format": input_format,
        "schema_version": SCHEMA_VERSION,
        "total_rows": len(frame),
        "columns": list(frame.columns),
        "feature_means": {k: float(v) for k, v in means.items()},
    }


def main():
    try:
        raw_input = sys.stdin.read() or "{}"
        payload = json.loads(raw_input)
        out = handle_ingest(payload) if payload.get("command", "forecast") == "ingest" else handle_forecast(payload)
        print(json.dumps(out, indent=2))
    except Exception as exc:
        print(json.dumps({"success": False, "error": str(exc), "type": type(exc).__name__}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
