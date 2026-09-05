from pathlib import Path

import pandas as pd

from defender.integration_contract import FLOW_FEATURES, MODEL_FEATURES, canonicalise_abdul_frame
from defender.traffic import demo_frame
from defender.world_model_adapter import forecast_with_jahangir_artifact


ROOT = Path(__file__).resolve().parents[1]


def test_abdul_schema_maps_to_shared_contract_without_fabricating_packet_fields():
    frame = pd.DataFrame({name: [float(i + 1)] for i, name in enumerate(FLOW_FEATURES)})
    canonical, metadata = canonicalise_abdul_frame(frame)
    assert tuple(canonical.columns) == MODEL_FEATURES
    assert set(metadata.unavailable_features) == {
        "ttl_mean", "ttl_variance", "tcp_window_mean", "payload_size_mean", "retransmission_count"
    }
    assert canonical.loc[0, "destination_port"] == 2.0


def test_jahangir_artifact_returns_zaheer_forecast_contract():
    model_path = ROOT / "artifacts" / "models" / "jahangir_world_model_demo.pt"
    config_path = ROOT / "artifacts" / "models" / "jahangir_world_model_demo_config.json"
    result = forecast_with_jahangir_artifact(demo_frame(), model_path, config_path, steps=5)
    assert list(result.timeline.columns) == ["forecast_step", "infiltration_probability"]
    assert len(result.timeline) == 5
    assert result.stage in {
        "Reconnaissance", "Initial Access", "Lateral Movement", "Command & Control", "Exfiltration"
    }
    assert {"feature", "contribution", "stage"}.issubset(result.explanations.columns)
    assert result.model_source.endswith("synthetic-demo provenance")
