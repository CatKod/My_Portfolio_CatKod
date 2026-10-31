import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const ROUTES = {
  '/': 'site/index.html',
  '/about': 'site/about',
  '/work': 'site/work',
  '/skills': 'site/skills',
  '/credentials': 'site/credentials',
  '/guestbook': 'site/guestbook',
  '/contact': 'site/contact',
};

const NEEDLES = ['Irfan', 'irfan', 'irfansabrian', 'Pontianak', '6289508669156', 'Kalimantan',
  'automation / ai / gis', 'full-stack web developer', 'SK selesai kerja', 'Karya Profesional',
  'Politeknik', 'Drafter Pemetaan', 'KPN', 'Diskominfo'];

let total = 0;
for (const [route, file] of Object.entries(ROUTES)) {
  const html = readFileSync(file, 'utf8');
  const parts = splitFlight(html);
  let dom = '', flight = '';
  for (const p of parts) {
    if (p.kind === 'raw') dom += p.text;
    else flight += decodeFlight(p.text);
  }
  const found = [];
  for (const n of NEEDLES) {
    const d = dom.split(n).length - 1;
    const f = flight.split(n).length - 1;
    if (d + f > 0) found.push(`${n}(dom:${d},flight:${f})`);
  }
  total += found.length;
  console.log(route.padEnd(13), found.length ? 'LEFTOVER: ' + found.join(' ') : 'clean');
}
console.log('\ntotal leftovers', total);
