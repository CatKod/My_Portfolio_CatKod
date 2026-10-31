import { readFileSync } from 'node:fs';
import { splitFlight } from './transform.mjs';

const html = readFileSync('site/about', 'utf8');
const parts = splitFlight(html);
let dom = '';
for (const p of parts) if (p.kind === 'raw') dom += p.text;

const i = dom.indexOf('<div class="contribution-panel">');
const j = dom.indexOf('</div></div><aside') ;
console.log('panel at', i);
const panel = dom.slice(i, i + 3000);
console.log(panel.slice(0, 1200));
console.log('...');
const k = dom.indexOf('<svg aria-label="GitHub contribution heatmap"');
console.log('svg at', k);
console.log(dom.slice(k, k + 600));
console.log('--- end of svg ---');
const e = dom.indexOf('</svg>', k);
console.log(dom.slice(e - 400, e + 900));
