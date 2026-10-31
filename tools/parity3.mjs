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
  const dOld = (dom.match(/M120\.28/g) || []).length;
  const fOld = (flight.match(/M120\.28/g) || []).length;
  const dNew = (dom.match(/points="228,142 304\.95,20/g) || []).length;
  const fNew = (flight.match(/points":"228,142 304\.95,20/g) || []).length;
  console.log(f.padEnd(20), 'oldLogo dom/fl:', dOld, fOld, '| newLogo dom/fl:', dNew, fNew, dOld === fOld && dNew === fNew ? 'OK' : 'MISMATCH');
}
