'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Item = { href: string; key: string; index: string };

export default function MobileMenu({ items, t }: { items: Item[]; t: (k: string) => string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="mobile-staggered-menu">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="mobile-staggered-toggle"
        onClick={() => setOpen((s) => !s)}
      >
        <span className="mobile-staggered-toggle-text">
          <span>{open ? 'Close' : 'Menu'}</span>
        </span>
        <span className="mobile-staggered-toggle-icon" aria-hidden="true">
          <span style={{ transform: open ? 'translateY(4.5px) rotate(45deg)' : 'none' }} />
          <span style={{ transform: open ? 'translateY(-4.5px) rotate(-45deg)' : 'none' }} />
        </span>
      </button>

      {open && (
        <nav className="mobile-staggered-panel" aria-label="Mobile navigation">
          <ul className="mobile-staggered-list">
            {items.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href} style={{ ['--item-index' as never]: items.indexOf(item) }}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={active ? 'is-active' : ''}
                  >
                    <span>{item.index}</span>
                    <strong>{t(item.key)}</strong>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}