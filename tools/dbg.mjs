import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const html = readFileSync('site/index.html', 'utf8');
const parts = splitFlight(html);
const p = parts[1];
console.log('kind', p.kind);
console.log('text head raw:', p.text.slice(0, 60));
try {
  const d = decodeFlight(p.text);
  console.log('decoded head:', d.slice(0, 60));
} catch (e) {
  console.log('ERR', e.message);
  console.log('trying raw JSON.parse of text:', JSON.stringify(p.text.slice(0, 60)));
}
