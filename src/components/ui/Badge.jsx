import React from 'react';

const Badge = ({ children, dot = false, dotColor = '#FFFFFF', className = '', style = {} }) => {
  return (
    <span
      className={`badge-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid var(--border-subtle)',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-secondary)',
        padding: '6px 14px',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            boxShadow: `0 0 8px ${dotColor}`,
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
