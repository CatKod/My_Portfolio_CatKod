import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const parts = splitFlight(html);
let dom = '';
let flight = '';
for (const p of parts) {
  if (p.kind === 'raw') dom += p.text;
  else flight += decodeFlight(p.text);
}
const mode = process.argv[3] || 'dom';
const text = mode === 'flight' ? flight : dom;
if (mode === 'flight') {
  // in ra các chuỗi text đáng chú ý
  const re = /"children":"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(text)) !== null) console.log(JSON.stringify(m[1]));
} else {
  // in các thẻ text cấp cao cấp
  const re = /<(h1|h2|h3|h4|p|span|em|strong|small|a|button|li|td|time)\b([^>]*)>([^<]{0,200})/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const t = m[3].trim();
    if (t) console.log(m[1] + ' | ' + m[2].slice(0, 60) + ' | ' + t);
  }
}
