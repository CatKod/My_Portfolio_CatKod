'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

const PHRASES: { words: string[] }[] = [
  { words: ['full-stack', 'web', 'apps'] },
  { words: ['ai', 'agents', 'pipelines'] },
  { words: ['automation', 'workflows', 'bots'] },
  { words: ['maps', 'data', 'dashboards'] },
];

export default function HomeClient() {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length);
        setActive(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const phrase = PHRASES[index];

  return (
    <div className="home-scene">
      <svg
        className="home-line-art reveal"
        aria-hidden="true"
        viewBox="0 0 946 842"
        width="946"
        height="842"
      >
        <path
          className="home-line-art-path"
          d="M120 720 C 240 540, 360 760, 460 600 S 700 720, 820 480"
        />
      </svg>

      <div className="home-title reveal">
        <p className="mono-label">Portfolio 2026 / full-stack + ai + automation</p>
        <h1>Hoàng Kim Vĩnh</h1>
      </div>

      <div className="home-intro reveal">
        <p className="home-role">
          <span>{t('home.role.lead')}</span>
          <span aria-label={phrase.words.join(' ')} className="rotating-text" role="text">
            <span className="rotating-text-window">
              <span className={`rotating-text-phrase${active ? ' is-active' : ''}`}>
                {phrase.words.map((w, i) => (
                  <span key={`${w}-${i}`} className="rotating-text-word">
                    {w}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </p>
        <p className="home-intro-copy">{t('home.tagline')}</p>
        <div className="home-actions">
          <a href="/projects" className="btn-primary">
            {t('cta.projects')}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </a>
          <a href="/contact" className="btn-secondary">
            {t('cta.cv')}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </a>
        </div>
      </div>

      <div className="home-system reveal">
        <div className="home-system-head">
          <span className="mono-label">Capability map</span>
          <strong>{t('home.capability.lede')}</strong>
        </div>
        <div className="home-capability-grid">
          <article className="home-capability-card">
            <span>{t('home.cap.web')}</span>
            <h2>{t('home.cap.web.title')}</h2>
            <p>{t('home.cap.web.desc')}</p>
          </article>
          <article className="home-capability-card">
            <span>{t('home.cap.auto')}</span>
            <h2>{t('home.cap.auto.title')}</h2>
            <p>{t('home.cap.auto.desc')}</p>
          </article>
          <article className="home-capability-card">
            <span>{t('home.cap.ai')}</span>
            <h2>{t('home.cap.ai.title')}</h2>
            <p>{t('home.cap.ai.desc')}</p>
          </article>
          <article className="home-capability-card">
            <span>{t('home.cap.gis')}</span>
            <h2>{t('home.cap.gis.title')}</h2>
            <p>{t('home.cap.gis.desc')}</p>
          </article>
        </div>
      </div>
    </div>
  );
}