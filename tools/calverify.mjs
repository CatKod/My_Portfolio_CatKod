import { readFileSync } from 'node:fs';
import { splitFlight, decodeFlight } from './transform.mjs';
import { buildSvg, buildMonths } from './calendarDom.mjs';

// Lấy calendar gốc từ flight của site/about (bản gốc chưa bị sửa)
const html = readFileSync('site/about', 'utf8');
const parts = splitFlight(html);
let flight = '';
for (const p of parts) if (p.kind === 'flight') flight += decodeFlight(p.text);

const i = flight.indexOf('"calendar":{');
let k = flight.indexOf('{', i + 10);
let depth = 0, inStr = false, esc = false;
const start = k;
for (; k < flight.length; k++) {
  const ch = flight[k];
  if (inStr) {
    if (esc) esc = false;
    else if (ch === '\\') esc = true;
    else if (ch === '"') inStr = false;
    continue;
  }
  if (ch === '"') { inStr = true; continue; }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { k++; break; } }
}
const cal = JSON.parse(flight.slice(start, k));

// So sánh SVG sinh ra với SVG gốc trong DOM
let dom = '';
for (const p of parts) if (p.kind === 'raw') dom += p.text;
const s = dom.indexOf('<svg aria-label="GitHub contribution heatmap"');
const e = dom.indexOf('</svg>', s) + 6;
const origSvg = dom.slice(s, e);

const genSvg = buildSvg(cal.weeks);
console.log('SVG equal:', origSvg === genSvg);
if (origSvg !== genSvg) {
  let k2 = 0;
  while (k2 < Math.min(origSvg.length, genSvg.length) && origSvg[k2] === genSvg[k2]) k2++;
  console.log('first diff at', k2, 'lenO', origSvg.length, 'lenG', genSvg.length);
  console.log('O:', JSON.stringify(origSvg.slice(k2 - 120, k2 + 200)));
  console.log('G:', JSON.stringify(genSvg.slice(k2 - 120, k2 + 200)));
}

// So sánh months
const m = dom.indexOf('<div aria-hidden="true" class="contribution-months"');
const me = dom.indexOf('</div>', m) + 6;
const origMonths = dom.slice(m, me);
const months = buildMonths(cal.weeks);
const genMonths = '<div aria-hidden="true" class="contribution-months" style="grid-template-columns:repeat(' + cal.weeks.length + ', 10px)">' +
  months.map(x => `<span style="grid-column:${x.startWeek + 1} / span ${x.span}">${x.label}</span>`).join('') + '</div>';
console.log('MONTHS equal:', origMonths === genMonths);
if (origMonths !== genMonths) {
  console.log('O:', origMonths);
  console.log('G:', genMonths);
}
