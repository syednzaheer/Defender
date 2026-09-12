import { Router, type Request, type Response } from "express";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const router = Router();
const projectRoot = process.cwd();
const backendRoot = path.join(projectRoot, "Defender", "Backend");
const modelsRoot = path.join(backendRoot, "models");
const bridgePath = path.join(modelsRoot, "python", "bridge.py");
const samplePath = path.join(modelsRoot, "artifacts", "sample_data", "demo_flows.csv");
const metricsPath = path.join(modelsRoot, "artifacts", "cross_day_benchmark", "cross_day_benchmark_metrics.json");
const uploadRoot = path.join(modelsRoot, "artifacts", "uploads");
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set([".csv", ".pcap", ".pcapng"]);
const PYTHON_VENV = path.join(projectRoot, ".venv", "bin", "python");

function readMetrics() {
  try {
    return JSON.parse(fs.readFileSync(metricsPath, "utf8"));
  } catch {
    return null;
  }
}

export function fallbackBenchmark(steps: number, sourceLabel: string) {
  const metrics = readMetrics();
  const boundedSteps = Math.max(1, Math.min(10, steps || 5));
  const stages = metrics?.stages ?? ["Reconnaissance", "Initial Access", "Lateral Movement", "Command & Control", "Exfiltration"];
  const baseline = Number(metrics?.temporal_world_model?.recall ?? 0.6037);
  const timeline = Array.from({ length: boundedSteps }, (_, index) => ({
    forecast_step: index + 1,
    infiltration_probability: Number(Math.min(0.99, Math.max(0.05, baseline * (0.68 + index * 0.055))).toFixed(4)),
  }));
  return {
    success: true,
    source_label: sourceLabel,
    input_format: "demo",
    schema_version: "defender-canonical-v1",
    total_flows: 48,
    model_source: "Deterministic transparent fallback — CSE-CIC-IDS2018 cross-day benchmark evidence, not LSTM inference",
    predicted_stage: stages[Math.min(stages.length - 1, Math.floor((boundedSteps - 1) / 2))],
    stage_trajectory: timeline.map((_, index) => stages[Math.min(stages.length - 1, Math.floor(index / 2))]),
    peak_risk: timeline[timeline.length - 1]?.infiltration_probability ?? 0,
    timeline,
    explanations: [
      { feature: "tcp_syn_ratio", contribution: 0.421, stage: "Reconnaissance" },
      { feature: "destination_port", contribution: 0.312, stage: "Lateral Movement" },
      { feature: "iat_variance_ms", contribution: 0.184, stage: "Command & Control" },
      { feature: "ttl_variance", contribution: 0.128, stage: "Initial Access" },
      { feature: "retransmission_count", contribution: 0.096, stage: "Lateral Movement" },
    ],
    flagged_flows: [],
    reliability: {
      rows: Number(metrics?.test_rows ?? 331100),
      packet_features_available: ["ttl_mean", "ttl_variance", "tcp_window_mean", "payload_size_mean", "retransmission_count"],
      packet_features_missing: ["ttl_mean", "ttl_variance", "tcp_window_mean", "payload_size_mean", "retransmission_count"],
      novelty_fraction: 1,
      defer_recommended: true,
    },
    benchmark_metrics: metrics?.temporal_world_model ?? null,
    benchmark_fallback: true,
  };
}

function runBridge(payload: Record<string, unknown>, csvPath: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const pythonExe = process.platform === "win32"
      ? (process.env.PYTHON || "python")
      : (fs.existsSync(PYTHON_VENV) ? PYTHON_VENV : "python3");
    const pythonEngineDir = path.join(modelsRoot, "python");
    const child = spawn(pythonExe, [bridgePath], {
      cwd: backendRoot,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, PYTHONPATH: pythonEngineDir },
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), 30_000);
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(stderr || `Forecast bridge exited with code ${code}`));
      try { resolve(JSON.parse(stdout)); } catch { reject(new Error("Forecast bridge returned invalid JSON")); }
    });
    child.stdin.end(JSON.stringify({ ...payload, csv_path: csvPath }));
  });
}

router.post("/api/v1/forecast", async (req: Request, res: Response) => {
  const body = req.body ?? {};
  const steps = Number(body.steps ?? 5);
  if (!Number.isInteger(steps) || steps < 1 || steps > 10) {
    return res.status(400).json({ success: false, error: "steps must be an integer between 1 and 10" });
  }
  const upload = body.upload;
  const hasUpload = Boolean(upload?.content_base64);
  const useDemo = Boolean(body.use_demo) || !hasUpload;
  let csvPath = samplePath;
  let sourceLabel = "Bundled CSE-CIC-IDS2018 telemetry";
  let uploadedInput = false;

  try {
    if (hasUpload) {
      if (typeof upload.content_base64 !== "string" || !/^[A-Za-z0-9+/\s]+=*$/.test(upload.content_base64)) {
        return res.status(400).json({ success: false, error: "Upload content_base64 is not valid base64" });
      }
      const safeName = String(upload.filename || "uploaded.csv").replace(/[^a-zA-Z0-9._-]/g, "_");
      const extension = path.extname(safeName).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.has(extension)) {
        return res.status(400).json({ success: false, error: "Unsupported telemetry format. Use CSV, PCAP, or PCAPNG." });
      }
      const bytes = Buffer.from(upload.content_base64, "base64");
      if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) {
        return res.status(413).json({ success: false, error: "Upload must be between 1 byte and 50 MB" });
      }
      fs.mkdirSync(uploadRoot, { recursive: true });
      csvPath = path.join(uploadRoot, `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeName}`);
      fs.writeFileSync(csvPath, bytes, { flag: "wx", mode: 0o600 });
      sourceLabel = safeName;
      uploadedInput = true;
    }

    if (!fs.existsSync(bridgePath)) {
      return res.status(503).json({ success: false, error: "The local forecast engine is unavailable. Run npm run setup:python and retry." });
    }
    try {
      const result = await runBridge({ steps: Math.trunc(steps), model_mode: body.model_mode, use_demo: useDemo }, csvPath);
      return res.json(result);
    } catch (error) {
      console.warn("[Forecast] local bridge failed:", error);
      return res.status(503).json({ success: false, error: "The local forecast engine could not process this telemetry. Check the Python setup and input format." });
    }
  } finally {
    if (uploadedInput && csvPath.startsWith(uploadRoot) && fs.existsSync(csvPath)) fs.rmSync(csvPath, { force: true });
  }
});

router.get("/api/v1/benchmark", (_req: Request, res: Response) => {
  const metrics = readMetrics();
  if (!metrics) return res.status(503).json({ error: "Benchmark artifact is unavailable" });
  return res.json(metrics);
});

export default router;
