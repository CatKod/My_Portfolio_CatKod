'use client';

import { FormEvent, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

export default function ContactClient() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    // No backend; store locally and show success
    try {
      const raw = window.localStorage.getItem('catkod.contact');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({
        name,
        email,
        message,
        ts: Date.now(),
      });
      window.localStorage.setItem('catkod.contact', JSON.stringify(list.slice(0, 20)));
    } catch {
      /* noop */
    }
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="contact-scene">
      <header className="scene-head reveal">
        <p className="mono-label">07 — Contact</p>
        <h1>{t('contact.title')}</h1>
      </header>

      <div className="contact-grid reveal">
        <form className="contact-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="ct-name">{t('contact.form.name')}</label>
            <input
              id="ct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="ct-email">{t('contact.form.email')}</label>
            <input
              id="ct-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="ct-msg">{t('contact.form.message')}</label>
            <textarea
              id="ct-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={600}
            />
          </div>
          <button className="btn-primary" type="submit">
            {t('contact.form.submit')}
          </button>
        </form>

        <aside className="contact-info">
          <div className="contact-info-block">
            <span>Email</span>
            <a href="mailto:hello@catkod.dev">hello@catkod.dev</a>
          </div>
          <div className="contact-info-block">
            <span>GitHub</span>
            <a href="https://github.com/catkod" target="_blank" rel="noreferrer">
              github.com/catkod
            </a>
          </div>
          <div className="contact-info-block">
            <span>LinkedIn</span>
            <a href="https://www.linkedin.com/in/catkod" target="_blank" rel="noreferrer">
              linkedin.com/in/catkod
            </a>
          </div>
          <div className="contact-info-block">
            <span>Location</span>
            <a>TP. Hồ Chí Minh, Việt Nam</a>
          </div>
          {submitted && (
            <div className="contact-info-block" role="status">
              <span>Status</span>
              <a style={{ color: 'var(--ink)' }}>{t('contact.success')}</a>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}