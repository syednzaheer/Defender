# Defender — Python ML Engine

The real forecasting engine: feature extraction, the temporal (LSTM)
world model, MITRE-stage mapping, and feature-attribution explanation.
Called by `../../server.js` via `bridge.py` (invoked as a subprocess,
JSON in on stdin, JSON out on stdout) -- this package is never exposed
directly to the network, only through the Express backend.

## Install

```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -e '.[test,world-model]'
```

## Test

```bash
pytest
node --test ../../../Cyberbot/test/cyper.test.js   # the chatbot's own tests, separate concern
```

## Layout

- `defender/` -- the actual package (`traffic.py`, `forecasting.py`,
  `world_model_adapter.py`, `reliability.py`, `integration_contract.py`)
- `bridge.py` -- the stdin/stdout JSON bridge the Node backend calls
- `scripts/` -- one-off training/evaluation scripts (not part of the
  live request path)
- `tests/` -- the real test suite
