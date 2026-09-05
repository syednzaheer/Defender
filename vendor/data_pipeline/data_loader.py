"""
data_loader.py
---------------
Coder A (Abdul) — Data Pipeline, Steps 2-3.

Reads raw CIC-IDS-2017 / CIC-IDS-2018 / CTU-13 style flow CSV(s), drops
null/corrupt rows, and extracts exactly the flow-level features specified
in the SIH26153 brief:

  - source/destination IP + port (optional -- see note below)
  - TCP flag bitmask (SYN/ACK/FIN/RST/PSH/URG)
  - protocol (optional -- see note below)
  - bytes-per-flow, packets-per-flow
  - flow duration
  - inter-arrival-time stats (mean/variance/max)
  - bidirectional flow ratio

NOTE on optional columns (verified against the team's actual uploaded
CIC-IDS-2017 "MachineLearningCSV" release -- MachineLearningCVE/*.csv):
that release ships NEITHER Src IP/Src Port/Dst IP NOR Protocol NOR a
per-row Timestamp -- only Destination Port and the flow statistics. This
is different from what earlier docs assumed and different again from the
CSE-CIC-IDS2018 "Processed Traffic Data" release (which has Protocol +
Timestamp but still no Src IP/Src Port/Dst IP). Rather than hard-coding
one assumption, all four of {Src IP, Src Port, Dst IP, Protocol} are
OPTIONAL here -- used if present, safely placeholdered with a warning if
not. Confirm this is fine with the team (Slide 4 material: dataset doesn't
expose full 5-tuples or protocol in its ML-ready release).

MULTI-FILE INPUT: the real CIC-IDS-2017 download ships as one CSV per
capture day (Monday..Friday), not one combined file. --input accepts one
or more paths (or a directory) and concatenates them, tagging each row
with a 'day' column parsed from the filename. This also gives
train_baseline.py a natural, non-random "day" split option since there's
no per-row timestamp to split on in this release.

Output: a clean pandas DataFrame, saved to disk so Coder B (Jahangir) can
load it directly without re-writing this logic.

Usage:
    python data_loader.py --input MachineLearningCVE/*.csv --output clean_features.csv
    python data_loader.py --input MachineLearningCVE --output clean_features.csv
    python data_loader.py --input sample_flows.csv --output clean_features.csv
"""

import argparse
import glob
import os

import numpy as np
import pandas as pd

# Column names differ across dataset releases (CIC-IDS-2017's
# MachineLearningCVE, CIC-IDS-2018's Processed Traffic Data, CTU-13's
# CICFlowMeter re-processing). This map absorbs all the variants we've
# actually verified so one loader works across releases without guessing.
COLUMN_ALIASES = {
    "src ip": "Src IP", "source ip": "Src IP",
    "dst ip": "Dst IP", "destination ip": "Dst IP",
    "src port": "Src Port", "source port": "Src Port",
    "dst port": "Dst Port", "destination port": "Dst Port",
    "protocol": "Protocol",
    "timestamp": "Timestamp",
    "flow duration": "Flow Duration",
    "tot fwd pkts": "Tot Fwd Pkts", "total fwd packets": "Tot Fwd Pkts",
    "tot bwd pkts": "Tot Bwd Pkts", "total backward packets": "Tot Bwd Pkts",
    "totlen fwd pkts": "TotLen Fwd Pkts", "total length of fwd packets": "TotLen Fwd Pkts",
    "totlen bwd pkts": "TotLen Bwd Pkts", "total length of bwd packets": "TotLen Bwd Pkts",
    "flow iat mean": "Flow IAT Mean",
    "flow iat std": "Flow IAT Std",
    "flow iat max": "Flow IAT Max",
    "syn flag cnt": "SYN Flag Cnt", "syn flag count": "SYN Flag Cnt",
    "ack flag cnt": "ACK Flag Cnt", "ack flag count": "ACK Flag Cnt",
    "fin flag cnt": "FIN Flag Cnt", "fin flag count": "FIN Flag Cnt",
    "rst flag cnt": "RST Flag Cnt", "rst flag count": "RST Flag Cnt",
    "psh flag cnt": "PSH Flag Cnt", "psh flag count": "PSH Flag Cnt",
    "urg flag cnt": "URG Flag Cnt", "urg flag count": "URG Flag Cnt",
    "label": "Label",
}

