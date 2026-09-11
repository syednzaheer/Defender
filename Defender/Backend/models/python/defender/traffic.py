"""Safe, offline traffic ingestion for the SIH26153 demonstration.

The module accepts CSV flow records only. It never executes uploaded content,
never follows paths supplied by a file, and never sends telemetry off-machine.
"""
from __future__ import annotations

from io import BytesIO
from typing import BinaryIO

import numpy as np
import pandas as pd

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
MAX_ROWS = 500_000

CANONICAL_FEATURES = [
    "source_port", "destination_port", "protocol_number", "tcp_syn", "tcp_ack",
    "tcp_fin", "tcp_rst", "tcp_psh", "tcp_urg", "bytes_per_flow",
    "packets_per_flow", "flow_duration_ms", "iat_mean_ms", "iat_variance_ms",
    "iat_max_ms", "bidirectional_flow_ratio", "ttl_mean", "ttl_variance",
    "tcp_window_mean", "payload_size_mean", "retransmission_count",
]

ALIASES = {
    "src_port": "source_port", "source_port": "source_port", "sport": "source_port",
    "dst_port": "destination_port", "destination_port": "destination_port", "dport": "destination_port",
    "protocol": "protocol_number", "proto": "protocol_number", "protocol_number": "protocol_number",
    "totlen_fwd_pkts": "bytes_per_flow", "flow_bytes": "bytes_per_flow", "bytes_per_flow": "bytes_per_flow",
    "tot_fwd_pkts": "packets_per_flow", "packet_count": "packets_per_flow", "packets_per_flow": "packets_per_flow",
    "flow_duration": "flow_duration_ms", "flow_duration_ms": "flow_duration_ms",
    "iat_mean": "iat_mean_ms", "iat_mean_ms": "iat_mean_ms", "iat_variance": "iat_variance_ms",
    "iat_variance_ms": "iat_variance_ms", "iat_max": "iat_max_ms", "iat_max_ms": "iat_max_ms",
    "bidirectional_flow_ratio": "bidirectional_flow_ratio", "bidir_ratio": "bidirectional_flow_ratio",
    "ttl": "ttl_mean", "ttl_mean": "ttl_mean", "ttl_variance": "ttl_variance",
    "ttl_var": "ttl_variance", "tcp_window": "tcp_window_mean", "tcp_window_mean": "tcp_window_mean",
    "payload_size": "payload_size_mean", "payload_size_mean": "payload_size_mean",
    "retransmissions": "retransmission_count", "retransmission_count": "retransmission_count",
}


def _normalise_name(name: object) -> str:
    return str(name).strip().lower().replace(" ", "_").replace("-", "_")


def _numeric_series(frame: pd.DataFrame, name: str) -> pd.Series:
    if name in frame.columns:
        return pd.to_numeric(frame[name], errors="coerce")
    return pd.Series(0.0, index=frame.index, dtype="float64")


def read_uploaded_csv(upload: BinaryIO) -> pd.DataFrame:
    """Read and validate a CSV upload without creating files on disk."""
    raw = upload.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ValueError("Upload exceeds the 50 MB safety limit.")
    if not raw.strip():
        raise ValueError("The uploaded CSV is empty.")
    try:
        frame = pd.read_csv(BytesIO(raw), nrows=MAX_ROWS)
    except Exception as exc:
        raise ValueError(f"Could not parse the CSV safely: {exc}") from exc
    if frame.empty:
        raise ValueError("The uploaded CSV contains no data rows.")
    frame.columns = [_normalise_name(c) for c in frame.columns]
    renamed = {column: ALIASES[column] for column in frame.columns if column in ALIASES}
    frame = frame.rename(columns=renamed)
    return canonicalise_features(frame)


def canonicalise_features(frame: pd.DataFrame) -> pd.DataFrame:
    """Convert available fields to a stable numeric feature contract."""
    result = pd.DataFrame(index=frame.index)
    for feature in CANONICAL_FEATURES:
        result[feature] = _numeric_series(frame, feature)
    # A textual TCP flag column is common in CIC exports; derive safe indicators.
    flags = frame.get("tcp_flags", frame.get("flags", pd.Series("", index=frame.index))).astype(str).str.upper()
    for flag, feature in {"S": "tcp_syn", "A": "tcp_ack", "F": "tcp_fin", "R": "tcp_rst", "P": "tcp_psh", "U": "tcp_urg"}.items():
        result[feature] = result[feature].fillna(0).where(result[feature].ne(0), flags.str.contains(flag, regex=False).astype(float))
    result = result.replace([np.inf, -np.inf], np.nan).fillna(0.0)
    result = result.clip(lower=-1e12, upper=1e12)
    return result.astype("float64")


def demo_frame() -> pd.DataFrame:
    """Return deterministic local demo traffic when no file is uploaded."""
    rows = []
    for i in range(48):
        reconnaissance = i < 16
        access = 16 <= i < 28
        lateral = 28 <= i < 40
        rows.append({
            "source_port": 40000 + i, "destination_port": (22 + i % 5) if reconnaissance else (445 if lateral else 443),
            "protocol_number": 6, "tcp_syn": 1, "tcp_ack": 0 if reconnaissance else 1,
            "tcp_fin": 0, "tcp_rst": 1 if reconnaissance and i % 3 == 0 else 0,
            "tcp_psh": 1 if access or lateral else 0, "tcp_urg": 0,
            "bytes_per_flow": 90 + i * 40 if reconnaissance else 4000 + i * 120,
            "packets_per_flow": 2 + i % 3 if reconnaissance else 18 + i % 7,
            "flow_duration_ms": 4 + i * 0.4 if reconnaissance else 800 + i * 20,
            "iat_mean_ms": 3 if reconnaissance else 110, "iat_variance_ms": 1 if reconnaissance else 70,
            "iat_max_ms": 8 if reconnaissance else 420, "bidirectional_flow_ratio": 0.1 if reconnaissance else 0.8,
            "ttl_mean": 52 if reconnaissance else 61, "ttl_variance": 2 if reconnaissance else 8,
            "tcp_window_mean": 1024 if reconnaissance else 64240, "payload_size_mean": 45 if reconnaissance else 680,
            "retransmission_count": 1 if reconnaissance else (3 if lateral else 0),
        })
    return pd.DataFrame(rows, columns=CANONICAL_FEATURES)
