import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const s = readFileSync(process.argv[2], 'utf8');
const els = elementsByClass(s, 'contact-panel');
console.log('count', els.length);
els.forEach((e, i) => {
  console.log('---', i, 'len', e.length);
  console.log('contains contact-socials:', e.includes('contact-socials'));
  console.log('head:', e.slice(0, 120));
  console.log('tail:', e.slice(-160));
});
