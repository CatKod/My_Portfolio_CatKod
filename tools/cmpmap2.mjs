import { readFileSync } from 'node:fs';
import { ICON_MAP } from './icons.mjs';

const react = JSON.parse(readFileSync('tools/iconmap.react.json', 'utf8'));
const missing = [];
const diff = [];
for (const [name, meta] of Object.entries(react)) {
  if (!ICON_MAP[name]) {
    missing.push(name);
    continue;
  }
  const ours = ICON_MAP[name];
  if (ours.slug !== meta.slug || (ours.variant ?? 'default') !== (meta.variant ?? 'default')) {
    diff.push({ name, ours, react: meta });
  }
}
console.log('react entries:', Object.keys(react).length, '| ours:', Object.keys(ICON_MAP).length);
console.log('thiếu trong tools/icons.mjs:', JSON.stringify(missing));
console.log('khác slug/variant:', JSON.stringify(diff, null, 1));
