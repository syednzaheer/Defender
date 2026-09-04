import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';

const CyberMeshBackground = memo(() => {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobileMatch = window.matchMedia('(max-width: 768px)').matches || 
                          ('ontouchstart' in window && window.innerWidth < 768);
      setIsMobile(mobileMatch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050507);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 14, 26);
    camera.lookAt(0, -2, 0);

    // Renderer setup with DPR capped between 1 and 1.5
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Wireframe dynamic wave geometry
    const width = 64;
    const height = 64;
    const segmentsX = 64;
    const segmentsY = 64;
    const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);

    // Initial vertex positions
    const posAttribute = geometry.attributes.position;
    const initialPositions = new Float32Array(posAttribute.array.length);
    for (let i = 0; i < posAttribute.array.length; i++) {
      initialPositions[i] = posAttribute.array[i];
    }

    // Material: Obsidian spec with white/grey wireframe lines operating at 0.15 opacity
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2.2;
    mesh.position.y = -4;
    scene.add(mesh);

    // Mouse coordinates and lerped targets
    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Window resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime() * 0.9;

      // Lerp easing for mouse interaction
      target.x += (mouse.x - target.x) * 0.05;
      target.y += (mouse.y - target.y) * 0.05;

      // Gently tilt and warp wave perspective
      mesh.rotation.z = target.x * 0.12;
      mesh.rotation.x = -Math.PI / 2.2 + (target.y * 0.08);

      // Undulating wave vertex distortion
      const pos = geometry.attributes.position;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const x = initialPositions[i * 3];
        const y = initialPositions[i * 3 + 1];

        // Combine sinusoidal harmonics with cursor interaction
        const distance = Math.sqrt(x * x + y * y);
        const wave1 = Math.sin(distance * 0.45 - elapsedTime * 1.5) * 1.2;
        const wave2 = Math.cos((x + target.x * 12) * 0.3 + elapsedTime * 1.2) * 0.8;
        const wave3 = Math.sin((y - target.y * 12) * 0.35 + elapsedTime * 0.8) * 0.6;

        pos.setZ(i, wave1 + wave2 + wave3);
      }

      pos.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 20%, rgba(255,255,255,0.06) 0%, rgba(5,5,7,1) 70%)',
        }} 
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
});

CyberMeshBackground.displayName = 'CyberMeshBackground';

export default CyberMeshBackground;
