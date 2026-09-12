import React, { useState } from 'react';

const GlassCard = ({ children, className = '', style = {}, hoverEffect = true, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`glass-card ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered && hoverEffect ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${isHovered && hoverEffect ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
        borderRadius: '12px',
        padding: '24px',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        boxShadow: isHovered && hoverEffect ? '0 12px 32px rgba(0, 0, 0, 0.45)' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
