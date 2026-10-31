import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/skills', 'utf8');
const grp = elementsByClass(html, 'skill-tool-group')[2];
console.log(grp);
console.log('---- 4th');
console.log(elementsByClass(html, 'skill-tool-group')[3]);
