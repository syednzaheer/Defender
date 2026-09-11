import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { ShieldCheck, FileText, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Badge icon={ShieldCheck} variant="info">LEGAL & PRIVACY</Badge>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            VERIFIED DATA FLOW SPECIFICATION
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Last updated: September 7, 2026
        </p>
      </div>

      <GlassCard style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              1. Overview & Data Flow
            </h2>
            <p>
              Defender is designed as an <strong>offline-first network attack forecasting system</strong>. Network telemetry files (CSV flow exports or PCAP captures) uploaded to the workspace are processed locally by the PyTorch temporal LSTM engine. Telemetry data is analyzed in-memory or stored strictly within local workspace memory during your session.
            </p>
            <p style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #06B6D4', color: '#F4F4F6', fontSize: '13px' }}>
              This is a Smart India Hackathon 2026 (SIH26153) prototype submission, built by team <strong>Apex Legion</strong>. Contact for privacy/data questions: <code>syednzaheer1335@gmail.com</code>.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              2. Information We Collect
            </h2>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li><strong>Uploaded Telemetry:</strong> Network flow CSVs or PCAP packets submitted to the Run Forecast tool. These files are processed locally on the execution environment.</li>
              <li><strong>Local Session State:</strong> Transient component state (e.g. selected simulation step K, active tab) held in browser memory during usage.</li>
              <li><strong>CYPER chat questions (only when you ask the assistant something it can't answer):</strong> if you click "Notify the team" on an unanswered question, that question and a short forecast-context summary (predicted stage, risk score, contributing feature names — not raw telemetry) is emailed to the development team so they can follow up. This is the only data this application sends anywhere outside your own session.</li>
              <li><strong>No Third-Party Analytics:</strong> This application does not embed third-party tracking scripts, advertising SDKs, or external analytics platforms.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              3. Data Retention & Third-Party Sharing
            </h2>
            <p>
              We do not sell, rent, or transmit your telemetry or network state features to external cloud services or third parties. All forecast inference runs locally through the Express backend and Python bridge.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              4. Contact Information
            </h2>
            <p>
              For legal inquiries or questions regarding data processing, contact: <code>syednzaheer1335@gmail.com</code>.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              5. Payments &amp; Refunds
            </h2>
            <p>
              Defender does not process payments, sell any product or subscription, or collect financial information of any kind. No refund policy applies because no transaction ever occurs.
            </p>
          </div>

        </div>
      </GlassCard>
    </div>
  );
}
