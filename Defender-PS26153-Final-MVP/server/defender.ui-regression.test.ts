import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "client", "src", "original");

describe("Defender Original UI regression requirements", () => {
  it("keeps all nine verified source cards linked to official sources", () => {
    const source = readFileSync(`${root}/components/sections/LogoTicker.jsx`, "utf8");
    for (const name of ["CIC-IDS2017", "CSE-CIC-IDS2018", "UNSW-NB15", "CTU-13", "CICIoT2023", "LANL Authentication", "DARPA IDS", "MITRE ATT&CK + CAPEC", "CVE/NVD + NCIIPC"]) {
      expect(source).toContain(name);
    }
    expect(source.match(/href:/g)?.length).toBe(9);
  });

  it("does not render a numeric value in the center of the Defender Radar", () => {
    const source = readFileSync(`${root}/components/ui/DefenderRadar.jsx`, "utf8");
    expect(source).not.toContain("0.74");
    expect(source).toContain("HORIZON SIGNAL");
  });

  it("keeps the footer bottom bar free of the removed scientific-boundary copy", () => {
    const source = readFileSync(`${root}/components/layout/Footer.jsx`, "utf8");
    expect(source).not.toContain("Scientific boundary:");
    expect(source).toContain("Privacy Policy");
    expect(source).toContain("Terms &amp; Conditions");
  });

  it("removes the duplicate preset loader and keeps the four-step demo compact", () => {
    const source = readFileSync(`${root}/components/sections/HowItWorksSection.jsx`, "utf8");
    expect(source).not.toContain("LOAD VALIDATED PRESET:");
    expect(source).toContain("Use the dataset links above for source provenance");
    expect(source).toContain("tcp-flags-value");
    expect(source).toContain("how-trajectory");
    expect(source).toContain("how-attribution");
  });

  it("frames Run Forecast with a parallel metadata row and transparent radar", () => {
    const source = readFileSync(`${root}/components/sections/ForecastWorkspace.jsx`, "utf8");
    expect(source).toContain("forecast-header-copy");
    expect(source).toContain("forecast-meta-row");
    expect(source).toContain("background: 'transparent'");
  });
});
