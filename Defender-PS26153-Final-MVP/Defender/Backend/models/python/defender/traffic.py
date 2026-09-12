"""Offline traffic ingestion for the Defender forecasting pipeline.

The adapter accepts bounded CSV flow records and PCAP/PCAPNG captures. It
normalises both sources into the same 22-feature contract used by the trained
world-model artifact. No uploaded content is executed and no telemetry leaves
the machine.
"""
from __future__ import annotations

from collections import defaultdict
from io import BytesIO
from typing import BinaryIO

import numpy as np
import pandas as pd

MAX_UPLOAD_BYTES = 50 * 1024 * 1024
MAX_ROWS = 500_000

CANONICAL_FEATURES = [
    "source_port", "destination_port", "protocol_number", "tcp_flag_bitmask",
    "tcp_syn", "tcp_ack", "tcp_fin", "tcp_rst", "tcp_psh", "tcp_urg",
    "bytes_per_flow", "packets_per_flow", "flow_duration_ms", "iat_mean_ms",
    "iat_variance_ms", "iat_max_ms", "bidirectional_flow_ratio", "ttl_mean",
    "ttl_variance", "tcp_window_mean", "payload_size_mean", "retransmission_count",
]

ALIASES = {
    "src_port": "source_port", "source_port": "source_port", "sport": "source_port",
    "dst_port": "destination_port", "destination_port": "destination_port", "dport": "destination_port",
    "protocol": "protocol_number", "proto": "protocol_number", "protocol_number": "protocol_number",
    "tcp_flags": "tcp_flag_bitmask", "flags": "tcp_flag_bitmask", "tcp_flag_bitmask": "tcp_flag_bitmask",
    "totlen_fwd_pkts": "bytes_per_flow", "flow_bytes": "bytes_per_flow", "bytes_per_flow": "bytes_per_flow",
    "totlen_bwd_pkts": "bytes_per_flow", "tot_fwd_pkts": "packets_per_flow", "packet_count": "packets_per_flow",
    "packets_per_flow": "packets_per_flow", "flow_duration": "flow_duration_ms", "flow_duration_ms": "flow_duration_ms",
    "iat_mean": "iat_mean_ms", "iat_mean_ms": "iat_mean_ms", "iat_variance": "iat_variance_ms",
    "iat_variance_ms": "iat_variance_ms", "iat_max": "iat_max_ms", "iat_max_ms": "iat_max_ms",
    "bidirectional_flow_ratio": "bidirectional_flow_ratio", "bidir_ratio": "bidirectional_flow_ratio",
    "ttl": "ttl_mean", "ttl_mean": "ttl_mean", "ttl_variance": "ttl_variance", "ttl_var": "ttl_variance",
    "tcp_window": "tcp_window_mean", "tcp_window_mean": "tcp_window_mean",
    "payload_size": "payload_size_mean", "payload_size_mean": "payload_size_mean",
    "retransmissions": "retransmission_count", "retransmission_count": "retransmission_count",
}

_FLAG_BITS = {"F": 0x01, "S": 0x02, "R": 0x04, "P": 0x08, "A": 0x10, "U": 0x20}


def _normalise_name(name: object) -> str:
    return str(name).strip().lower().replace(" ", "_").replace("-", "_")


def _numeric_series(frame: pd.DataFrame, name: str) -> pd.Series:
    if name in frame.columns:
        if name == "protocol_number":
            protocol_names = {"TCP": 6.0, "UDP": 17.0, "ICMP": 1.0, "ICMPV6": 58.0}
            values = frame[name].map(lambda value: protocol_names.get(str(value).strip().upper(), value))
            return pd.to_numeric(values, errors="coerce")
        return pd.to_numeric(frame[name], errors="coerce")
    return pd.Series(0.0, index=frame.index, dtype="float64")


