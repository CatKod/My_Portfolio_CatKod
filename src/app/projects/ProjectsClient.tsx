'use client';

import { useLanguage } from '@/components/LanguageProvider';

const PROJECTS = [
  {
    tag: 'Web · Full-stack',
    title: 'CatKod Shop',
    description:
      'E-commerce headless với Next.js + Stripe + Payload CMS. Hỗ trợ inventory theo thời gian thực và đồng bộ đơn vận chuyển.',
    stack: 'Next.js · Stripe · Postgres · Payload',
    href: '#',
  },
  {
    tag: 'AI · Workflow',
    title: 'Smart CV Scanner',
    description:
      'AI agent quét, phân loại và trích xuất dữ liệu từ hồ sơ ứng viên. Tự động chấm điểm theo JD và đẩy vào ATS.',
    stack: 'Python · LangChain · OpenAI · Postgres',
    href: '#',
  },
  {
    tag: 'Automation · Bot',
    title: 'Workflow Bot',
    description:
      'Bot Telegram + Discord quản lý task, gửi nhắc việc và tổng hợp báo cáo tuần từ dữ liệu CRM.',
    stack: 'Node.js · Telegram API · Discord.js',
    href: '#',
  },
  {
    tag: 'GIS · Dashboard',
    title: 'Bản đồ Logistics',
    description:
      'Dashboard trực quan hoá chuyến xe theo thời gian thực với PostGIS, heatmap tuyến đường và cảnh báo delay.',
    stack: 'Next.js · PostGIS · Mapbox · FastAPI',
    href: '#',
  },
  {
    tag: 'Data · Dashboard',
    title: 'Trading Journal',
    description:
      'Theo dõi giao dịch cá nhân, đồ thị PnL, phân tích pattern và backtest rule tự động.',
    stack: 'Next.js · D3.js · Supabase',
    href: '#',
  },
  {
    tag: 'CMS · Tooling',
    title: 'Mini CMS',
    description:
      'Headless CMS nhẹ cho blog cá nhân, hỗ trợ markdown, MDX, i18n và publishing tự động qua webhook.',
    stack: 'Next.js · MDX · SQLite',
    href: '#',
  },
];

export default function ProjectsClient() {
  const { t } = useLanguage();
  return (
    <div className="about-scene">
      <header className="scene-head reveal">
        <p className="mono-label">03 — Projects</p>
        <h1>{t('projects.title')}</h1>
      </header>
      <div className="projects-grid">
        {PROJECTS.map((p) => (
          <a key={p.title} className="project-card reveal" href={p.href}>
            <span className="project-tag">{p.tag}</span>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <span className="project-stack">{p.stack}</span>
          </a>
        ))}
      </div>
    </div>
  );
}