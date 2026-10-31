import { readFileSync } from 'node:fs';
import { buildPanel } from './calendarDom.mjs';
import { splitFile } from './flight.mjs';

const html = readFileSync('site.orig.bak/about', 'utf8');
const parts = splitFile(html);
let flightText = '';
for (const p of parts) if (p.kind === 'flight') flightText += p.text;

const i = flightText.indexOf('"calendar":{');
const start = i + '"calendar":'.length;
// quét cân bằng object
let depth = 0, inStr = false, escCh = false, j = start;
for (; j < flightText.length; j++) {
  const ch = flightText[j];
  if (inStr) {
    if (escCh) escCh = false;
    else if (ch === '\\') escCh = true;
    else if (ch === '"') inStr = false;
    continue;
  }
  if (ch === '"') { inStr = true; continue; }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { j++; break; } }
}
const cal = JSON.parse(flightText.slice(start, j));
console.log('login', cal.login, 'total', cal.totalContributions, 'weeks', cal.weeks.length);

const generated = buildPanel(cal);
const k = html.indexOf('<div class="contribution-panel">');
const end = html.indexOf('</aside>', k);
const original = html.slice(k, end);
console.log('orig len', original.length, 'gen len', generated.length);
console.log('MATCH:', original === generated);
if (original !== generated) {
  for (let x = 0; x < Math.min(original.length, generated.length); x++) {
    if (original[x] !== generated[x]) {
      console.log('first diff at', x);
      console.log('ORIG:', JSON.stringify(original.slice(x - 150, x + 200)));
      console.log('GEN :', JSON.stringify(generated.slice(x - 150, x + 200)));
      break;
    }
  }
}
