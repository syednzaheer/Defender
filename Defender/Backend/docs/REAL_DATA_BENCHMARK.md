# Real CSE-CIC-IDS2018 Benchmark

This document records the first real-data benchmark for the integrated SIH26153 project. It is intentionally conservative: the result is evidence for a reproducible public-data experiment, not a deployment guarantee.

## Data provenance

The flow inputs come from the official CSE/CIC AWS Open Data bucket, specifically:

- `Processed Traffic Data for ML Algorithms/Wednesday-28-02-2018_TrafficForML_CICFlowMeter.csv`
- `Processed Traffic Data for ML Algorithms/Thursday-01-03-2018_TrafficForML_CICFlowMeter.csv`

The packet inputs were selectively extracted from the corresponding official ZIP64 PCAP archives by HTTP range request:

- `pcap/UCAP172.31.69.28` from Wednesday-28-02-2018, SHA-256 `45b2ee7a1ff7018f52c85a6ab012d8e3dd981b290b58d7c7df550f52a62d61be`
- `pcap/UCAP172.31.69.28` from Thursday-01-03-2018, SHA-256 `d1ac6b0bc434843d5d96ca3b7ad3792cc966ca65e327dedb11b64ee4c941fc77`

The official dataset page is [CSE-CIC-IDS2018 on AWS](https://www.unb.ca/cic/datasets/ids-2018.html), and the official public registry entry is [AWS Open Data Registry](https://registry.opendata.aws/cse-cic-ids2018/).

## Split and schema

The model trains on the complete Wednesday flow file and evaluates on the complete Thursday flow file. The scaler and decision thresholds are fitted on Wednesday only. The canonical schema has 22 ordered features: 17 flow features and 5 packet-derived features. The processed public CSV does not expose source IP/source port, so `source_port` remains an explicit unavailable field with value zero. This is not a fabricated packet value.

The packet extractor produces TTL mean/variance, TCP window mean, payload-size mean, IP fragment count, sequential port-scan score, unique destination ports, and retransmission counts in 60-second windows. The current shared model contract consumes the five primary packet fields and retains the additional derived fields in the packet artifact for later graph/evidence work.

## Measured result

| Model | F1 | Precision | Recall | False-positive rate | Test rows |
|---|---:|---:|---:|---:|---:|
| LogisticRegression baseline | 0.3649 | 0.2673 | 0.5744 | 0.6154 | 331,100 |
| Temporal LSTM world model | 0.3492 | 0.2456 | 0.6037 | 0.7250 | 331,089 |

The LSTM did **not** outperform the baseline on this first cross-day experiment. It recovered more attack rows but generated more false positives and had a lower F1. This result is retained as-is and must not be hidden. It demonstrates that the real-data path works and gives the team a concrete optimization target; it does not justify a superiority claim.

## Known limitations

The packet capture is aligned by timestamp to the selected UCAP sensor and is not claimed to be a complete per-flow five-tuple join because the processed CSV omits source IP/source port. A production-grade packet/flow join must use a shared flow key or regenerate flow records from the same PCAP with a deterministic extractor. The cross-day public-data result also does not predict performance on an unseen enterprise network. The stage mapping remains a SIH-level abstraction and requires explicit label-construction documentation before it is treated as ground truth.

## Reproduction

From the repository root, run the cross-day trainer after acquiring the two official CSVs and the two selected packet feature JSON files:

```bash
PYTHONPATH=src:scripts python3 scripts/train_cross_day_real_benchmark.py \
  --train-csv /path/to/Wednesday-28-02-2018_TrafficForML_CICFlowMeter.csv \
  --train-packet-json /path/to/UCAP172.31.69.28_wednesday_packet_features.json \
  --test-csv /path/to/Thursday-01-03-2018_TrafficForML_CICFlowMeter.csv \
  --test-packet-json /path/to/UCAP172.31.69.28_packet_features.json \
  --output-dir artifacts/cross_day_benchmark
```

The output contains the state dictionary, self-contained scaler/configuration, and `cross_day_benchmark_metrics.json`. The dashboard loads only the reviewed local state dictionary with safe tensor deserialization; it does not download or execute model artifacts.
