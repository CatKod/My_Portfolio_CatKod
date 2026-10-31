import { readFileSync } from 'node:fs';

const files = ['site/index.html', 'site/about', 'site/work', 'site/skills', 'site/credentials', 'site/guestbook', 'site/contact'];
const checks = [
  ['instagram', /instagram/gi],
  ['lucide-facebook', /lucide-facebook/g],
  ['lucide-instagram', /lucide-instagram/g],
  ['oldDiscordId', /441643149899595797/g],
  ['oldLogoVB', /304\.95/g],
  ['newDiscordId', /708991627003166743/g],
  ['FB path', /M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7/g],
];
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  const row = checks.map(([k, re]) => `${k}=${(s.match(re) || []).length}`).join(' ');
  const cv = (s.match(/CV_[^"\\ ]*/g) || []).slice(0, 2).join(' ');
  console.log(f.padEnd(20), row, '| CV:', cv);
}
