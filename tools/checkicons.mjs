import { readFileSync } from 'node:fs';
import { ICON_MAP } from './icons.mjs';

const list = readFileSync('tools/cdn-icons.txt', 'utf8').split('\n').filter(Boolean);
const avail = new Set(list);
let bad = 0;
for (const [name, meta] of Object.entries(ICON_MAP)) {
  const variant = meta.variant ?? 'default';
  const key = `${meta.slug}/${variant}`;
  if (!avail.has(key)) {
    console.log('MISSING', name, '->', key);
    bad++;
  }
}
console.log(bad === 0 ? 'ALL ICONS EXIST' : `${bad} missing`);
