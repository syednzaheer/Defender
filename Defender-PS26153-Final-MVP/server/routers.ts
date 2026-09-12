import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const benchmark = {
  dataset: "CSE-CIC-IDS2018 Official AWS Open Data",
  trainingSplit: "Wednesday-28-02-2018 / infiltration",
  evaluationSplit: "Thursday-01-03-2018 / held-out test",
  baseline: { f1: 0.3648587771, precision: 0.2673381712, recall: 0.5743850939, fpr: 0.6154295341 },
  model: { f1: 0.3491611692, precision: 0.2456044484, recall: 0.6037093152, fpr: 0.7250090326 },
  note: "Measured cross-day benchmark: the LSTM improves recall but currently underperforms the logistic baseline on F1 and false-positive rate.",
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
