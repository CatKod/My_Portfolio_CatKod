'use client';

import { useLanguage } from '@/components/LanguageProvider';

const SKILL_GROUPS = [
  {
    label: 'Frontend',
    title: 'Giao diện & trải nghiệm',
    items: [
      { name: 'React', level: 'advanced' },
      { name: 'Next.js', level: 'advanced' },
      { name: 'TypeScript', level: 'advanced' },
      { name: 'TailwindCSS', level: 'advanced' },
      { name: 'Framer Motion', level: 'intermediate' },
    ],
  },
  {
    label: 'Backend',
    title: 'API & dịch vụ',
    items: [
      { name: 'Node.js / Express', level: 'advanced' },
      { name: 'Python / FastAPI', level: 'intermediate' },
      { name: 'Go', level: 'learning' },
      { name: 'GraphQL', level: 'intermediate' },
      { name: 'tRPC', level: 'intermediate' },
    ],
  },
  {
    label: 'Database',
    title: 'Dữ liệu & lưu trữ',
    items: [
      { name: 'PostgreSQL', level: 'advanced' },
      { name: 'PostGIS', level: 'intermediate' },
      { name: 'MongoDB', level: 'intermediate' },
      { name: 'Redis', level: 'intermediate' },
      { name: 'Supabase', level: 'advanced' },
    ],
  },
  {
    label: 'AI / ML',
    title: 'Trí tuệ nhân tạo',
    items: [
      { name: 'OpenAI API', level: 'advanced' },
      { name: 'LangChain', level: 'intermediate' },
      { name: 'Vector DBs (Pinecone / pgvector)', level: 'intermediate' },
      { name: 'Prompt Engineering', level: 'advanced' },
      { name: 'Embeddings / RAG', level: 'intermediate' },
    ],
  },
  {
    label: 'DevOps',
    title: 'Triển khai & tooling',
    items: [
      { name: 'Docker', level: 'intermediate' },
      { name: 'Vercel', level: 'advanced' },
      { name: 'GitHub Actions', level: 'advanced' },
      { name: 'Cloudflare', level: 'intermediate' },
      { name: 'Linux / CLI', level: 'advanced' },
    ],
  },
  {
    label: 'Workflow',
    title: 'Tự động hoá & GIS',
    items: [
      { name: 'n8n', level: 'intermediate' },
      { name: 'Mapbox / OpenLayers', level: 'intermediate' },
      { name: 'QGIS', level: 'learning' },
      { name: 'GeoJSON / WKT', level: 'intermediate' },
      { name: 'Bot frameworks', level: 'intermediate' },
    ],
  },
];

const levelLabel = (level: string) => {
  switch (level) {
    case 'advanced':
      return '★★★★';
    case 'intermediate':
      return '★★★';
    case 'learning':
      return '★★';
    default:
      return '★';
  }
};

export default function SkillsClient() {
  const { t } = useLanguage();
  return (
    <div className="skills-scene">
      <header className="scene-head reveal">
        <p className="mono-label">04 — Skills</p>
        <h1>{t('skills.title')}</h1>
      </header>
      <div className="skills-grid reveal">
        {SKILL_GROUPS.map((g) => (
          <div className="skill-group" key={g.label}>
            <span>{g.label}</span>
            <h3>{g.title}</h3>
            <ul className="skill-list">
              {g.items.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <span>{levelLabel(item.level)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}