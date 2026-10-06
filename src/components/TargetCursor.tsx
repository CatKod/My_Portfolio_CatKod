'use client';

import { useEffect, useRef } from 'react';

export default function TargetCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const rotor = rotorRef.current;
    if (!root || !ring || !rotor) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      root.style.display = 'none';
      return;
    }

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: target.x, y: target.y };

    // Visual state machine: idle | hovering
    let mode: 'idle' | 'hovering' = 'idle';
    let spin = 0; // continuous rotation for idle ring
    let raf = 0;
    let lastTs = performance.now();

    // Color tokens
    const COLOR_IDLE = 'rgba(17, 17, 17, 0.85)';
    const COLOR_HOVER_DEFAULT = 'rgba(255, 90, 60, 1)'; // brand accent on hover when no data-cursor-color

    // Pick color hint from a hovered element. Falls back to brand accent.
    function pickColor(el: Element | null): string {
      if (!el) return COLOR_HOVER_DEFAULT;
      const host =
        (el.closest('[data-cursor-color]') as HTMLElement | null) ||
        (el as HTMLElement).dataset?.cursorColor
          ? (el as HTMLElement)
          : null;
      const explicit =
        host?.getAttribute('data-cursor-color') ||
        (el as HTMLElement).getAttribute?.('data-cursor-color');
      if (explicit) return explicit;
      return COLOR_HOVER_DEFAULT;
    }

    function onMove(e: MouseEvent) {
      target.x = e.clientX;
      target.y = e.clientY;
    }

    function checkHover() {
      const el = document.elementFromPoint(target.x, target.y);
      const interactive = !!(
        el &&
        (el.closest('a') ||
          el.closest('button') ||
          el.closest('input') ||
          el.closest('textarea') ||
          el.closest('select') ||
          el.closest('[data-cursor="hover"]'))
      );

      if (interactive !== (mode === 'hovering')) {
        mode = interactive ? 'hovering' : 'idle';
        applyMode();
      }

      if (mode === 'hovering') {
        const color = pickColor(el);
        const ringEl = ringRef.current;
        if (ringEl && ringEl.style.borderColor !== color) ringEl.style.borderColor = color;
      }
    }

    function applyMode() {
      const ringEl = ringRef.current;
      const rotorEl = rotorRef.current;
      if (!ringEl || !rotorEl) return;
      if (mode === 'hovering') {
        // Squircle-ish: rounded square with a little corner radius
        ringEl.style.borderRadius = '6px';
        ringEl.style.width = '30px';
        ringEl.style.height = '30px';
        ringEl.style.borderColor = COLOR_HOVER_DEFAULT;
        rotorEl.style.opacity = '0'; // hide the inner rotating dot when hovering
      } else {
        // Circle with rotating accent
        ringEl.style.borderRadius = '50%';
        ringEl.style.width = '26px';
        ringEl.style.height = '26px';
        ringEl.style.borderColor = COLOR_IDLE;
        rotorEl.style.opacity = '1';
      }
    }

    function loop(ts: number) {
      const dt = Math.min(48, ts - lastTs); // clamp for tab-blur jumps
      lastTs = ts;

      const ringEl = ringRef.current;
      const rotorEl = rotorRef.current;
      if (!ringEl || !rotorEl) {
        raf = requestAnimationFrame(loop);
        return;
      }

      // Smooth follow
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;

      // Continuous spin for idle rotor
      spin += dt * 0.18; // ~28°/100ms = 0.28 rad/16ms-ish, smooth

      ringEl.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
      rotorEl.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%) rotate(${spin}deg)`;

      raf = requestAnimationFrame(loop);
    }

    // Initialize visuals
    applyMode();
    {
      const rotorEl = rotorRef.current;
      if (rotorEl) {
        rotorEl.style.opacity = '1';
        rotorEl.style.borderColor = COLOR_IDLE;
      }
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
      {/* Outer ring: idle = rotating circle, hover = static rounded square with brand color */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 26,
          height: 26,
          border: '1.4px solid rgba(17,17,17,0.85)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          transition:
            'border-radius 0.25s ease, width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background-color 0.25s ease',
        }}
      />
      {/* Inner rotating dot: only visible in idle mode, gives the "spin" effect */}
      <div
        ref={rotorRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          color: 'rgba(255,90,60,1)',
          transformOrigin: 'center',
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.2s ease',
        }}
      />
    </div>
  );
}