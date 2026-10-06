'use client';

import { useLanguage, type LanguageCode } from './LanguageProvider';

const LANG_OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
];

export default function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <label className="language-pill" aria-label="Language">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
      <select
        aria-label="Select language"
        value={lang}
        onChange={(e) => setLang(e.target.value as LanguageCode)}
        style={{
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'inherit',
          font: 'inherit',
          cursor: 'pointer',
        }}
      >
        {LANG_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}