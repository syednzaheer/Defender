#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="${ROOT_DIR}/.venv"
PYTHON_BIN="${PYTHON_BIN:-python3}"

"${PYTHON_BIN}" -m venv "${VENV_DIR}"
"${VENV_DIR}/bin/python" -m pip install --upgrade pip
"${VENV_DIR}/bin/python" -m pip install -r "${ROOT_DIR}/Defender/Backend/models/python/requirements-cpu.txt"
"${VENV_DIR}/bin/python" -m pip install torch --index-url https://download.pytorch.org/whl/cpu

cat <<EOF
Python environment ready.
Use ${VENV_DIR}/bin/python for local model checks.
The Node bridge automatically uses this environment when it exists.
EOF
