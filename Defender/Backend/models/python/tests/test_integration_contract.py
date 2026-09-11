from pathlib import Path

import pandas as pd

from defender.integration_contract import FLOW_FEATURES, MODEL_FEATURES, canonicalise_flow_frame
from defender.traffic import demo_frame
from defender.world_model_adapter import forecast_with_world_model_artifact


ROOT = Path(__file__).resolve().parents[2]  # Backend/models/ -- matches bridge.py's ARTIFACTS_DIR convention


def test_pipeline_schema_maps_to_shared_contract_without_fabricating_packet_fields():
    frame = pd.DataFrame({name: [float(i + 1)] for i, name in enumerate(FLOW_FEATURES)})
    canonical, metadata = canonicalise_flow_frame(frame)
    assert tuple(canonical.columns) == MODEL_FEATURES
    assert set(metadata.unavailable_features) == {
        "ttl_mean", "ttl_variance", "tcp_window_mean", "payload_size_mean", "retransmission_count"
    }
    assert canonical.loc[0, "destination_port"] == 2.0


def test_lstm_artifact_returns_forecast_contract():
    model_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_world_model_state_dict.pt"
    config_path = ROOT / "artifacts" / "cross_day_benchmark" / "cross_day_model_config.json"
    result = forecast_with_world_model_artifact(demo_frame(), model_path, config_path, steps=5)
    assert list(result.timeline.columns) == ["forecast_step", "infiltration_probability"]
    assert len(result.timeline) == 5
    assert result.stage in {
        "Reconnaissance", "Initial Access", "Lateral Movement", "Command & Control", "Exfiltration"
    }
    assert {"feature", "contribution", "stage"}.issubset(result.explanations.columns)
    assert result.model_source.endswith("official CSE-CIC-IDS2018 cross-day provenance")