def _flags_to_bitmask(value: object) -> float:
    if isinstance(value, (int, float, np.number)) and np.isfinite(value):
        return float(value)
    text = str(value).upper()
    return float(sum(bit for flag, bit in _FLAG_BITS.items() if flag in text))


def read_uploaded_csv(upload: BinaryIO) -> pd.DataFrame:
    """Read and validate a bounded CSV upload without creating files."""
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
    frame = frame.rename(columns={column: ALIASES[column] for column in frame.columns if column in ALIASES})
    return canonicalise_features(frame)


def _tcp_flag_columns(flags: pd.Series, result: pd.DataFrame) -> None:
    text = flags.astype(str).str.upper()
    for flag, feature in {"S": "tcp_syn", "A": "tcp_ack", "F": "tcp_fin", "R": "tcp_rst", "P": "tcp_psh", "U": "tcp_urg"}.items():
        result[feature] = result[feature].fillna(0).where(result[feature].ne(0), text.str.contains(flag, regex=False).astype(float))
    result["tcp_flag_bitmask"] = result["tcp_flag_bitmask"].where(result["tcp_flag_bitmask"].ne(0), text.map(_flags_to_bitmask))


def canonicalise_features(frame: pd.DataFrame) -> pd.DataFrame:
    """Convert available fields to the stable 22-column numeric contract."""
    result = pd.DataFrame(index=frame.index)
    missing_packet_features = [
        feature for feature in ("ttl_mean", "ttl_variance", "tcp_window_mean", "payload_size_mean", "retransmission_count")
        if feature not in frame.columns
    ]
    for feature in CANONICAL_FEATURES:
        result[feature] = _numeric_series(frame, feature)
    flags = frame.get("tcp_flags", frame.get("flags", frame.get("tcp_flag_bitmask", pd.Series("", index=frame.index))))
    _tcp_flag_columns(flags, result)
    result = result.replace([np.inf, -np.inf], np.nan).fillna(0.0)
    result = result.clip(lower=-1e12, upper=1e12)
    result = result.astype("float64")
    result.attrs["missing_packet_features"] = missing_packet_features
    result.attrs["source_columns"] = list(frame.columns)
    return result


def _packet_flag_string(packet) -> str:
    if not packet.haslayer("TCP"):
        return ""
    flags = packet["TCP"].flags
    return str(flags)


