'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

type Entry = {
  id: string;
  name: string;
  message: string;
  ts: number;
};

const STORAGE_KEY = 'catkod.guestbook';

export default function GuestbookClient() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* noop */
    }
  }, [entries, hydrated]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const entry: Entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      message: message.trim(),
      ts: Date.now(),
    };
    setEntries((prev) => [entry, ...prev]);
    setName('');
    setMessage('');
  };

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <div className="about-scene">
      <header className="scene-head reveal">
        <p className="mono-label">06 — Guestbook</p>
        <h1>{t('guestbook.title')}</h1>
      </header>

      <form className="guestbook-form reveal" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="gb-name">{t('guestbook.form.name')}</label>
          <input
            id="gb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="CatKod"
            required
            maxLength={64}
          />
        </div>
        <div>
          <label htmlFor="gb-msg">{t('guestbook.form.message')}</label>
          <textarea
            id="gb-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('common.placeholder')}
            required
            maxLength={400}
          />
        </div>
        <div>
          <button type="submit" className="btn-primary">
            {t('guestbook.form.submit')}
          </button>
        </div>
      </form>

      <div className="guestbook-entries reveal">
        {entries.length === 0 && (
          <p className="mono-label">{t('guestbook.empty')}</p>
        )}
        {entries.map((entry) => (
          <article className="guestbook-entry" key={entry.id}>
            <div className="guestbook-entry-head">
              <strong>{entry.name}</strong>
              <span>{formatDate(entry.ts)}</span>
            </div>
            <p className="guestbook-entry-body">{entry.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}