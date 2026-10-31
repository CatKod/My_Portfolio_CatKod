import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/credentials', 'utf8');
const i = html.indexOf('<main');
const j = html.indexOf('<footer', i);
const body = html.slice(i, j);
// strip long svg/img
console.log(body.replace(/<svg[\s\S]*?<\/svg>/g, '<SVG/>').replace(/<img[^>]*>/g, '<IMG/>').slice(0, 8000));
