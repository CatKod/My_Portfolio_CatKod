import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

for (const [f, cls] of [
  ['site.orig.bak/work', 'project-index-head'],
  ['site.orig.bak/work', 'work-scene'],
  ['site.orig.bak/contact', 'contact-scene'],
  ['site.orig.bak/contact', 'contact-socials'],
  ['site.orig.bak/skills', 'skill-hero-card'],
  ['site.orig.bak/skills', 'skill-tool-panel'],
  ['site.orig.bak/guestbook', 'guestbook-scene'],
]) {
  const html = readFileSync(f, 'utf8');
  const els = elementsByClass(html, cls);
  console.log('===', f, cls, els.length);
  if (els.length) console.log(els[0].replace(/<svg[\s\S]*?<\/svg>/g, '<SVG/>').slice(0, 1800));
}
