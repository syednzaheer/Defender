# Defender Architecture — SIH 26153

## Data and inference path

Telemetry enters through the React **How It Works** dropzone or **Run Forecast** workspace. CSV headers are checked in the browser and CSV/PCAP/PCAPNG content is staged as a bounded base64 upload. The local Express server receives the request at `POST /api/v1/forecast`, writes an upload only for the duration of inference, invokes `Defender/Backend/models/python/bridge.py` when the reviewed bridge is present, and deletes the temporary file in a `finally` block. If the bridge or model artifact is unavailable, the route returns a deterministic benchmark-backed fallback so the offline demo remains runnable.

The canonical state is a 22-dimensional vector combining flow-level fields (ports, protocol, TCP flags, volume, packet count, duration, inter-arrival statistics, and directionality) with packet-level fields (TTL, TCP window, payload size, and retransmissions). A temporal model consumes a sliding history and predicts both the next state and a malicious-hazard score. The UI rolls that hazard forward for K steps, maps the trajectory to five high-level ATT&CK stages, and displays perturbation-based feature attributions, a probability timeline, flagged flows, and reliability metadata.

## Software boundaries

| Layer | Implementation | Responsibility |
|---|---|---|
| Presentation | React/Vite in `client/src/original` | Navigation, ingestion, forecast visualizations, explainability, and chat |
| Local analyst guide | `client/src/cyperbot` plus `/api/v1/cyper/chat` | Auditable project knowledge and live-result explanations |
| API | Express and tRPC in `server` | Forecast bridge, telemetry validation, benchmark contract, and app serving |
| Model bridge | Python in `Defender/Backend/models/python` | Optional local PyTorch inference and artifact loading |
| Evidence | `Defender/Backend/docs` | Cross-day benchmark, limitations, and reproducibility notes |

## Explainability and trust

CYPER does not invent a result or call a remote model. After a forecast, the parent React app stores the exact returned result and passes it to the chat context. CYPER can therefore describe the same stage, risk, timeline, attributions, flagged-flow count, source, and reliability fields visible on screen. All score explanations are framed as model evidence for prioritization rather than proof of compromise. The benchmark note explicitly preserves the measured baseline comparison and known packet/flow join limitation.
