import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'site/_next/static/chunks';
for (const f of readdirSync(dir)) {
  const t = readFileSync(join(dir, f), 'utf8');
  const i = t.indexOf('thesvg@main/public/icons');
  if (i < 0) continue;
  // tìm object map chứa slug
  const m = t.match(/\{[^{}]*"slug":"[a-z0-9-]+"[^{}]*\}/g);
  if (m) console.log(f, 'maps', m.length);
}
