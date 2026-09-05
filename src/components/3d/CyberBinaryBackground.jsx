import React, { useEffect, useRef, memo } from 'react';

const CyberBinaryBackground = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));
    };

    window.addEventListener('resize', handleResize);

    let lastTime = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const render = (currentTime) => {
      animationFrameId = requestAnimationFrame(render);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      // Fade canvas slightly for trail effect on dark void
      ctx.fillStyle = 'rgba(5, 7, 10, 0.18)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", "Fira Code", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = Math.random() > 0.5 ? '1' : '0';
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Lead character slightly brighter green, trail dimmer green
        if (Math.random() > 0.85) {
          ctx.fillStyle = 'rgba(0, 255, 136, 0.35)'; // Crisp cyber green lead
        } else {
          ctx.fillStyle = 'rgba(0, 180, 90, 0.15)'; // Low-opacity subtle trail
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: '#05070A',
        opacity: 0.85,
      }}
      aria-hidden="true"
    />
  );
});

CyberBinaryBackground.displayName = 'CyberBinaryBackground';

export default CyberBinaryBackground;
