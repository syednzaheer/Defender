import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Badge icon={ShieldCheck} variant="info">LEGAL & PRIVACY</Badge>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            LOCAL DATA FLOW POLICY
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Last updated: September 12, 2026
        </p>
      </div>

      <GlassCard style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          <section>
            <h2>1. Overview</h2>
            <p>
              Defender is designed to process network telemetry locally. Uploaded CSV, PCAP, and PCAPNG files are handled by the local application during the active session and are removed after forecast processing completes.
            </p>
          </section>

          <section>
            <h2>2. Information handled by the application</h2>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li><strong>Telemetry files:</strong> Network flow or packet data selected for analysis.</li>
              <li><strong>Local session state:</strong> Active navigation, selected forecast horizon, and conversation context held in browser memory.</li>
              <li><strong>Technical logs:</strong> Standard server output needed to diagnose local operation. No analytics or advertising scripts are included.</li>
            </ul>
          </section>

          <section>
            <h2>3. Retention and sharing</h2>
            <p>
              The application does not sell telemetry, share it with advertisers, or send it to an external analytics platform. Optional integrations are inactive unless explicitly configured by the operator. Local uploaded files are cleaned up after processing.
            </p>
          </section>

          <section>
            <h2>4. Operator responsibility</h2>
            <p>
              Do not upload telemetry containing information that you are not authorized to process. Operators should protect their local environment and remove any exported data that is no longer required.
            </p>
          </section>

          <section>
            <h2>5. Payments</h2>
            <p>
              Defender does not process payments, sell subscriptions, or collect financial information.
            </p>
          </section>
        </div>
      </GlassCard>
    </div>
  );
}
