'use client';

import { useLanguage } from '@/components/LanguageProvider';

const ITEMS = [
  {
    year: '2025',
    title: 'AWS Certified Cloud Practitioner',
    body: 'Chứng chỉ nền tảng AWS, hiểu các dịch vụ cốt lõi và mô hình triển khai cloud cơ bản.',
  },
  {
    year: '2025',
    title: 'Meta Front-end Developer Professional',
    body: 'Hoàn thành chuyên đề front-end của Meta (React, UX/UI, accessibility).',
  },
  {
    year: '2024',
    title: 'Google Data Analytics',
    body: 'Chứng chỉ phân tích dữ liệu của Google — SQL, Sheets, Tableau và quy trình data-driven.',
  },
  {
    year: '2024',
    title: 'AI Engineering Bootcamp',
    body: 'Khóa học thực chiến về LLM, RAG, agent workflow và triển khai pipeline AI trong sản phẩm thật.',
  },
  {
    year: '2023',
    title: 'Full-stack Web Development',
    body: 'Chương trình full-stack JavaScript: Node.js, Express, React, MongoDB và các pattern production.',
  },
  {
    year: '2022',
    title: 'Học vấn — Đại học Nông Lâm TP.HCM',
    body: 'Chuyên ngành Công nghệ thông tin (hoặc tương đương). Tốt nghiệp và bắt đầu hành trình nghề nghiệp.',
  },
];

export default function CredentialsClient() {
  const { t } = useLanguage();
  return (
    <div className="credentials-scene">
      <header className="scene-head reveal">
        <p className="mono-label">05 — Credentials</p>
        <h1>{t('credentials.title')}</h1>
      </header>
      <div className="credentials-list reveal">
        {ITEMS.map((item) => (
          <div className="credential-item" key={`${item.year}-${item.title}`}>
            <div className="credential-year">{item.year}</div>
            <div className="credential-body">
              <h4>{item.title}</h4>
              <p>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}