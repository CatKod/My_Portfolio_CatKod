'use client';

import { useLanguage } from '@/components/LanguageProvider';

export default function AboutClient() {
  const { t } = useLanguage();
  return (
    <div className="about-scene">
      <header className="scene-head reveal">
        <p className="mono-label">02 — About</p>
        <h1>{t('about.title')}</h1>
        <p>{t('about.bio.1')}</p>
      </header>

      <div className="about-grid reveal">
        <div className="about-bio">
          <p>{t('about.bio.1')}</p>
          <p>{t('about.bio.2')}</p>
        </div>
        <aside style={{ display: 'grid', gap: 16 }}>
          <div className="about-panel">
            <h3>{t('about.focus')}</h3>
            <ul>
              <li>— {t('about.focus.1')}</li>
              <li>— {t('about.focus.2')}</li>
              <li>— {t('about.focus.3')}</li>
            </ul>
          </div>
          <div className="about-panel">
            <h3>{t('about.interests')}</h3>
            <ul>
              <li>— {t('about.interest.1')}</li>
              <li>— {t('about.interest.2')}</li>
              <li>— {t('about.interest.3')}</li>
              <li>— {t('about.interest.4')}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}