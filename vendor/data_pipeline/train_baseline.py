"""
train_baseline.py
------------------
Coder A (Abdul) — Data Pipeline & Baseline Benchmark, Steps 4-8.

1. Splits the dataset by day, attack type, or time window (NOT a random
   shuffle) -> honestly tests generalization to unseen attacks, per the
   brief's explicit requirement. 'day' is the recommended default for the
   real CIC-IDS-2017 download (it ships as one file per capture day and
   has no per-row timestamp -- see split_by_day below).
2. Normalizes numeric columns (StandardScaler, fit on the TRAIN split
   only, then applied to the whole dataset) and SAVES:
   - scaler.pkl (the fitted scaler object)
   - normalized_features.csv (the FULL dataset, already scaled, with a
     'split' column marking train/test membership)
   -> this is the single file Coder B loads directly per his own
   instructions ("load the normalized feature matrix ... don't re-write
   the loading logic, import it"). He should NOT re-run StandardScaler
   himself -- if he needs to scale new/live traffic at inference time,
   he loads scaler.pkl and calls .transform() on it, never .fit().
3. Trains a LogisticRegression baseline on the train split.
4. Prints F1 / precision / recall / false-positive-rate on the held-out
   test set.
5. Saves baseline_model.pkl and baseline_metrics.json.

Usage:
    python train_baseline.py --input clean_features.csv --split day
    python train_baseline.py --input clean_features.csv --split attack_type
    python train_baseline.py --input clean_features.csv --split time
"""

import argparse
import json
import pickle

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score, precision_score, recall_score, confusion_matrix

NUMERIC_FEATURE_COLUMNS = [
    "src_port", "dst_port", "protocol",
    "tcp_flag_bitmask", "syn_flag", "ack_flag", "fin_flag",
    "rst_flag", "psh_flag", "urg_flag",
    "bytes_per_flow", "packets_per_flow", "flow_duration",
    "iat_mean", "iat_variance", "iat_max",
    "bidirectional_flow_ratio",
]

# Non-feature columns carried through to normalized_features.csv untouched,
# for reference / MITRE-mapping / debugging (Coder B should NOT feed these
# into the model as numeric inputs).
PASSTHROUGH_COLUMNS = ["src_ip", "dst_ip", "label"]

