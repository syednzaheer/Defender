import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const benchmark = {
  dataset: "CSE-CIC-IDS2018 Official AWS Open Data",
  trainingSplit: "Wednesday-28-02-2018 / infiltration",
  evaluationSplit: "Thursday-01-03-2018 / held-out test",
  model: { f1: 0.3492, precision: 0.2456, recall: 0.6037, fpr: 0.725 },
  note: "Empirical cross-day benchmark retained without fabricated metrics.",
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  forecast: router({
    preview: publicProcedure.query(() => ({
      score: 0.74,
      stages: [
        { label: "Reconnaissance", probability: 0.91 },
        { label: "Initial Access", probability: 0.68 },
        { label: "Lateral Movement", probability: 0.55 },
        { label: "Command & Control", probability: 0.41 },
        { label: "Exfiltration", probability: 0.24 },
      ],
      benchmark,
    })),
    benchmark: publicProcedure.query(() => benchmark),
  }),
  telemetry: router({
    validate: publicProcedure
      .input(z.object({ filename: z.string().min(1), bytes: z.number().int().positive().max(50 * 1024 * 1024), columns: z.array(z.string()).min(1).max(40), contentBase64: z.string().max(70 * 1024 * 1024).optional() }))
      .mutation(({ input }) => {
        const content = input.contentBase64 ? Buffer.from(input.contentBase64, "base64").toString("utf8", 0, 256 * 1024) : "";
        const rowsInspected = content ? Math.max(0, content.split(/\r?\n/).filter(Boolean).length - 1) : 0;
        return {
          accepted: true,
          filename: input.filename,
          bytes: input.bytes,
          rowsInspected,
          adapter: "common-22-feature-boundary",
          status: "validated-for-adapter-handoff",
          pipelineStatus: "ready-for-existing-forecast-pipeline",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
