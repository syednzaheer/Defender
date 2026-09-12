import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Defender forecast contracts", () => {
  it("returns the measured benchmark without fabricated forecast values", async () => {
    const result = await appRouter.createCaller(createContext()).forecast.benchmark();
    expect(result.dataset).toContain("CSE-CIC-IDS2018");
    expect(result.model.f1).toBeCloseTo(0.3492);
  });

  it("accepts bounded CSV metadata for adapter handoff", async () => {
    const result = await appRouter.createCaller(createContext()).telemetry.validate({
      filename: "sample_traffic.csv",
      bytes: 1024,
      columns: ["src_port", "dst_port", "protocol", "flow_duration"],
      contentBase64: Buffer.from("src_port,dst_port,protocol\n443,5521,TCP\n").toString("base64"),
    });
    expect(result.accepted).toBe(true);
    expect(result.rowsInspected).toBe(1);
    expect(result.pipelineStatus).toBe("ready-for-existing-forecast-pipeline");
  });
});
