import { describe, expect, it } from "vitest";
import { fallbackBenchmark } from "./originalForecastRoutes";

describe("Original forecast compatibility route", () => {
  it("returns an explicitly labelled demo fallback with truthful metadata", () => {
    const result = fallbackBenchmark(5, "Original bundled CSE-CIC-IDS2018 demo telemetry");

    expect(result.success).toBe(true);
    expect(result.source_label).toContain("CSE-CIC-IDS2018");
    expect(result.total_flows).toBe(48);
    expect(result.timeline).toHaveLength(5);
    expect(result.model_source).toContain("cross-day benchmark");
    expect(result.benchmark_metrics?.f1).toBeCloseTo(0.3491611692, 6);
    expect(result.reliability.packet_features_missing).toContain("ttl_mean");
  });
});
