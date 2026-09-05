"""Shared contracts for the SIH26153 integration.

This module is deliberately dependency-light. It provides one stable vocabulary
across all subsystems instead of allowing each component to invent a slightly
different feature name or output shape.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np
import pandas as pd

# The first 17 fields are the real CIC-IDS-2017 flow features emitted by
# the data pipeline. The final five are optional PCAP-derived features required
# by the problem statement and are zero-filled only when the source genuinely
# does not contain packet telemetry.
FLOW_FEATURES = (
    "source_port", "destination_port", "protocol_number",
    "tcp_flag_bitmask", "tcp_syn", "tcp_ack", "tcp_fin", "tcp_rst",
    "tcp_psh", "tcp_urg", "bytes_per_flow", "packets_per_flow",
    "flow_duration_ms", "iat_mean_ms", "iat_variance_ms", "iat_max_ms",
    "bidirectional_flow_ratio",
)
PACKET_FEATURES = (
    "ttl_mean", "ttl_variance", "tcp_window_mean",
    "payload_size_mean", "retransmission_count",
)
MODEL_FEATURES = FLOW_FEATURES + PACKET_FEATURES
STAGES = ("Reconnaissance", "Initial Access", "Lateral Movement", "Command & Control", "Exfiltration")
SCHEMA_VERSION = "sih26153-canonical-v1"

# Flow log field aliases mapped into canonical names.
ALIASES = {
    "src_port": "source_port", "dst_port": "destination_port", "protocol": "protocol_number",
    "tcp_flag_bitmask": "tcp_flag_bitmask", "syn_flag": "tcp_syn", "ack_flag": "tcp_ack",
    "fin_flag": "tcp_fin", "rst_flag": "tcp_rst", "psh_flag": "tcp_psh", "urg_flag": "tcp_urg",
    "bytes_per_flow": "bytes_per_flow", "packets_per_flow": "packets_per_flow",
    "flow_duration": "flow_duration_ms", "iat_mean": "iat_mean_ms",
    "iat_variance": "iat_variance_ms", "iat_max": "iat_max_ms",
    "bidirectional_flow_ratio": "bidirectional_flow_ratio",
}

@dataclass(frozen=True)
class SchemaMetadata:
    version: str
    feature_names: tuple[str, ...]
    unavailable_features: tuple[str, ...]
    source: str


def _series(frame: pd.DataFrame, name: str) -> pd.Series:
    if name not in frame.columns:
        return pd.Series(0.0, index=frame.index, dtype="float64")
    return pd.to_numeric(frame[name], errors="coerce")


def canonicalise_abdul_frame(frame: pd.DataFrame) -> tuple[pd.DataFrame, SchemaMetadata]:
    """Convert a raw feature matrix to the 22-column shared schema.

    Packet columns are never fabricated from flow columns. If they are absent,
    they are zero-filled and recorded in metadata so the dashboard can state
    that packet telemetry was unavailable for this run.
    """
    renamed = frame.rename(columns={k: v for k, v in ALIASES.items() if k in frame.columns}).copy()
    result = pd.DataFrame(index=renamed.index)
    for name in FLOW_FEATURES:
        result[name] = _series(renamed, name)
    unavailable = []
    for name in PACKET_FEATURES:
        if name not in renamed.columns:
            unavailable.append(name)
        result[name] = _series(renamed, name)
    result = result.replace([np.inf, -np.inf], np.nan).fillna(0.0)
    result = result.clip(lower=-1e12, upper=1e12).astype("float64")
    metadata = SchemaMetadata(SCHEMA_VERSION, MODEL_FEATURES, tuple(unavailable), "Data pipeline canonicalized output")
    return result, metadata


def feature_matrix(frame: pd.DataFrame, feature_names: Iterable[str] = MODEL_FEATURES) -> np.ndarray:
    """Return a finite float32 matrix in an explicitly declared feature order."""
    names = tuple(feature_names)
    missing = [name for name in names if name not in frame.columns]
    if missing:
        raise ValueError(f"Feature matrix is missing required columns: {missing}")
    values = frame.loc[:, names].to_numpy(dtype=np.float32)
    if not np.isfinite(values).all():
        raise ValueError("Feature matrix contains non-finite values after canonicalization")
    return values


def validate_forecast_payload(payload: dict) -> None:
    """Validate the adapter payload before it reaches the Streamlit UI."""
    required = {"timeline", "stage", "explanations", "flagged_flows", "model_source"}
    missing = required.difference(payload)
    if missing:
        raise ValueError(f"Forecast payload missing fields: {sorted(missing)}")
    if payload["stage"] not in STAGES:
        raise ValueError(f"Unsupported MITRE stage: {payload['stage']}")
    timeline = payload["timeline"]
    if not {"forecast_step", "infiltration_probability"}.issubset(timeline.columns):
        raise ValueError("Forecast timeline has an invalid schema")
    probabilities = pd.to_numeric(timeline["infiltration_probability"], errors="coerce")
    if probabilities.isna().any() or ((probabilities < 0) | (probabilities > 1)).any():
        raise ValueError("Forecast probabilities must be finite values between 0 and 1")