def read_uploaded_capture(upload: BinaryIO, suffix: str) -> pd.DataFrame:
    """Aggregate a PCAP/PCAPNG capture into directional flow windows.

    The result is intentionally conservative: packet features are calculated
    from the packets in each directional five-tuple, while the flow ratio is
    based on bytes observed in the reverse tuple when available.
    """
    raw = upload.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        raise ValueError("Upload exceeds the 50 MB safety limit.")
    if not raw.strip():
        raise ValueError("The uploaded capture is empty.")
    try:
        from scapy.layers.inet import IP, TCP, UDP
        from scapy.utils import PcapNgReader, PcapReader
    except ImportError as exc:
        raise ValueError("PCAP analysis requires the optional local dependency scapy; install the world-model extras.") from exc

    reader_cls = PcapNgReader if suffix.lower() == ".pcapng" else PcapReader
    flows = defaultdict(lambda: {"times": [], "lengths": [], "ttls": [], "windows": [], "payloads": [], "flags": [], "seqs": set(), "retransmissions": 0, "reverse": None})
    try:
        reader = reader_cls(BytesIO(raw))
        for packet in reader:
            if not packet.haslayer(IP):
                continue
            ip = packet[IP]
            transport = packet.getlayer(TCP) or packet.getlayer(UDP)
            protocol = 6 if packet.haslayer(TCP) else 17 if packet.haslayer(UDP) else int(ip.proto or 0)
            source_port = int(getattr(transport, "sport", 0) or 0)
            destination_port = int(getattr(transport, "dport", 0) or 0)
            key = (str(ip.src), str(ip.dst), source_port, destination_port, protocol)
            reverse_key = (str(ip.dst), str(ip.src), destination_port, source_port, protocol)
            item = flows[key]
            item["reverse"] = reverse_key
            timestamp = float(getattr(packet, "time", 0.0))
            item["times"].append(timestamp)
            item["lengths"].append(float(len(packet)))
            item["ttls"].append(float(getattr(ip, "ttl", 0) or 0))
            item["flags"].append(_packet_flag_string(packet))
            item["payloads"].append(float(len(bytes(transport.payload))) if transport is not None else 0.0)
            item["windows"].append(float(getattr(transport, "window", 0) or 0) if transport is not None else 0.0)
            if packet.haslayer(TCP):
                seq = int(getattr(packet[TCP], "seq", -1))
                if seq >= 0 and seq in item["seqs"]:
                    item["retransmissions"] += 1
                if seq >= 0:
                    item["seqs"].add(seq)
    except Exception as exc:
        raise ValueError(f"Could not parse the {suffix.lstrip('.') or 'capture'} safely: {exc}") from exc
    finally:
        try:
            reader.close()
        except Exception:
            pass
    if not flows:
        raise ValueError("The capture contains no IPv4 packets with usable flow information.")

    records = []
    for key, item in flows.items():
        times = np.asarray(item["times"], dtype=float)
        lengths = np.asarray(item["lengths"], dtype=float)
        iats = np.diff(np.sort(times)) if len(times) > 1 else np.asarray([0.0])
        reverse = flows.get(item["reverse"], {})
        reverse_bytes = float(np.sum(reverse.get("lengths", []))) if reverse else 0.0
        flags = item["flags"]
        records.append({
            "source_port": key[2], "destination_port": key[3], "protocol_number": key[4],
            "tcp_flag_bitmask": max((_flags_to_bitmask(v) for v in flags), default=0.0),
            "tcp_syn": float(any("S" in v for v in flags)), "tcp_ack": float(any("A" in v for v in flags)),
            "tcp_fin": float(any("F" in v for v in flags)), "tcp_rst": float(any("R" in v for v in flags)),
            "tcp_psh": float(any("P" in v for v in flags)), "tcp_urg": float(any("U" in v for v in flags)),
            "bytes_per_flow": float(np.sum(lengths)), "packets_per_flow": len(lengths),
            "flow_duration_ms": float((np.max(times) - np.min(times)) * 1000.0) if len(times) else 0.0,
            "iat_mean_ms": float(np.mean(iats) * 1000.0), "iat_variance_ms": float(np.var(iats) * 1_000_000.0),
            "iat_max_ms": float(np.max(iats) * 1000.0),
            "bidirectional_flow_ratio": float(np.sum(lengths) / max(np.sum(lengths) + reverse_bytes, 1.0)),
            "ttl_mean": float(np.mean(item["ttls"])), "ttl_variance": float(np.var(item["ttls"])),
            "tcp_window_mean": float(np.mean(item["windows"])), "payload_size_mean": float(np.mean(item["payloads"])),
            "retransmission_count": float(item["retransmissions"]),
        })
    return canonicalise_features(pd.DataFrame(records, columns=CANONICAL_FEATURES)).head(MAX_ROWS)


def demo_frame() -> pd.DataFrame:
    """Return deterministic local demo traffic when no file is uploaded."""
    rows = []
    for i in range(48):
        reconnaissance = i < 16
        access = 16 <= i < 28
        lateral = 28 <= i < 40
        rows.append({
            "source_port": 40000 + i, "destination_port": (22 + i % 5) if reconnaissance else (445 if lateral else 443),
            "protocol_number": 6, "tcp_flag_bitmask": 2 if reconnaissance else 18,
            "tcp_syn": 1, "tcp_ack": 0 if reconnaissance else 1, "tcp_fin": 0,
            "tcp_rst": 1 if reconnaissance and i % 3 == 0 else 0, "tcp_psh": 1 if access or lateral else 0, "tcp_urg": 0,
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
