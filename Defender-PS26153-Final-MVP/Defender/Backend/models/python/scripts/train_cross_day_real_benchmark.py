"""Train and evaluate on two official CSE-CIC-IDS2018 days.

Wednesday is the chronological training domain; Thursday is the held-out day.
The script keeps preprocessing, scaling, feature order, and thresholds learned
from Wednesday only. Packet features are aligned to each day's selected official
UCAP sensor capture and are never synthesized.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.preprocessing import StandardScaler
from torch.utils.data import DataLoader, TensorDataset

from defender.forecasting import STAGES
from defender.integration_contract import MODEL_FEATURES
from train_real_world_model import load_flow_csv, merge_packet_windows


def metrics(y, p, threshold):
    pred = p >= threshold
    tn = int(((pred == 0) & (y == 0)).sum())
    fp = int(((pred == 1) & (y == 0)).sum())
    return {
        "f1": float(f1_score(y, pred, zero_division=0)),
        "precision": float(precision_score(y, pred, zero_division=0)),
        "recall": float(recall_score(y, pred, zero_division=0)),
        "fpr": float(fp / max(1, tn + fp)),
        "threshold": float(threshold),
        "positives": int(y.sum()),
        "rows": int(len(y)),
    }


def threshold(y, p):
    candidates = np.linspace(0.05, 0.95, 19)
    return float(max(candidates, key=lambda t: f1_score(y, p >= t, zero_division=0)))


class TemporalWorldModel(nn.Module):
    def __init__(self, feature_count):
        super().__init__()
        self.encoder = nn.LSTM(feature_count, 64, num_layers=2, batch_first=True, dropout=0.1)
        self.next_state = nn.Linear(64, feature_count)
        self.hazard = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 1), nn.Sigmoid())

    def forward(self, x):
        sequence, _ = self.encoder(x)
        hidden = sequence[:, -1]
        return self.next_state(hidden), self.hazard(hidden).squeeze(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--train-csv", required=True)
    parser.add_argument("--train-packet-json", required=True)
    parser.add_argument("--test-csv", required=True)
    parser.add_argument("--test-packet-json", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--window-size", type=int, default=10)
    parser.add_argument("--epochs", type=int, default=8)
    args = parser.parse_args()
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    train = merge_packet_windows(load_flow_csv(args.train_csv), args.train_packet_json)
    test = merge_packet_windows(load_flow_csv(args.test_csv), args.test_packet_json)
    train = train.dropna(subset=list(MODEL_FEATURES) + ["label", "timestamp"]).reset_index(drop=True)
    test = test.dropna(subset=list(MODEL_FEATURES) + ["label", "timestamp"]).reset_index(drop=True)
    scaler = StandardScaler().fit(train[list(MODEL_FEATURES)])
    x_train = scaler.transform(train[list(MODEL_FEATURES)]).astype("float32")
    x_test = scaler.transform(test[list(MODEL_FEATURES)]).astype("float32")
    y_train = train.label.to_numpy(dtype=np.int64)
    y_test = test.label.to_numpy(dtype=np.int64)

    validation_boundary = int(len(train) * 0.85)
    baseline = LogisticRegression(max_iter=400, class_weight="balanced")
    baseline.fit(x_train[:validation_boundary], y_train[:validation_boundary])
    validation_probs = baseline.predict_proba(x_train[validation_boundary:])[:, 1]
    base_threshold = threshold(y_train[validation_boundary:], validation_probs)
    baseline_test_probs = baseline.predict_proba(x_test)[:, 1]

    starts = np.arange(max(0, len(x_train) - args.window_size - 1))
    targets = starts + args.window_size
    train_mask = targets < validation_boundary
    validation_mask = targets >= validation_boundary
    def dataset(x, y, start_indices, target_indices, mask):
        windows = np.stack([x[s:s + args.window_size] for s in start_indices[mask]])
        next_states = x[target_indices[mask]]
        labels = y[target_indices[mask]].astype("float32")
        return TensorDataset(torch.tensor(windows), torch.tensor(next_states), torch.tensor(labels))

    temporal = TemporalWorldModel(len(MODEL_FEATURES))
    optimizer = torch.optim.AdamW(temporal.parameters(), lr=1e-3, weight_decay=1e-4)
    mse, bce = nn.MSELoss(), nn.BCELoss()
    loader = DataLoader(dataset(x_train, y_train, starts, targets, train_mask), batch_size=1024, shuffle=False)
    temporal.train()
    epoch_losses = []
    for epoch in range(args.epochs):
        losses = []
        for window, next_state, label in loader:
            optimizer.zero_grad()
            predicted_state, predicted_hazard = temporal(window)
            loss = mse(predicted_state, next_state) + bce(predicted_hazard, label)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(temporal.parameters(), 1.0)
            optimizer.step()
            losses.append(float(loss.detach()))
        epoch_losses.append(float(np.mean(losses)))
        print(json.dumps({"epoch": epoch + 1, "loss": epoch_losses[-1]}))

    def model_probabilities(x, y, training_sequence=False):
        if training_sequence:
            starts_local = starts[validation_mask]
            targets_local = targets[validation_mask]
        else:
            starts_local = np.arange(max(0, len(x) - args.window_size - 1))
            targets_local = starts_local + args.window_size
        windows = np.stack([x[s:s + args.window_size] for s in starts_local])
        labels = y[targets_local]
        result = []
        temporal.eval()
        with torch.no_grad():
            for begin in range(0, len(windows), 2048):
                batch = torch.tensor(windows[begin:begin + 2048])
                _, p = temporal(batch)
                result.extend(p.numpy().tolist())
        return np.asarray(result), labels

    validation_world_probs, validation_world_y = model_probabilities(x_train, y_train, True)
    world_threshold = threshold(validation_world_y, validation_world_probs)
    test_world_probs, world_y = model_probabilities(x_test, y_test, False)
    comparison = {
        "dataset_train": "CSE-CIC-IDS2018 official Wednesday-28-02-2018",
        "dataset_test": "CSE-CIC-IDS2018 official Thursday-01-03-2018",
        "split_policy": "cross-day chronological holdout; scaler and thresholds fit on Wednesday only",
        "feature_names": list(MODEL_FEATURES),
        "window_size": args.window_size,
        "train_rows": int(len(train)),
        "test_rows": int(len(test)),
        "train_positive_rows": int(y_train.sum()),
        "test_positive_rows": int(y_test.sum()),
        "packet_features_available_train_rows": int(train.packet_features_available.sum()),
        "packet_features_available_test_rows": int(test.packet_features_available.sum()),
        "logistic_regression": metrics(y_test, baseline_test_probs, base_threshold),
        "temporal_world_model": metrics(world_y, test_world_probs, world_threshold),
        "epoch_losses": epoch_losses,
        "stages": list(STAGES),
        "limitations": [
            "The processed CICFlowMeter CSV exposes destination port but not source IP/source port; source_port is therefore an explicit unavailable field, not fabricated evidence.",
            "Selected packet features are aligned by timestamp to an official UCAP sensor capture, not claimed to be a complete per-flow five-tuple join.",
            "The benchmark is a cross-day public-dataset evaluation, not a deployment guarantee for an unseen enterprise network.",
        ],
    }
    (out / "cross_day_benchmark_metrics.json").write_text(json.dumps(comparison, indent=2), encoding="utf-8")
    (out / "cross_day_scaler.json").write_text(json.dumps({"feature_names": list(MODEL_FEATURES), "mean": scaler.mean_.tolist(), "scale": scaler.scale_.tolist()}, indent=2), encoding="utf-8")
    (out / "cross_day_model_config.json").write_text(json.dumps({"feature_names": list(MODEL_FEATURES), "window_size": args.window_size, "hidden_size": 64, "num_layers": 2, "dataset_train": comparison["dataset_train"], "dataset_test": comparison["dataset_test"], "artifact_provenance": "official-cse-cic-ids2018", "scaler_mean": scaler.mean_.tolist(), "scaler_scale": scaler.scale_.tolist()}, indent=2), encoding="utf-8")
    torch.save(temporal.state_dict(), out / "cross_day_world_model_state_dict.pt")
    print(json.dumps(comparison, indent=2))


if __name__ == "__main__":
    main()
