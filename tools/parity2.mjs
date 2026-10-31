import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const files = ['site/index.html', 'site/about', 'site/work', 'site/skills', 'site/credentials', 'site/guestbook', 'site/contact'];
for (const f of files) {
  const parts = splitFile(readFileSync(f, 'utf8'));
  let dom = '', flight = '';
  for (const p of parts) {
    if (p.kind === 'raw') dom += p.text;
    else flight += p.text;
  }
  const pats = ['contact-socials', 'contact-panel', 'lucide lucide-github', 'lucide lucide-linkedin', 'lucide lucide-facebook', 'lucide lucide-mail', 'lucide lucide-phone', 'lucide lucide-map-pinned'];
  const row = pats.map((k) => {
    const d = dom.split(k).length - 1, f2 = flight.split(k).length - 1;
    return `${k}:${d}/${f2}`;
  }).join(' ');
  console.log(f.padEnd(20), row);
}
