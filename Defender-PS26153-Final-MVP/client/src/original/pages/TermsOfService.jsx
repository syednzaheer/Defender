import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Badge icon={FileText} variant="info">TERMS & CONDITIONS</Badge>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            SERVICE AGREEMENT SPECIFICATION
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Terms & Conditions
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Last updated: September 7, 2026
        </p>
      </div>

      <GlassCard style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              1. Nature of the System
            </h2>
            <p>
              Defender is a predictive network attack forecasting MVP designed for security research, demonstration, and threat progression analysis. Model outputs (infiltration probabilities, forward trajectories, and feature attributions) represent statistical inferences and heuristic evaluations, not guaranteed forecasts or automated incident verdicts.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              2. User Obligations & Permitted Use
            </h2>
            <p>
              Users are responsible for ensuring they possess lawful authorization to analyze network telemetry files submitted to the system. You agree not to use Defender for unlawful surveillance, malicious activity, or reverse-engineering proprietary model parameters.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              3. Disclaimer of Warranties & Limitation of Liability
            </h2>
            <p>
              The system is provided &ldquo;as is&rdquo; without warranties of any kind. The developers and team (<strong>Apex Legion</strong>, Smart India Hackathon 2026 submission for NTRO PS 26153) accept no liability for operational decisions, false positives, or reliance placed on prediction outputs.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              4. Governing Law & Jurisdiction
            </h2>
            <p>
              These terms shall be governed in accordance with the applicable laws of India.
            </p>
          </div>

        </div>
      </GlassCard>
    </div>
  );
}
