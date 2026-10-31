import { readFileSync } from 'node:fs';

const s = readFileSync(process.argv[2], 'utf8');
const i = s.indexOf('<div class="contact-panel">');
const j = s.indexOf('<div class="contact-socials">');
console.log('contact-panel at', i, 'contact-socials at', j);
const seg = s.slice(i, j);
console.log('div opens in between:', (seg.match(/<div/g) || []).length);
console.log('div closes in between:', (seg.match(/<\/div>/g) || []).length);
console.log('--- head of segment');
console.log(seg.slice(0, 200));
console.log('--- tail of segment');
console.log(seg.slice(-400));
