"""Train and evaluate the SIH26153 temporal model on official CSE-CIC-IDS2018 data.

This script is intentionally explicit: it only consumes local files supplied by
the operator, preserves the source label spelling, fits normalization on the
training period, builds chronological windows, and evaluates LogisticRegression
and the next-state LSTM on the same held-out target rows.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.preprocessing import StandardScaler

from defender.integration_contract import MODEL_FEATURES


def metric_dict(y_true, probabilities, threshold):
    pred = (probabilities >= threshold).astype(int)
    negatives = (y_true == 0).sum()
    false_positives = ((pred == 1) & (y_true == 0)).sum()
    return {
        "f1": float(f1_score(y_true, pred, zero_division=0)),
        "precision": float(precision_score(y_true, pred, zero_division=0)),
        "recall": float(recall_score(y_true, pred, zero_division=0)),
        "fpr": float(false_positives / max(1, negatives)),
        "threshold": float(threshold),
    }


def best_threshold(y_true, probabilities):
    candidates = np.linspace(0.05, 0.95, 19)
    return max(candidates, key=lambda t: f1_score(y_true, probabilities >= t, zero_division=0))


def load_flow_csv(path, max_rows=None):
    frame = pd.read_csv(path, nrows=max_rows)
    frame.columns = [str(c).strip() for c in frame.columns]
    required = ["Dst Port", "Protocol", "Timestamp", "Flow Duration", "Tot Fwd Pkts", "Tot Bwd Pkts", "TotLen Fwd Pkts", "TotLen Bwd Pkts", "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max", "SYN Flag Cnt", "ACK Flag Cnt", "FIN Flag Cnt", "RST Flag Cnt", "PSH Flag Cnt", "URG Flag Cnt", "Label"]
    missing = [c for c in required if c not in frame.columns]
    if missing:
        raise ValueError(f"Official CSV is missing required columns: {missing}")
    frame["timestamp"] = pd.to_datetime(frame["Timestamp"], dayfirst=True, errors="coerce")
    frame = frame.dropna(subset=["timestamp"]).copy()
    numeric = [c for c in required if c not in ("Timestamp", "Label")]
    for col in numeric:
        frame[col] = pd.to_numeric(frame[col], errors="coerce")
    frame = frame.replace([np.inf, -np.inf], np.nan).dropna(subset=numeric).copy()
    fwd = frame["Tot Fwd Pkts"].clip(lower=0)
    bwd = frame["Tot Bwd Pkts"].clip(lower=0)
    total_packets = (fwd + bwd).replace(0, 1)
    result = pd.DataFrame(index=frame.index)
    result["source_port"] = 0.0  # The official ML CSV exposes Dst Port but not Src Port.
    result["destination_port"] = frame["Dst Port"]
    result["protocol_number"] = frame["Protocol"]
    result["tcp_flag_bitmask"] = frame[["SYN Flag Cnt", "ACK Flag Cnt", "FIN Flag Cnt", "RST Flag Cnt", "PSH Flag Cnt", "URG Flag Cnt"]].clip(lower=0).sum(axis=1)
    for target, source in [("tcp_syn", "SYN Flag Cnt"), ("tcp_ack", "ACK Flag Cnt"), ("tcp_fin", "FIN Flag Cnt"), ("tcp_rst", "RST Flag Cnt"), ("tcp_psh", "PSH Flag Cnt"), ("tcp_urg", "URG Flag Cnt")]:
        result[target] = frame[source]
    result["bytes_per_flow"] = frame["TotLen Fwd Pkts"].clip(lower=0) + frame["TotLen Bwd Pkts"].clip(lower=0)
    result["packets_per_flow"] = total_packets
    result["flow_duration_ms"] = frame["Flow Duration"].clip(lower=0) / 1000.0
    result["iat_mean_ms"] = frame["Flow IAT Mean"].clip(lower=0) / 1000.0
    result["iat_variance_ms"] = (frame["Flow IAT Std"].clip(lower=0) / 1000.0) ** 2
    result["iat_max_ms"] = frame["Flow IAT Max"].clip(lower=0) / 1000.0
    result["bidirectional_flow_ratio"] = fwd / total_packets
    result["label"] = frame["Label"].astype(str).str.strip().str.lower().ne("benign").astype(int)
    result["timestamp"] = frame["timestamp"].values
    result = result.sort_values("timestamp").reset_index(drop=True)
    return result


def merge_packet_windows(flow, packet_json):
    payload = json.loads(Path(packet_json).read_text(encoding="utf-8"))
    packets = pd.DataFrame(payload["rows"])
    if packets.empty:
        raise ValueError("Packet feature JSON contains no rows")
    packets["timestamp"] = pd.to_datetime(packets["window_start_epoch"], unit="s", utc=True).dt.tz_convert(None)
    flow["packet_window"] = flow["timestamp"].dt.floor("60s")
    packets["packet_window"] = packets["timestamp"].dt.floor("60s")
    aggregates = packets.groupby("packet_window", as_index=False).agg({
        "ttl_mean": "mean", "ttl_variance": "mean", "tcp_window_mean": "mean",
        "payload_size_mean": "mean", "retransmission_count": "sum",
        "ip_fragment_count": "sum", "port_scan_sequential_score": "mean",
    })
    aggregates = aggregates.rename(columns={"ip_fragment_count": "fragment_count", "port_scan_sequential_score": "port_scan_score"})
    merged = flow.merge(aggregates, on="packet_window", how="left")
    for name in ["ttl_mean", "ttl_variance", "tcp_window_mean", "payload_size_mean", "retransmission_count", "fragment_count", "port_scan_score"]:
        merged[name] = pd.to_numeric(merged[name], errors="coerce").fillna(0.0)
    merged["packet_features_available"] = merged[["ttl_mean", "tcp_window_mean", "payload_size_mean"]].sum(axis=1).gt(0).astype(int)
    merged["port_scan_score"] = merged["port_scan_score"].clip(0, 1)
    merged["ttl_variance"] = merged["ttl_variance"].clip(lower=0)
    merged["retransmission_count"] = merged["retransmission_count"].clip(lower=0)
    merged["packet_window"] = merged["packet_window"].astype(str)
    return merged


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True)
    parser.add_argument("--packet-json", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--max-rows", type=int, default=None)
    parser.add_argument("--window-size", type=int, default=10)
    parser.add_argument("--epochs", type=int, default=8)
    args = parser.parse_args()
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    frame = merge_packet_windows(load_flow_csv(args.csv, args.max_rows), args.packet_json)
    frame["ttl_mean"] = frame["ttl_mean"]
    frame["ttl_variance"] = frame["ttl_variance"]
    frame["tcp_window_mean"] = frame["tcp_window_mean"]
    frame["payload_size_mean"] = frame["payload_size_mean"]
    frame["retransmission_count"] = frame["retransmission_count"]
    frame = frame.dropna(subset=list(MODEL_FEATURES) + ["label", "timestamp"]).reset_index(drop=True)
    n = len(frame)
    train_end, val_end = int(n * 0.70), int(n * 0.85)
    scaler = StandardScaler().fit(frame.loc[:train_end - 1, list(MODEL_FEATURES)])
    X = scaler.transform(frame.loc[:, list(MODEL_FEATURES)]).astype("float32")
    y = frame["label"].to_numpy(dtype=np.int64)
    scaler_payload = {"feature_names": list(MODEL_FEATURES), "mean": scaler.mean_.tolist(), "scale": scaler.scale_.tolist()}
    (out / "real_feature_schema.json").write_text(json.dumps({"schema_version": "sih26153-canonical-v1", "feature_names": list(MODEL_FEATURES), "packet_features_available_rows": int(frame["packet_features_available"].sum()), "rows": n}, indent=2), encoding="utf-8")
    (out / "real_scaler.json").write_text(json.dumps(scaler_payload, indent=2), encoding="utf-8")
    frame.to_csv(out / "real_fused_index.csv", index=False)

    base = LogisticRegression(max_iter=400, class_weight="balanced", n_jobs=1)
    base.fit(X[:train_end], y[:train_end])
    val_probs = base.predict_proba(X[train_end:val_end])[:, 1]
    threshold = best_threshold(y[train_end:val_end], val_probs)
    test_probs = base.predict_proba(X[val_end:])[:, 1]
    baseline_metrics = metric_dict(y[val_end:], test_probs, threshold)

    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, TensorDataset

    starts = np.arange(0, n - args.window_size - 1)
    target = starts + args.window_size
    train_mask = target < train_end
    val_mask = (target >= train_end) & (target < val_end)
    test_mask = target >= val_end
    def make_dataset(mask):
        return TensorDataset(torch.tensor(np.stack([X[s:s+args.window_size] for s in starts[mask]])), torch.tensor(X[target[mask]]), torch.tensor(y[target[mask]], dtype=torch.float32))
    train_loader = DataLoader(make_dataset(train_mask), batch_size=1024, shuffle=False)

    class WorldModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.encoder = nn.LSTM(len(MODEL_FEATURES), 64, num_layers=2, batch_first=True, dropout=0.1)
            self.next_state = nn.Linear(64, len(MODEL_FEATURES))
            self.hazard = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 1), nn.Sigmoid())
        def forward(self, x):
            seq, _ = self.encoder(x)
            h = seq[:, -1]
            return self.next_state(h), self.hazard(h).squeeze(1)

    model = WorldModel()
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    bce = nn.BCELoss()
    mse = nn.MSELoss()
    model.train()
    for epoch in range(args.epochs):
        losses = []
        for xb, next_x, yb in train_loader:
            optimizer.zero_grad()
            pred_x, pred_y = model(xb)
            loss = mse(pred_x, next_x) + bce(pred_y, yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            losses.append(float(loss.detach()))
        print(json.dumps({"epoch": epoch + 1, "loss": float(np.mean(losses))}))

    def model_probs(mask):
        ds = make_dataset(mask)
        loader = DataLoader(ds, batch_size=2048, shuffle=False)
        probabilities = []
        with torch.no_grad():
            model.eval()
            for xb, _, _ in loader:
                _, p = model(xb)
                probabilities.extend(p.numpy().tolist())
        return np.asarray(probabilities)
    val_model_probs = model_probs(val_mask)
    model_threshold = best_threshold(y[target[val_mask]], val_model_probs)
    test_model_probs = model_probs(test_mask)
    world_metrics = metric_dict(y[target[test_mask]], test_model_probs, model_threshold)
    comparison = {
        "dataset": "CSE-CIC-IDS2018 official processed CSV + official PCAP-derived windows",
        "rows": n, "train_rows": train_end, "validation_rows": val_end - train_end, "test_rows": n - val_end,
        "window_size": args.window_size, "feature_names": list(MODEL_FEATURES),
        "baseline_logistic_regression": baseline_metrics,
        "world_model_lstm": world_metrics,
        "packet_feature_available_rows": int(frame["packet_features_available"].sum()),
        "warning": "Packet features are time-aligned from the selected official UCAP sensor capture; the processed CSV lacks source IP, so this subset is a sensor-fusion demonstration, not a complete per-flow five-tuple join.",
    }
    (out / "real_benchmark_metrics.json").write_text(json.dumps(comparison, indent=2), encoding="utf-8")
    torch.save(model.state_dict(), out / "real_world_model_state_dict.pt")
    (out / "real_world_model_config.json").write_text(json.dumps({"schema_version": "sih26153-canonical-v1", "feature_names": list(MODEL_FEATURES), "window_size": args.window_size, "hidden_size": 64, "num_layers": 2, "dataset": comparison["dataset"]}, indent=2), encoding="utf-8")
    print(json.dumps(comparison, indent=2))

if __name__ == "__main__":
    main()
