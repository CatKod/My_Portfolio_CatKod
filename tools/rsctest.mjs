import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const url = process.argv[2];
const route = process.argv[3] || '/about';

const r = await fetch(url + route, { headers: { RSC: '1', 'Next-Router-State-Tree': '%5B%22%22%5D' } });
console.log('status', r.status);
console.log('headers', JSON.stringify(Object.fromEntries(r.headers), null, 1));
const body = await r.text();
console.log('len', body.length);
console.log('--- first 1200 ---');
console.log(body.slice(0, 1200));

// so sánh với flight trong file tĩnh
const file = 'site' + (route === '/' ? '/index.html' : route);
try {
  const html = readFileSync(file, 'utf8');
  const parts = splitFlight(html);
  let flight = '';
  for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);
  console.log('--- static flight len', flight.length);
  console.log('static head:', JSON.stringify(flight.slice(0, 400)));
  console.log('static tail:', JSON.stringify(flight.slice(-400)));
} catch (e) { console.log('no static file', e.message); }
