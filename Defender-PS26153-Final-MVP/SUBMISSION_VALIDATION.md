# DEFENDER PS 26153 — Submission Validation Record

## Verified locally

The final package was tested after creating the documented Python environment with `npm run setup:python`.

| Check | Result |
|---|---|
| JavaScript type-check | Passed |
| JavaScript tests | Passed: 4 files, 9 tests |
| Production build | Passed |
| Python model tests | Passed: 7 tests |
| Real LSTM demo smoke test | Passed; committed CSE-CIC-IDS2018 artifact loaded |
| CSV forecast smoke test | Passed; 12-row temporal sequence scored |
| Live demo endpoint | Passed; 48 demo flows, no fallback |
| Live CSV upload endpoint | Passed; real LSTM result returned |
| Flow-only reliability check | Passed; missing packet features reported and defer recommended |
| K=11 boundary check | Passed; rejected with HTTP 400 |
| Temporary upload cleanup | Passed; upload directory empty after request |

## Run commands

```bash
npm install
npm run setup:python
npm run check
npm test
npm run build
.venv/bin/python -m pytest Defender/Backend/models/python/tests
npm run smoke:python
npm run dev
```

## Runtime behavior

The application runs locally. The forecast engine loads the committed PyTorch state dictionary and configuration from the repository. If the Python environment is not installed, the server returns a clear setup message instead of presenting a fabricated forecast as a successful model result.

The dashboard accepts CSV, PCAP, and PCAPNG uploads. Flow-only CSV files are accepted, but the result marks packet-level fields as unavailable and recommends analyst review. Uploaded files are written to a generated temporary filename and removed after processing.

## Evaluation disclosure

The measured cross-day benchmark remains visible in the application and documentation. The temporal model improves recall over the logistic baseline, but currently has lower F1 and a higher false-positive rate. The system is decision support for analyst triage, not an autonomous blocking system.

## Packaging note

The final archive excludes local dependency directories, build output, Git metadata, caches, logs, and temporary uploads. Reviewers should run the setup commands above from the archive root.
