'use client';

import { useEffect, useRef } from 'react';

export default function TargetCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const rotor = rotorRef.current;
    if (!root || !rotor) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      root.style.display = 'none';
      return;
    }

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };
    let hovering = false;
    let raf = 0;

    function onMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
    }

    function checkHover() {
      const el = document.elementFromPoint(target.x, target.y);
      const interactive = !!(el && (el.closest('a') || el.closest('button') || el.closest('input') || el.closest('textarea') || el.closest('select')));
      if (interactive !== hovering) {
        hovering = interactive;
        rotor!.style.transform = `translate(-50%,-50%) scale(${hovering ? 1.6 : 1})`;
      }
    }

    function loop() {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      root!.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', checkHover, { passive: true });
    document.addEventListener('mouseover', checkHover, true);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', checkHover);
      document.removeEventListener('mouseover', checkHover, true);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="target-cursor"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 80,
        mixBlendMode: 'difference',
      }}
    >
      <div
        ref={rotorRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 28,
          height: 28,
          border: '1px solid rgba(255,255,255,0.7)',
          borderRadius: 0,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.25s ease-out',
        }}
      />
    </div>
  );
}