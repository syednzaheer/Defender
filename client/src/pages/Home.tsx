import { Link } from "wouter";
import { ArrowRight, BrainCircuit, Database, ExternalLink, Radar, ShieldCheck, Upload, Waves } from "lucide-react";
import DefenderRadar from "@/components/DefenderRadar";

const logo = "/manus-storage/logo_35aff366.png";

const sources = [
  { name: "CSE-CIC-IDS2018", status: "Implemented / validated", href: "https://www.unb.ca/cic/datasets/ids-2018.html" },
  { name: "CTU-13", status: "Adapter-ready", href: "https://www.stratosphereips.org/datasets-ctu13" },
  { name: "UNSW-NB15", status: "Adapter-ready", href: "https://research.unsw.edu.au/projects/unsw-nb15-dataset" },
  { name: "CICIoT2023", status: "Reference source", href: "https://www.unb.ca/cic/datasets/iotdataset-2023.html" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <img src={logo} alt="Defender logo" />
      <div>
        <strong>DEFENDER</strong>
        {!compact && <span>NTRO / SIH26153</span>}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="site-shell landing-shell">
      <header className="landing-nav page-width">
        <Link href="/" className="brand-link"><Brand /></Link>
        <nav className="landing-links" aria-label="Primary navigation">
          <a href="#capabilities">Capabilities</a>
          <a href="#datasets">Datasets</a>
          <a href="#architecture">Architecture</a>
          <Link href="/dashboard" className="nav-cta">Open console <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <main>
        <section className="hero page-width">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> DEFENSIVE INTELLIGENCE / LIVE PREVIEW</div>
            <h1>Predict the attack<br /><em>before the compromise.</em></h1>
            <p className="hero-lede">Defender turns network telemetry into an interpretable view of what happens next — giving security teams a calmer, earlier signal across the attack chain.</p>
            <div className="hero-actions">
              <Link href="/dashboard" className="button button-primary">Enter Defender console <ArrowRight size={17} /></Link>
              <a href="#architecture" className="button button-ghost">See how it works</a>
            </div>
            <div className="hero-note"><ShieldCheck size={15} /> CSE-CIC-IDS2018 cross-day benchmark retained without fabricated metrics</div>
          </div>
          <div className="hero-visual">
            <div className="radar-frame">
              <div className="radar-frame-label"><span>DEFENDER RADAR</span><span className="live-indicator"><i /> LIVE SIGNAL</span></div>
              <DefenderRadar size="large" />
              <div className="radar-frame-footer"><span>THREAT HORIZON / 5 STEPS</span><span>WORLD MODEL ONLINE</span></div>
            </div>
          </div>
        </section>

        <section className="signal-strip page-width" aria-label="Platform signals">
          <div><span className="signal-value">22</span><span className="signal-label">common telemetry<br />features</span></div>
          <div><span className="signal-value">5</span><span className="signal-label">projected ATT&amp;CK<br />stages</span></div>
          <div><span className="signal-value">0.349</span><span className="signal-label">validated held-out<br />F1 score</span></div>
          <div><span className="signal-value signal-live">●</span><span className="signal-label">adapter boundary<br />ready</span></div>
        </section>

        <section id="capabilities" className="section page-width">
          <div className="section-heading"><div><div className="eyebrow">01 / WHAT DEFENDER SEES</div><h2>From raw signals to a<br /><span>forecastable state.</span></h2></div><p>Designed around the SIH26153 contract: preserve the telemetry you have, surface the uncertainty you do not, and keep every claim traceable.</p></div>
          <div className="capability-grid">
            <article className="feature-card feature-card-tall"><div className="card-icon"><Radar size={19} /></div><div><span className="card-kicker">THREAT HORIZON</span><h3>Know the next move.</h3><p>Project the likely attack stage across Reconnaissance, Initial Access, Lateral Movement, Command &amp; Control, and Exfiltration.</p></div><Link href="/dashboard/overview" className="card-link">Open radar <ArrowRight size={15} /></Link></article>
            <article className="feature-card"><div className="card-icon"><Waves size={19} /></div><span className="card-kicker">DUAL MATRIX</span><h3>Flow + packet context.</h3><p>Separate the durable flow-level signal from the packet-level timing and signature evidence.</p></article>
            <article className="feature-card"><div className="card-icon"><BrainCircuit size={19} /></div><span className="card-kicker">EXPLAINABILITY</span><h3>Evidence, not mystery.</h3><p>Surface perturbation-based feature attribution without mislabeling it as SHAP.</p></article>
            <article className="feature-card"><div className="card-icon"><Upload size={19} /></div><span className="card-kicker">INGESTION ZONE</span><h3>Bring your own CSV.</h3><p>Validate telemetry, see the selected file, and pass it to the adapter boundary when the contract is satisfied.</p></article>
          </div>
        </section>

        <section id="architecture" className="architecture-section">
          <div className="page-width architecture-inner">
            <div className="section-heading"><div><div className="eyebrow">02 / THE PIPELINE</div><h2>Built for the distance<br /><span>between now and next.</span></h2></div><p>Every dataset follows the same transparent path before it can influence a forecast.</p></div>
            <div className="pipeline">
              {["Dataset", "Adapter", "Normalization", "22-feature contract", "Temporal state", "World model", "Forecast"].map((step, index) => <div className="pipeline-step" key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < 6 && <ArrowRight size={15} />}</div>)}
            </div>
            <div className="architecture-note"><Database size={17} /><span><strong>One validated path.</strong> CSE-CIC-IDS2018 is the packaged end-to-end benchmark. Other sources are clearly marked adapter-ready or reference-only until actually processed.</span></div>
          </div>
        </section>

        <section id="datasets" className="section page-width dataset-section">
          <div className="section-heading"><div><div className="eyebrow">03 / DATASET TAXONOMY</div><h2>Grounded in real<br /><span>security data.</span></h2></div><Link href="/dashboard/datasets" className="text-link">View full taxonomy <ArrowRight size={15} /></Link></div>
          <div className="source-grid">{sources.map((source) => <a className="source-card" key={source.name} href={source.href} target="_blank" rel="noreferrer"><div><span className={`status-dot ${source.status.startsWith("Implemented") ? "status-green" : "status-amber"}`} />{source.status}</div><strong>{source.name}</strong><ExternalLink size={15} /></a>)}</div>
        </section>
      </main>

      <footer className="site-footer page-width"><Brand compact /><span>Defender / Cyber threat forecasting interface</span><span>Public sources linked for traceability</span></footer>
    </div>
  );
}