REQUIRED_RAW_COLUMNS = [
    "Dst Port",
    "Flow Duration", "Tot Fwd Pkts", "Tot Bwd Pkts",
    "TotLen Fwd Pkts", "TotLen Bwd Pkts",
    "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max",
    "SYN Flag Cnt", "ACK Flag Cnt", "FIN Flag Cnt",
    "RST Flag Cnt", "PSH Flag Cnt", "URG Flag Cnt",
    "Label",
]

# Verified against the team's actual uploaded CIC-IDS-2017 file: NONE of
# these four are present in that release. Kept optional so any release
# that DOES have them (CTU-13, raw PCAP-derived flows) still uses them.
OPTIONAL_RAW_COLUMNS = ["Src IP", "Src Port", "Dst IP", "Protocol", "Timestamp"]

# Chronological order for the "day" split in train_baseline.py -- parsed
# from the real CIC-IDS-2017 filenames (Monday-WorkingHours.pcap_ISCX.csv,
# Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv, etc.)
DAY_ORDER = {"monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3, "friday": 4}


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename = {}
    for col in df.columns:
        key = col.strip().lower()
        if key in COLUMN_ALIASES:
            rename[col] = COLUMN_ALIASES[key]
    return df.rename(columns=rename)


def _parse_day_from_filename(path: str):
    """Extracts 'Monday'..'Friday' from a CIC-IDS-2017-style filename.
    Returns None if the filename doesn't match (e.g. a single combined file
    or a synthetic test file) -- the 'day' column is then simply omitted."""
    name = os.path.basename(path).lower()
    for day in DAY_ORDER:
        if name.startswith(day):
            return day.capitalize()
    return None


def _resolve_input_paths(input_arg):
    """--input accepts a single file, a glob pattern, multiple space-
    separated paths, or a directory (all *.csv inside it, non-recursive)."""
    paths = []
    for item in input_arg:
        if os.path.isdir(item):
            paths.extend(sorted(glob.glob(os.path.join(item, "*.csv"))))
        elif any(ch in item for ch in "*?[]"):
            paths.extend(sorted(glob.glob(item)))
        else:
            paths.append(item)
    if not paths:
        raise ValueError(f"No input CSV files found for: {input_arg}")
    return paths


def _read_and_validate_one(path: str) -> pd.DataFrame:
    """Reads a single raw CSV (only the columns this pipeline needs, via
    usecols -- the real CIC-IDS-2017 files ship 79 columns per row, and
    reading all of them for millions of rows is enough to get the process
    OOM-killed in a constrained environment; we only need ~16), validates
    required columns are present, warns on missing optional ones, tags the
    'day' column from the filename, and cleans the known label-encoding
    artifact in the real Thursday web-attack file."""
    wanted_lower = {c.lower() for c in REQUIRED_RAW_COLUMNS + OPTIONAL_RAW_COLUMNS}
    wanted_lower |= set(COLUMN_ALIASES.keys())  # cover every known alias spelling too

    header_cols = pd.read_csv(path, nrows=0).columns
    usecols = [c for c in header_cols if c.strip().lower() in wanted_lower]
    df = pd.read_csv(path, low_memory=False, encoding="utf-8",
                      on_bad_lines="skip", usecols=usecols)
    df = _normalize_columns(df)

    missing = [c for c in REQUIRED_RAW_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            f"{path} is missing required columns: {missing}\n"
            f"Available columns were: {list(df.columns)}\n"
            f"If this is a real dataset file with different column names, "
            f"add the mapping to COLUMN_ALIASES in data_loader.py."
        )

    missing_optional = [c for c in OPTIONAL_RAW_COLUMNS if c not in df.columns]
    if missing_optional:
        print(f"[data_loader] WARNING: optional columns not found in {path}: "
              f"{missing_optional}. Verified this is expected for the real "
              f"CIC-IDS-2017 'MachineLearningCVE' release the team downloaded "
              f"(no Src IP/Src Port/Dst IP/Protocol/Timestamp columns ship in "
              f"it at all). Continuing with placeholders for these columns.")

    day = _parse_day_from_filename(path)
    if day is not None:
        df["day"] = day

    # Fix a known encoding artifact in the real Thursday web-attack file:
    # the en-dash in labels like "Web Attack - Brute Force" comes through
    # as a mangled multi-byte sequence. Normalize it so 'label' values are
    # clean and consistent for downstream grouping/mapping.
    df["Label"] = (
        df["Label"].astype(str).str.strip()
        .str.replace(r"Web Attack.*Brute Force", "Web Attack - Brute Force", regex=True)
        .str.replace(r"Web Attack.*XSS", "Web Attack - XSS", regex=True)
        .str.replace(r"Web Attack.*Sql Injection", "Web Attack - Sql Injection", regex=True)
    )
    return df


def drop_null_and_corrupt(df: pd.DataFrame) -> pd.DataFrame:
    """Step 2 (cont.): drop null/corrupt rows.

    'Corrupt' here means: NaN in any required numeric column, infinite
    values (CICFlowMeter emits these for zero-duration flows, e.g. in the
    Flow Bytes/s column -- not one we use, but Flow IAT stats can be
    affected too), negative values where physically impossible (durations,
    byte/packet counts), and duplicate flow rows.
    """
    numeric_cols = [
        "Flow Duration", "Tot Fwd Pkts", "Tot Bwd Pkts",
        "TotLen Fwd Pkts", "TotLen Bwd Pkts",
        "Flow IAT Mean", "Flow IAT Std", "Flow IAT Max",
    ]

    before = len(df)
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.dropna(subset=numeric_cols + ["Label"])

    for col in numeric_cols:
        df = df[df[col] >= 0]

    df = df.drop_duplicates()
    after = len(df)
    print(f"[data_loader] dropped {before - after} null/corrupt/duplicate rows "
          f"({before} -> {after})")
    return df.reset_index(drop=True)


def build_tcp_flag_bitmask(df: pd.DataFrame) -> pd.Series:
    """Pack SYN/ACK/FIN/RST/PSH/URG presence into a single 6-bit integer,
    matching the brief's 'TCP flag bitmask' requirement, while the
    individual flag counts are kept as separate columns too (more signal
    for Coder B's model than the bitmask alone)."""
    syn = (df["SYN Flag Cnt"] > 0).astype(np.int64)
    ack = (df["ACK Flag Cnt"] > 0).astype(np.int64)
    fin = (df["FIN Flag Cnt"] > 0).astype(np.int64)
    rst = (df["RST Flag Cnt"] > 0).astype(np.int64)
    psh = (df["PSH Flag Cnt"] > 0).astype(np.int64)
    urg = (df["URG Flag Cnt"] > 0).astype(np.int64)
    bitmask = (syn * 32) + (ack * 16) + (fin * 8) + (rst * 4) + (psh * 2) + urg
    return bitmask


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """Step 3: extract exactly the flow-level features named in the brief."""
    out = pd.DataFrame()
    n = len(df)

    # source/destination IP+port -- optional, see module docstring.
    # (Built with explicit length arrays, NOT a bare scalar assignment --
    # assigning a scalar to a column on a still-empty DataFrame silently
    # produces an all-NaN column once later columns expand it, a real bug
    # we caught in testing.)
    out["src_ip"] = df["Src IP"].values if "Src IP" in df.columns else np.full(n, "unknown", dtype=object)
    out["src_port"] = df["Src Port"].astype(int).values if "Src Port" in df.columns else np.full(n, -1, dtype=np.int64)
    out["dst_ip"] = df["Dst IP"].values if "Dst IP" in df.columns else np.full(n, "unknown", dtype=object)
    out["dst_port"] = df["Dst Port"].astype(int)

    # protocol -- optional, see module docstring. -1 = unknown/not provided.
    out["protocol"] = df["Protocol"].astype(int).values if "Protocol" in df.columns else np.full(n, -1, dtype=np.int64)

    # TCP flag bitmask + individual flags
    out["tcp_flag_bitmask"] = build_tcp_flag_bitmask(df)
    out["syn_flag"] = (df["SYN Flag Cnt"] > 0).astype(int)
    out["ack_flag"] = (df["ACK Flag Cnt"] > 0).astype(int)
    out["fin_flag"] = (df["FIN Flag Cnt"] > 0).astype(int)
    out["rst_flag"] = (df["RST Flag Cnt"] > 0).astype(int)
    out["psh_flag"] = (df["PSH Flag Cnt"] > 0).astype(int)
    out["urg_flag"] = (df["URG Flag Cnt"] > 0).astype(int)

    # bytes-per-flow, packets-per-flow (total = fwd + bwd)
    out["bytes_per_flow"] = df["TotLen Fwd Pkts"] + df["TotLen Bwd Pkts"]
    out["packets_per_flow"] = df["Tot Fwd Pkts"] + df["Tot Bwd Pkts"]

    # flow duration
    out["flow_duration"] = df["Flow Duration"]

    # inter-arrival-time stats: mean, variance, max
    out["iat_mean"] = df["Flow IAT Mean"]
    out["iat_variance"] = df["Flow IAT Std"] ** 2
    out["iat_max"] = df["Flow IAT Max"]

    # bidirectional flow ratio: fwd bytes / (fwd + bwd bytes). 1.0 = fully
    # one-directional forward traffic (e.g. scans, floods), ~0.5 = balanced
    # conversation (typical benign sessions).
    total_bytes = df["TotLen Fwd Pkts"] + df["TotLen Bwd Pkts"]
    out["bidirectional_flow_ratio"] = np.where(
        total_bytes > 0, df["TotLen Fwd Pkts"] / total_bytes, 0.5
    )

    # carried through for downstream splitting/labeling, not model inputs
    out["label"] = df["Label"]
    if "Timestamp" in df.columns:
        out["timestamp"] = pd.to_datetime(df["Timestamp"], dayfirst=True, errors="coerce")
    if "day" in df.columns:
        out["day"] = df["day"]

    return out


def main():
    parser = argparse.ArgumentParser(description="Clean raw flow CSV(s) and extract features.")
    parser.add_argument("--input", required=True, nargs="+",
                         help="one or more raw CSV paths, a glob pattern, or a directory")
    parser.add_argument("--output", default="clean_features.csv",
                         help="output path (.csv or .parquet, if pyarrow is installed)")
    args = parser.parse_args()

    paths = _resolve_input_paths(args.input)

    # Process one file at a time end-to-end (read -> clean -> extract) and
    # only keep the small extracted feature frame in memory afterwards --
    # discarding each file's raw ~79-column data before moving to the next
    # keeps peak memory low regardless of how many days/files are given.
    extracted_frames = []
    for path in paths:
        print(f"[data_loader] reading {path}")
        raw = _read_and_validate_one(path)
        clean = drop_null_and_corrupt(raw)
        extracted_frames.append(extract_features(clean))

    features = pd.concat(extracted_frames, ignore_index=True) if len(extracted_frames) > 1 else extracted_frames[0]

    if args.output.endswith(".parquet"):
        features.to_parquet(args.output, index=False)
    else:
        features.to_csv(args.output, index=False)

    print(f"[data_loader] wrote {len(features)} rows x {len(features.columns)} cols -> {args.output}")
    print(f"[data_loader] label distribution:\n{features['label'].value_counts()}")
    if "day" in features.columns:
        print(f"[data_loader] day distribution:\n{features['day'].value_counts()}")


if __name__ == "__main__":
    main()
