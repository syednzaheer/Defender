import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

const CodeTerminal = ({ title = 'defender-terminal', code, language = 'javascript', style = {} }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: '#000000',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        ...style,
      }}
    >
      {/* Terminal Titlebar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(20, 20, 24, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>{title}</span>
        </div>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          style={{
            background: 'transparent',
            border: 'none',
            color: copied ? '#27C93F' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            transition: 'color 0.2s ease',
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'COPIED' : 'COPY'}</span>
        </button>
      </div>

      {/* Terminal Content */}
      <div
        style={{
          padding: '16px',
          overflowX: 'auto',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
        }}
      >
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeTerminal;
