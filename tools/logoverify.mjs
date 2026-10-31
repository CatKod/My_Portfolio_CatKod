import { readFileSync } from 'node:fs';
import { splitFlight } from './transform.mjs';
import { logoLoop } from './blocks.mjs';

const html = readFileSync('site/skills', 'utf8');
const parts = splitFlight(html);
let dom = '';
for (const p of parts) if (p.kind === 'raw') dom += p.text;
const i = dom.indexOf('<div class="logo-loop"');
// tìm điểm kết thúc đúng: quét cân bằng
let depth = 0, j = i;
for (; j < dom.length; j++) {
  if (dom[j] === '<') {
    const m = /^<div/.exec(dom.slice(j, j + 4));
    if (m) depth++;
    else if (/^<\/div/.test(dom.slice(j, j + 6))) depth--;
    if (depth === 0) { j += 6; break; }
  }
}
const actual = dom.slice(i, j);
const names = ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Nuxt', 'Vue', 'Hugo', 'JavaScript', 'HTML', 'CSS'];
const gen = logoLoop(names, { reverse: false, speed: 18 });
console.log('actual', actual.length, 'gen', gen.length, 'MATCH', actual === gen);
if (actual !== gen) {
  let k = 0;
  while (k < Math.min(actual.length, gen.length) && actual[k] === gen[k]) k++;
  console.log('diff at', k);
  console.log('A:', JSON.stringify(actual.slice(k - 80, k + 150)));
  console.log('G:', JSON.stringify(gen.slice(k - 80, k + 150)));
}
