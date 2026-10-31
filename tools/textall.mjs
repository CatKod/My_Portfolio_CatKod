import { readFileSync } from 'node:fs';
import { splitFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let dom = '';
for (const p of parts) if (p.kind === 'raw') dom += p.text;
const re = /<(h1|h2|h3|h4|p|span|em|strong|small|a|button|li|time)\b([^>]*)>([^<]{0,300})/g;
let m;
const seen = new Set();
while ((m = re.exec(dom)) !== null) {
  const t = m[3].trim();
  if (!t) continue;
  const key = m[1] + '|' + m[2].slice(0, 50) + '|' + t;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(m[1] + ' | ' + m[2].slice(0, 55) + ' | ' + t);
}
