import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const file = process.argv[2] || 'site.orig.bak/work';
const cls = process.argv[3] || 'project-focus';
const html = readFileSync(file, 'utf8');
const els = elementsByClass(html, cls);
console.log('count', els.length);
console.log(els[0]);
