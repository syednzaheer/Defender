import React from 'react';
import Badge from '../components/ui/Badge';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const NotFound = ({ onTabChange }) => {
  return (
    <main
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <Badge dot dotColor="#FF5F56">
          ERROR 404 // NODE UNREACHABLE
        </Badge>
      </div>

      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 95, 86, 0.1)',
          border: '1px solid rgba(255, 95, 86, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <ShieldAlert size={32} color="#FF5F56" />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}
      >
        Vector Not Found
      </h1>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)',
          fontSize: '15px',
          maxWidth: '480px',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}
      >
        This page doesn&apos;t exist in Defender. Head back to the home workspace to continue.
      </p>

      <button
        type="button"
        onClick={() => (onTabChange ? onTabChange('home') : (window.location.href = '/'))}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--accent-white)',
          color: '#000000',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '14px',
          padding: '12px 24px',
          borderRadius: '9999px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={16} /> Back to Defender Home
      </button>
    </main>
  );
};

export default NotFound;
