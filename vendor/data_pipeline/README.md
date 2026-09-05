# SIH26153 — Coder A Deliverable (Abdul): Data Pipeline & Baseline Benchmark

Run against the **real CIC-IDS-2017 dataset** (all 8 days, the full
`MachineLearningCVE` release Abdul downloaded) — not synthetic data. These
are real, final numbers.

## Headline result (put this on Slide 4/5 — it's real evidence for the PS's own thesis)

| Split method | F1 | Precision | Recall | FPR | What it means |
|---|---|---|---|---|---|
| **By day** (train Mon-Thu, test Fri) | **0.703** | 0.844 | 0.602 | 0.063 | Realistic deployment split |
| **By attack type** (4 attack types fully held out) | **0.158** | 0.261 | 0.113 | 0.051 | Genuinely unseen attack types |

The baseline logistic regression **collapses from F1 0.70 to F1 0.16** the
moment it has to handle attack types it never saw during training. This is
a real, quantified demonstration of the PS's own core argument — static
classifiers memorize signatures rather than learning generalizable
behaviour. This number is legitimate ammunition for the "why a world model
beats a classifier" slide, and it's the exact number Jahangir's LSTM needs
to beat on the same held-out split to prove the world model actually adds
value.

Full metrics: `baseline_metrics.json` (day split, primary) and
`baseline_metrics_attack_type_secondary.json` (attack-type split).

## What's in this folder

| File | What it is |
|---|---|
| `data_loader.py` | Reads raw CIC-IDS-2017/2018/CTU-13 CSVs, cleans, extracts features. Run and tested against the real data. |
| `train_baseline.py` | Splits (by day / attack type / time), normalizes, trains + evaluates LogisticRegression baseline. |
| `generate_synthetic_data.py` | Only for local testing without the real files — not needed anymore, real data is in. |
| `requirements.txt` | Python dependencies. |
| `baseline_model.pkl` / `scaler.pkl` | Real trained baseline model + fitted scaler, from the day-split run. |
| `baseline_metrics.json` | Real day-split metrics (table above). |
| `baseline_metrics_attack_type_secondary.json` | Real attack-type-split metrics (table above). |
| `clean_features_SAMPLE.csv` / `normalized_features_SAMPLE.csv` | **First 2,000 rows only** — for Jahangir to check the schema before running the pipeline himself. The real files are 2.49M rows / ~280MB and ~880MB, too large to ship in this zip. |

## ⚠️ You (or Jahangir) need to regenerate the full files locally

The real `clean_features.csv` (280MB) and `normalized_features.csv`
(880MB) aren't in this zip — too big to share this way. Regenerating them
takes about 2 minutes on the same machine that has the `MachineLearningCVE`
folder:

```bash
pip install -r requirements.txt
python data_loader.py --input MachineLearningCVE --output clean_features.csv
python train_baseline.py --input clean_features.csv
```

That's it — `--input` accepts the whole folder (all 8 day-CSVs at once),
a glob pattern, or individual file paths. `--split` doesn't need to be
specified; it auto-picks `day` when it sees the day-tagged real data.

## Real things found and fixed while getting this to actually run

**1. The real file layout is completely different from every earlier
assumption** (caught only once the actual file was in hand): CIC-IDS-2017's
`MachineLearningCVE` release has **no `Protocol` column, no `Timestamp`
column, and no `Src IP`/`Src Port`/`Dst IP` columns at all** — only
`Destination Port` plus the flow statistics. Column names are also spelled
differently than CIC-IDS-2018 (`Total Fwd Packets` vs `Tot Fwd Pkts`,
`FIN Flag Count` vs `FIN Flag Cnt`, etc.). `data_loader.py` now recognizes
both naming conventions and treats Protocol/Timestamp/IP columns as fully
optional (placeholdered + warned if absent), so it works on whichever
release the team ends up using.

**2. It ships as 8 separate per-day files, not one CSV.** `data_loader.py`
now accepts a directory, a glob, or multiple file paths, concatenates them,
and tags each row with a `day` column parsed from the filename
(Monday..Friday). This is also *why* the "day" split exists in
`train_baseline.py` — there's no per-row timestamp in this release to
split on chronologically, but the file-per-day structure gives an
equally legitimate, non-random temporal split (train on earlier days,
test on Friday).

**3. One label-encoding artifact**: the Thursday web-attack file has a
mangled character in labels like "Web Attack ... Brute Force" (an en-dash
that comes through corrupted). Normalized these to clean, consistent
strings (`Web Attack - Brute Force`, etc.) during loading.

**4. Reading all 79 raw columns for ~2.8M rows across 8 files got the
process OOM-killed** on the first real run. Fixed two ways: (a)
`data_loader.py` now reads only the ~16 columns it actually needs via
`usecols`, instead of all 79; (b) each file is now read → cleaned →
feature-extracted individually, and only the small extracted result is
kept in memory before moving to the next file, rather than concatenating
all raw data upfront. Confirmed this processes the full real dataset
without issue.

**5. Two earlier bugs, found and fixed before the real data arrived** (kept
here for the record — both were caught by testing against a
real-shaped file, not by inspecting code and assuming it was correct):
placeholder columns for missing Src IP/Port were silently producing NaN
instead of the intended value (a pandas scalar-assignment-to-empty-frame
quirk); and the original design only saved a raw, unnormalized feature
file, which would have forced Jahangir to reimplement the scaling step
himself — fixed by having `train_baseline.py` also save
`normalized_features.csv` (the file he should actually load) with a
`split` column so his train/test boundary matches this baseline exactly.

## Design decisions

- **Split method** — `day` is now the default when the data has a `day`
  column (i.e. the real CIC-IDS-2017 release): train on Monday-Thursday,
  test on Friday. `attack_type` (entire attack types held out) is the
  stricter generalization test — see the headline result above for why
  it's worth running both. `time` (chronological, needs a per-row
  Timestamp) is kept for CIC-IDS-2018 or any release that has one.
- **TCP flag bitmask**: SYN/ACK/FIN/RST/PSH/URG presence packed into a
  6-bit integer per the brief's wording; individual flag columns kept too.
- **Bidirectional flow ratio**: `fwd_bytes / (fwd_bytes + bwd_bytes)`.
- **class_weight="balanced"** on the LogisticRegression, since attack
  traffic is a minority class — an unweighted baseline would just predict
  "benign" and still score deceptively well on plain accuracy (why we
  report F1/precision/recall/FPR, not accuracy).
- **Protocol placeholder = -1** (not present in this dataset release,
  see finding #1) — this is a genuine dataset limitation worth a one-line
  mention on the Feasibility slide, not something to paper over.

## Open item to flag to the team (still unresolved, not something I can fix alone)

CIC-IDS-2017's labels are attack-**type** strings (`DDoS`, `PortScan`,
`Web Attack - XSS`, etc.), confirmed from the real data — there is no
MITRE-**stage** label anywhere in the dataset. Zaheer's stage-mapping
table has to bridge attack-type → MITRE stage as a manual lookup; it
won't come from the data itself. Worth confirming the mapping table
covers every one of these 14 real attack-type strings (full list is in
`baseline_metrics.json`'s confusion matrix context / printed by
`data_loader.py`'s label distribution output) before Jahangir builds
stage-conditioned training on it.
