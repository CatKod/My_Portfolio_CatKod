'use client';

import { useEffect, useRef } from 'react';

export default function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    let mouse = { x: -9999, y: -9999 };
    let raf = 0;

    const SPACING = 38;
    const MAX_DIST = 110;

    function resize() {
      const rect = wrapper!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      particles = [];
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particles.push({
            x: i * SPACING + (j % 2 === 0 ? 0 : SPACING / 2),
            y: j * SPACING,
            vx: 0,
            vy: 0,
            r: 1,
          });
        }
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = 'rgba(17, 17, 17, 0.18)';
      for (const p of particles) {
        // gentle repulsion from cursor
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MAX_DIST) {
          const f2 = (1 - dist / MAX_DIST) * 0.6;
          p.vx += (dx / (dist || 1)) * f2;
          p.vy += (dy / (dist || 1)) * f2;
        }
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        // softly return to lattice
        const ySnap = Math.round(p.y / SPACING) * SPACING;
        const xSnap = Math.round(p.x / SPACING) * SPACING + (Math.round(ySnap / SPACING) % 2 === 0 ? 0 : SPACING / 2);
        p.x += (xSnap - p.x) * 0.04;
        p.y += (ySnap - p.y) * 0.04;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      const spotlight = document.querySelector<HTMLElement>('.spotlight');
      if (spotlight) {
        spotlight.style.setProperty('--mx', `${mouse.x}px`);
        spotlight.style.setProperty('--my', `${mouse.y}px`);
      }
    }

    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    resize();
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="dot-field-layer">
      <div className="dot-field-container">
        <canvas ref={canvasRef} aria-hidden="true" />
      </div>
    </div>
  );
}