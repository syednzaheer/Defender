import React from 'react';

const columns = Array.from({ length: 34 }, (_, index) => ({
  left: `${(index / 34) * 100}%`,
  delay: `${(index % 9) * -0.7}s`,
  duration: `${8 + (index % 6)}s`,
  value: index % 3 === 0 ? '10110010' : index % 3 === 1 ? '01001101' : '11001001',
}));

export default function CyberBinaryBackground() {
  return (
    <div className="binary-background" aria-hidden="true">
      {columns.map((column, index) => (
        <span key={index} style={{ left: column.left, animationDelay: column.delay, animationDuration: column.duration }}>
          {column.value}
        </span>
      ))}
    </div>
  );
}
