import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const routes = ['/', '/work', '/skills', '/credentials', '/contact'];
for (const route of routes) {
  const file = 'site' + (route === '/' ? '/index.html' : route);
  const html = readFileSync(file, 'utf8');
  const parts = splitFlight(html);
  let flight = '';
  for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);
  const r = await fetch('https://irfansabrian.vercel.app' + route + '?_rsc=full123', {
    headers: { RSC: '1', 'Next-Url': route },
  });
  const up = await r.text();
  console.log(route, 'local', flight.length, 'up', up.length, 'EQUAL', flight === up);
}
