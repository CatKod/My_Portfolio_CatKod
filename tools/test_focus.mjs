import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';
import { buildFocus } from './build.mjs';

const html = readFileSync('site.orig.bak/work', 'utf8');
const orig = elementsByClass(html, 'project-focus')[0];

const pr = {
  slug: 'kpn-profile-company',
  title: 'KPN Profile Company',
  year: '2026',
  category: 'Company Profile',
  description:
    'Company profile website for CV Karya Profesional Nusantara with public pages, service narratives, project content, team sections, and a content-dashboard direction.',
  impact:
    'Builds a cleaner public identity for a general engineering and project-support company, backed by structured content and reusable page sections.',
  stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'SQLite', 'Radix UI'],
  status: 'Active development',
  githubUrl: null,
  liveUrl: null,
  images: [
    { src: '/images/projects/kpn-profile-company/homepage-hero.png', label: 'Homepage hero' },
    { src: '/images/projects/kpn-profile-company/about-section.png', label: 'About section' },
  ],
  isPrivate: true,
  featured: true,
  tech: 'Next.js + React',
};

const gen = buildFocus(pr, 0, 17);
console.log('orig len', orig.length, 'gen len', gen.length);
console.log('MATCH:', orig === gen);
if (orig !== gen) {
  for (let i = 0; i < Math.min(orig.length, gen.length); i++) {
    if (orig[i] !== gen[i]) {
      console.log('diff at', i);
      console.log('ORIG:', JSON.stringify(orig.slice(i - 200, i + 250)));
      console.log('GEN :', JSON.stringify(gen.slice(i - 200, i + 250)));
      break;
    }
  }
}
