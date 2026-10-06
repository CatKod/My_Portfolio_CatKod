'use client';

import { useEffect, useState } from 'react';

export default function InitialLoader() {
  const [leaving, setLeaving] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 1100);
    const t2 = setTimeout(() => setHidden(true), 1900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Hoàng Kim Vĩnh portfolio"
      className={`initial-loader${leaving ? ' is-leaving' : ''}`}
    >
      <div className="loader-shell">
        <span className="loader-dot loader-dot--left" />
        <span className="loader-scanline" />
        <span aria-hidden="true" className="loader-wordmark">
          Hello
        </span>
        <span className="loader-scanline" />
        <span className="loader-dot loader-dot--right" />
      </div>
    </div>
  );
}