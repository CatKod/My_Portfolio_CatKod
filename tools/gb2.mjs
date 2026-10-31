import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/guestbook', 'utf8');
console.log('messages', elementsByClass(html, 'guestbook-message').length);
const first = elementsByClass(html, 'guestbook-message')[0];
console.log(first);
console.log('---- feed head');
const fh = elementsByClass(html, 'guestbook-feed-head');
console.log(fh.length, fh[0]);
console.log('---- form');
const fm = elementsByClass(html, 'guestbook-form');
console.log(fm.length, fm[0]?.slice(0, 1500));
