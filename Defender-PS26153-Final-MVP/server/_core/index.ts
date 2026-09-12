import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import originalForecastRoutes from "../originalForecastRoutes";
import { answerCyperQuestion } from "../../client/src/cyperbot/cyperEngine.js";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Base64 expands uploads by roughly one third, so the body limit leaves room
  // for a maximum 50 MB telemetry file without accepting unbounded requests.
  app.use(express.json({ limit: "70mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);

  const requestWindows = new Map<string, { startedAt: number; count: number }>();
  let activeForecasts = 0;
  app.use("/api/v1/forecast", (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const current = requestWindows.get(key);
    if (!current || now - current.startedAt >= 60_000) {
      requestWindows.set(key, { startedAt: now, count: 1 });
    } else if (current.count >= 30) {
      res.status(429).json({ success: false, error: "Too many forecast requests. Please wait a minute and retry." });
      return;
    } else {
      current.count += 1;
    }
    if (activeForecasts >= 2) {
      res.status(429).json({ success: false, error: "Two forecast jobs are already running. Please retry shortly." });
      return;
    }
    activeForecasts += 1;
    res.once("finish", () => { activeForecasts = Math.max(0, activeForecasts - 1); });
    next();
  });
  app.use(originalForecastRoutes);
  app.post("/api/v1/cyper/chat", (req, res) => {
    const result = answerCyperQuestion({
      text: req.body?.message,
      context: req.body?.forecastContext ?? null,
      guideStep: req.body?.guideStep ?? null,
    } as any);
    return res.json(result);
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
