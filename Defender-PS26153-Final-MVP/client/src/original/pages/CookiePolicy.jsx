import React from 'react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { Lock } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Badge icon={Lock} variant="info">COOKIE & STORAGE POLICY</Badge>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            ZERO NON-ESSENTIAL TRACKING
          </span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Cookie Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Last updated: September 7, 2026
        </p>
      </div>

      <GlassCard style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              1. Cookie & Storage Inventory
            </h2>
            <p>
              Defender does <strong>not use non-essential tracking cookies, advertising cookies, or third-party behavioral analytics</strong>.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>STORAGE MECHANISM</th>
                  <th style={{ padding: '8px' }}>PURPOSE</th>
                  <th style={{ padding: '8px' }}>CATEGORY</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#F4F4F6' }}>
                  <td style={{ padding: '8px' }}>React Component Memory</td>
                  <td style={{ padding: '8px' }}>Maintains active tab navigation, forecast horizon state, and chat history.</td>
                  <td style={{ padding: '8px', color: '#10B981' }}>Strictly Necessary (Transient)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px' }}>
              2. Consent & User Control
            </h2>
            <p>
              Because only essential transient storage is used to render the application, non-essential cookie consent prompts are unnecessary under applicable privacy frameworks (such as GDPR ePrivacy directive or Indian DPDP Act guidelines for essential technical storage).
            </p>
          </div>

        </div>
      </GlassCard>
    </div>
  );
}
