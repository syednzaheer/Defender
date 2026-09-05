"""Offline forecast, MITRE-stage mapping, and human-readable explanations."""
from __future__ import annotations

from dataclasses import dataclass
import numpy as np
import pandas as pd

from .traffic import CANONICAL_FEATURES

STAGES = ("Reconnaissance", "Initial Access", "Lateral Movement", "Command & Control", "Exfiltration")

STAGE_RULES = {
    "Reconnaissance": {"tcp_syn": 1.5, "tcp_rst": 0.8, "iat_mean_ms": -0.25, "bidirectional_flow_ratio": -1.0, "destination_port": 0.15},
    "Initial Access": {"tcp_syn": 0.7, "tcp_ack": 0.8, "tcp_psh": 1.0, "payload_size_mean": 0.12, "destination_port": 0.10},
    "Lateral Movement": {"destination_port": 1.0, "packets_per_flow": 0.22, "bidirectional_flow_ratio": 0.9, "retransmission_count": 0.35},
    "Command & Control": {"iat_mean_ms": -0.18, "iat_variance_ms": 0.10, "flow_duration_ms": 0.04, "bidirectional_flow_ratio": 0.55},
    "Exfiltration": {"bytes_per_flow": 0.16, "payload_size_mean": 0.16, "flow_duration_ms": 0.03, "packets_per_flow": 0.08},
}

@dataclass(frozen=True)
class ForecastResult:
    timeline: pd.DataFrame
    stage: str
    explanations: pd.DataFrame
    flagged_flows: pd.DataFrame
    model_source: str


def _robust_scale(frame: pd.DataFrame) -> pd.DataFrame:
    med = frame.median().replace(0, 1)
    scale = (frame.quantile(0.75) - frame.quantile(0.25)).replace(0, 1)
    return ((frame - med) / scale).clip(-8, 8)


def score_traffic(features: pd.DataFrame, steps: int = 5) -> ForecastResult:
    """Produce a deterministic, auditable forward-risk curve offline.

    If Jahangir's trained world-model artifact is later placed in artifacts/models,
    the adapter can replace this scorer without changing the UI contract. This
    baseline remains intentionally transparent and is never presented as trained AI.
    """
    x = features[CANONICAL_FEATURES].copy()
    scaled = _robust_scale(x)
    stage_scores = pd.DataFrame(index=x.index)
    for stage, weights in STAGE_RULES.items():
        stage_scores[stage] = sum(scaled.get(feature, 0) * weight for feature, weight in weights.items())
    row_scores = stage_scores.max(axis=1).to_numpy(dtype=float)
    probabilities = 1 / (1 + np.exp(-np.clip(row_scores, -12, 12)))
    if len(probabilities) == 0:
        probabilities = np.array([0.0])
    current = float(np.nanmean(probabilities[-min(8, len(probabilities)):]))
    horizon = max(1, int(steps))
    curve = np.array([1 / (1 + np.exp(-((current * 2 - 1) + 0.10 * k))) for k in range(1, horizon + 1)])
    timeline = pd.DataFrame({"forecast_step": np.arange(1, horizon + 1), "infiltration_probability": np.round(curve, 4)})
    top_stage = str(stage_scores.mean().idxmax())
    per_flow = pd.DataFrame({"flow_index": np.arange(len(x)), "infiltration_probability": np.round(probabilities, 4), "predicted_stage": stage_scores.idxmax(axis=1).values})
    flagged = per_flow[per_flow["infiltration_probability"] >= 0.55].sort_values("infiltration_probability", ascending=False).head(100)
    contributions = []
    stage = STAGE_RULES[top_stage]
    latest = scaled.mean()
    for feature, weight in stage.items():
        contributions.append((feature, float(latest.get(feature, 0) * weight), top_stage))
    explanations = pd.DataFrame(contributions, columns=["feature", "contribution", "stage"]).sort_values("contribution", ascending=False)
    return ForecastResult(timeline, top_stage, explanations, flagged, "Transparent offline scorer")
