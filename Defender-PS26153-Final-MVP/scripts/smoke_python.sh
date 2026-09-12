#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON_BIN="${ROOT_DIR}/.venv/bin/python"
BRIDGE="${ROOT_DIR}/Defender/Backend/models/python/bridge.py"
SAMPLE="${ROOT_DIR}/Defender/Backend/models/artifacts/sample_data/demo_flows.csv"
CSV_SAMPLE="${ROOT_DIR}/Defender/Backend/models/artifacts/smoke_sequence.csv"
trap 'rm -f "${CSV_SAMPLE}"' EXIT

if [[ ! -x "${PYTHON_BIN}" ]]; then
  echo "Python environment is missing. Run npm run setup:python first." >&2
  exit 2
fi

RESULT="$({ printf '%s' '{"use_demo":true,"steps":3,"model_mode":"Validated real-data LSTM artifact"}' | "${PYTHON_BIN}" "${BRIDGE}"; })"
"${PYTHON_BIN}" -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] is True; assert d["benchmark_fallback"] is False; assert len(d["timeline"]) == 3; print("Real LSTM demo smoke test passed:", d["model_source"])' <<<"${RESULT}"

{ head -n 1 "${SAMPLE}"; tail -n +2 "${SAMPLE}"; tail -n +2 "${SAMPLE}"; } > "${CSV_SAMPLE}"
RESULT="$({ "${PYTHON_BIN}" "${BRIDGE}" <<EOF
{"csv_path":"${CSV_SAMPLE}","steps":2,"model_mode":"Validated real-data LSTM artifact"}
EOF
})"
"${PYTHON_BIN}" -c 'import json,sys; d=json.load(sys.stdin); assert d["success"] is True; assert d["input_format"] == "csv"; assert d["benchmark_fallback"] is False; print("CSV smoke test passed:", d["total_flows"], "rows")' <<<"${RESULT}"
