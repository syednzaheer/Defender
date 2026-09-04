"""Safe local adapter for Jahangir's LSTM world-model artifact.

The adapter intentionally distinguishes a demo artifact trained on synthetic
features from a validated real-data model.  It never downloads weights and it
never deserializes arbitrary pickle files.
"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

from .forecasting import ForecastResult, STAGES, STAGE_RULES
from .integration_contract import FLOW_FEATURES, MODEL_FEATURES, canonicalise_abdul_frame, feature_matrix

LEGACY_16_FEATURES = MODEL_FEATURES[:16]


def _load_torch():
    try:
        import torch
        import torch.nn as nn
    except ImportError as exc:
        raise RuntimeError("PyTorch is not installed; install the world-model extra to use Jahangir's adapter.") from exc
    return torch, nn


def _model_class(torch, nn, feature_count: int, hidden_size: int, num_layers: int, real_artifact: bool = False):
    class WorldModel(nn.Module):
        def __init__(self):
            super().__init__()
            if real_artifact:
                self.encoder = nn.LSTM(feature_count, hidden_size, num_layers=num_layers, batch_first=True, dropout=0.1)
                self.next_state = nn.Linear(hidden_size, feature_count)
                self.hazard = nn.Sequential(nn.Linear(hidden_size, 32), nn.ReLU(), nn.Linear(32, 1), nn.Sigmoid())
            else:
                self.lstm = nn.LSTM(feature_count, hidden_size, num_layers=num_layers, batch_first=True)
                self.state_head = nn.Linear(hidden_size, feature_count)
                self.infiltration_head = nn.Sequential(nn.Linear(hidden_size, 32), nn.ReLU(), nn.Linear(32, 1), nn.Sigmoid())

        def forward(self, x):
            if real_artifact:
                sequence, _ = self.encoder(x)
                hidden = sequence[:, -1, :]
                return self.next_state(hidden), self.hazard(hidden).squeeze(-1)
            sequence, _ = self.lstm(x)
            hidden = sequence[:, -1, :]
            return self.state_head(hidden), self.infiltration_head(hidden).squeeze(-1)

    return WorldModel()


def _stage_for_row(row: pd.Series) -> str:
    scores = {}
    for stage, weights in STAGE_RULES.items():
        scores[stage] = sum(float(row.get(feature, 0.0)) * weight for feature, weight in weights.items())
    return max(scores, key=scores.get)


def _explanations(frame: pd.DataFrame, stage: str) -> pd.DataFrame:
    weights = STAGE_RULES[stage]
    centered = frame.loc[:, list(MODEL_FEATURES)].mean()
    rows = [(name, float(centered.get(name, 0.0) * weight), stage) for name, weight in weights.items()]
    return pd.DataFrame(rows, columns=["feature", "contribution", "stage"]).sort_values("contribution", ascending=False)


def _result_from_curve(frame: pd.DataFrame, curve: list[float], source: str, probabilities: Optional[np.ndarray] = None, explanations: Optional[pd.DataFrame] = None) -> ForecastResult:
    canonical, _ = canonicalise_abdul_frame(frame)
    if probabilities is None:
        # Use the transparent stage rules only to create flagged-flow rows when
        # the LSTM artifact exposes no per-flow calibrated score.
        probabilities = np.full(len(canonical), float(curve[0] if curve else 0.0))
    probabilities = np.clip(np.asarray(probabilities, dtype=float), 0.0, 1.0)
    stages = canonical.apply(_stage_for_row, axis=1) if len(canonical) else pd.Series(dtype=str)
    flagged = pd.DataFrame({
        "flow_index": np.arange(len(canonical)),
        "infiltration_probability": np.round(probabilities, 4),
        "predicted_stage": stages.to_numpy() if len(canonical) else [],
    })
    flagged = flagged[flagged["infiltration_probability"] >= 0.55].sort_values("infiltration_probability", ascending=False).head(100)
    stage = str(stages.mode().iloc[0]) if len(stages) else STAGES[0]
    timeline = pd.DataFrame({"forecast_step": np.arange(1, len(curve) + 1), "infiltration_probability": np.round(curve, 4)})
    return ForecastResult(timeline, stage, explanations if explanations is not None else _explanations(canonical, stage), flagged, source)


def forecast_with_jahangir_artifact(frame: pd.DataFrame, model_path: str | Path, config_path: str | Path, steps: int = 5) -> ForecastResult:
    """Run the local LSTM artifact and return Zaheer's stable ForecastResult.

    The committed Jahangir artifact was trained with 16 unnamed dummy features.
    It is therefore loaded only as a **demo-provenance model** against the first
    16 canonical columns.  A real submission must retrain and replace it with
    weights carrying the same schema and real-data provenance.
    """
    torch, nn = _load_torch()
    import json

    config = json.loads(Path(config_path).read_text(encoding="utf-8"))
    window_size = int(config.get("window_size", 10))
    hidden_size = int(config.get("hidden_size", 64))
    num_layers = int(config.get("num_layers", 2))
    feature_names = tuple(config.get("feature_names", LEGACY_16_FEATURES))
    real_artifact = bool(config.get("artifact_provenance") == "official-cse-cic-ids2018")
    canonical, _ = canonicalise_abdul_frame(frame)
    values = feature_matrix(canonical, feature_names)
    if real_artifact and config.get("scaler_mean") and config.get("scaler_scale"):
        values = (values - np.asarray(config["scaler_mean"], dtype=np.float32)) / np.asarray(config["scaler_scale"], dtype=np.float32)
    if len(values) < window_size:
        raise ValueError(f"At least {window_size} rows are required for Jahangir's world-model window.")
    model = _model_class(torch, nn, len(feature_names), hidden_size, num_layers, real_artifact=real_artifact)
    state = torch.load(Path(model_path), map_location="cpu", weights_only=True)
    model.load_state_dict(state)
    model.eval()
    window = torch.from_numpy(values[-window_size:]).unsqueeze(0)
    explanation_table = None
    curve = []
    with torch.no_grad():
        base_window = window.clone()
        for _ in range(max(1, int(steps))):
            next_state, probability = model(window)
            curve.append(float(probability.item()))
            window = torch.cat([window[:, 1:, :], next_state.unsqueeze(1)], dim=1)
        if real_artifact:
            _, base_probability = model(base_window)
            base_probability = float(base_probability.item())
            rows = []
            for index, feature in enumerate(feature_names):
                perturbed = base_window.clone()
                perturbed[:, -1, index] = 0.0
                _, perturbed_probability = model(perturbed)
                rows.append((feature, base_probability - float(perturbed_probability.item()), "model perturbation"))
            explanation_table = pd.DataFrame(rows, columns=["feature", "contribution", "stage"]).sort_values("contribution", ascending=False)
    source = "Jahangir LSTM artifact — official CSE-CIC-IDS2018 cross-day provenance" if real_artifact else "Jahangir LSTM artifact — synthetic-demo provenance"
    return _result_from_curve(frame, curve, source, explanations=explanation_table)