DAY_ORDER = {"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, "Friday": 4}


def load_features(path: str) -> pd.DataFrame:
    if path.endswith(".parquet"):
        return pd.read_parquet(path)
    return pd.read_csv(path)


def split_by_day(df: pd.DataFrame, test_days=None):
    """Train on earlier capture days, test on later ones -- a real,
    file-level 'not a random shuffle' split, and the recommended default
    for the CIC-IDS-2017 MachineLearningCVE release (it ships one CSV per
    weekday and has no per-row Timestamp column, so split_by_time can't be
    used on it directly). Defaults to holding out the LAST day present as
    test (typically Friday -- Botnet/PortScan/DDoS -- while training on
    Monday-Thursday's benign/brute-force/DoS/web-attack/infiltration
    traffic), which is also the most realistic deployment scenario."""
    if "day" not in df.columns:
        raise ValueError("No 'day' column found for a day-based split. This column "
                          "is only added when data_loader.py is run on the real "
                          "CIC-IDS-2017 per-weekday files. Use --split attack_type "
                          "instead, or --split time if a Timestamp column exists.")
    present_days = sorted(df["day"].unique(), key=lambda d: DAY_ORDER.get(d, 99))
    if test_days is None:
        test_days = [present_days[-1]]
    print(f"[train_baseline] day split -- train days: "
          f"{[d for d in present_days if d not in test_days]}, test days: {test_days}")
    train = df[~df["day"].isin(test_days)].copy()
    test = df[df["day"].isin(test_days)].copy()
    return train.reset_index(drop=True), test.reset_index(drop=True)


def split_by_time(df: pd.DataFrame, test_frac: float = 0.25):
    """Chronological split: train on the earlier portion of the capture
    window, test on the later portion. Requires a per-row Timestamp column
    -- NOT present in the real CIC-IDS-2017 MachineLearningCVE release the
    team downloaded (use --split day for that). Kept here for CIC-IDS-2018
    or any other release that does carry a Timestamp column."""
    if "timestamp" not in df.columns or df["timestamp"].isna().all():
        raise ValueError("No usable 'timestamp' column for a time-based split. "
                          "Use --split day (if a 'day' column is present, e.g. "
                          "CIC-IDS-2017) or --split attack_type instead.")
    df = df.sort_values("timestamp").reset_index(drop=True)
    cutoff = int(len(df) * (1 - test_frac))
    return df.iloc[:cutoff].copy(), df.iloc[cutoff:].copy()


def split_by_attack_type(df: pd.DataFrame, holdout_frac: float = 0.3, seed: int = 42):
    """Holds out entire attack types from training so the test set measures
    generalization to genuinely unseen attack patterns, rather than
    memorized signatures -- directly satisfies the brief's requirement.
    Benign traffic is split proportionally across both sets."""
    rng = np.random.default_rng(seed)
    attack_types = sorted(t for t in df["label"].unique() if t.upper() != "BENIGN")
    n_holdout = max(1, int(round(len(attack_types) * holdout_frac)))
    holdout_types = set(rng.choice(attack_types, size=n_holdout, replace=False))

    print(f"[train_baseline] holding out attack types for test set: {sorted(holdout_types)}")

    benign = df[df["label"].str.upper() == "BENIGN"]
    b_cut = int(len(benign) * (1 - holdout_frac))
    benign_train, benign_test = benign.iloc[:b_cut], benign.iloc[b_cut:]

    train = pd.concat([benign_train, df[(df["label"].str.upper() != "BENIGN") & (~df["label"].isin(holdout_types))]])
    test = pd.concat([benign_test, df[df["label"].isin(holdout_types)]])
    return train.sample(frac=1, random_state=seed).reset_index(drop=True), \
        test.sample(frac=1, random_state=seed).reset_index(drop=True)


def to_binary_labels(labels: pd.Series) -> np.ndarray:
    return (labels.str.upper() != "BENIGN").astype(int).values


def main():
    parser = argparse.ArgumentParser(description="Train + evaluate the logistic regression baseline.")
    parser.add_argument("--input", required=True, help="clean feature matrix from data_loader.py")
    parser.add_argument("--split", choices=["day", "time", "attack_type"], default=None,
                         help="how to split train/test (never random shuffle). Default: "
                              "'day' if a day column is present, else 'time' if a timestamp "
                              "column is present, else 'attack_type'.")
    parser.add_argument("--model-out", default="baseline_model.pkl")
    parser.add_argument("--scaler-out", default="scaler.pkl")
    parser.add_argument("--metrics-out", default="baseline_metrics.json")
    parser.add_argument("--normalized-out", default="normalized_features.csv",
                         help="the file Coder B loads directly -- full dataset, "
                              "already scaled, with a 'split' column")
    args = parser.parse_args()

    df = load_features(args.input)

    split_method = args.split
    if split_method is None:
        if "day" in df.columns:
            split_method = "day"
        elif "timestamp" in df.columns and not df["timestamp"].isna().all():
            split_method = "time"
        else:
            split_method = "attack_type"
        print(f"[train_baseline] --split not given, auto-selected '{split_method}' "
              f"based on available columns")

    if split_method == "day":
        train_df, test_df = split_by_day(df)
    elif split_method == "time":
        train_df, test_df = split_by_time(df)
    else:
        train_df, test_df = split_by_attack_type(df)

    print(f"[train_baseline] train rows: {len(train_df)}, test rows: {len(test_df)} "
          f"(split method: {split_method})")

    X_train = train_df[NUMERIC_FEATURE_COLUMNS].values
    X_test = test_df[NUMERIC_FEATURE_COLUMNS].values
    y_train = to_binary_labels(train_df["label"])
    y_test = to_binary_labels(test_df["label"])

    # Fit the scaler on TRAIN ONLY (avoids test-set leakage into the
    # normalization statistics), then apply it to both splits.
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    with open(args.scaler_out, "wb") as f:
        pickle.dump(scaler, f)
    print(f"[train_baseline] saved scaler -> {args.scaler_out}")

    # Build the single normalized file Coder B loads directly: same row
    # order/identity as clean_features.csv, numeric columns replaced with
    # their scaled values, plus a 'split' column so Coder B's windowing
    # respects the same train/test boundary as this baseline (an honest
    # apples-to-apples comparison, per the brief's required benchmark).
    normalized_train = train_df[PASSTHROUGH_COLUMNS].copy()
    normalized_train[NUMERIC_FEATURE_COLUMNS] = X_train_scaled
    normalized_train["split"] = "train"
    if "timestamp" in train_df.columns:
        normalized_train["timestamp"] = train_df["timestamp"].values
    if "day" in train_df.columns:
        normalized_train["day"] = train_df["day"].values

    normalized_test = test_df[PASSTHROUGH_COLUMNS].copy()
    normalized_test[NUMERIC_FEATURE_COLUMNS] = X_test_scaled
    normalized_test["split"] = "test"
    if "timestamp" in test_df.columns:
        normalized_test["timestamp"] = test_df["timestamp"].values
    if "day" in test_df.columns:
        normalized_test["day"] = test_df["day"].values

    normalized_full = pd.concat([normalized_train, normalized_test], ignore_index=True)
    normalized_full.to_csv(args.normalized_out, index=False)
    print(f"[train_baseline] saved normalized feature matrix (Coder B loads this) "
          f"-> {args.normalized_out}")

    # Step 6: train the baseline
    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(X_train_scaled, y_train)

    # Step 7: compute + print real metrics on the held-out test set
    y_pred = model.predict(X_test_scaled)
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred, labels=[0, 1]).ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    metrics = {
        "split_method": split_method,
        "train_rows": int(len(train_df)),
        "test_rows": int(len(test_df)),
        "f1_score": float(f1_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred)),
        "recall": float(recall_score(y_test, y_pred)),
        "false_positive_rate": float(fpr),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
        "feature_columns": NUMERIC_FEATURE_COLUMNS,
    }

    print("\n===== BASELINE METRICS (held-out test set) =====")
    print(f"F1 score : {metrics['f1_score']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall   : {metrics['recall']:.4f}")
    print(f"FPR      : {metrics['false_positive_rate']:.4f}")
    print("==================================================\n")

    # Step 8: save model + metrics
    with open(args.model_out, "wb") as f:
        pickle.dump(model, f)
    with open(args.metrics_out, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[train_baseline] saved model -> {args.model_out}")
    print(f"[train_baseline] saved metrics -> {args.metrics_out}")


if __name__ == "__main__":
    main()
