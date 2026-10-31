import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const route = process.argv[2] || '/about';
const file = 'site' + (route === '/' ? '/index.html' : route);
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

const r = await fetch('https://irfansabrian.vercel.app' + route + '?_rsc=xyz789', {
  headers: { RSC: '1', 'Next-Url': route },
});
const up = await r.text();
console.log('local flight len', flight.length, 'upstream RSC len', up.length);
console.log('local head', JSON.stringify(flight.slice(0, 200)));
console.log('up   head', JSON.stringify(up.slice(0, 200)));
console.log('local tail', JSON.stringify(flight.slice(-200)));
console.log('up   tail', JSON.stringify(up.slice(-200)));
// so sánh từng dòng
const localLines = flight.split('\n');
const upLines = up.split('\n');
console.log('local lines', localLines.length, 'up lines', upLines.length);
let diff = 0;
for (let i = 0; i < Math.max(localLines.length, upLines.length); i++) {
  if (localLines[i] !== upLines[i]) {
    diff++;
    if (diff <= 3) {
      console.log('--- line', i, 'differs');
      console.log('L:', JSON.stringify((localLines[i] || '').slice(0, 300)));
      console.log('U:', JSON.stringify((upLines[i] || '').slice(0, 300)));
    }
  }
}
console.log('diff lines', diff);
