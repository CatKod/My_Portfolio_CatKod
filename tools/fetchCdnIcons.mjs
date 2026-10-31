import { writeFileSync } from 'node:fs';

const url = 'https://data.jsdelivr.com/v1/packages/gh/GLINCKER/thesvg@main?structure=flat';
const res = await fetch(url);
if (!res.ok) {
  console.error('HTTP', res.status);
  process.exit(1);
}
const data = await res.json();
const files = (data.files || []).map((f) => f.name);
console.log('files', files.length);
const icons = files.filter((f) => f.startsWith('/public/icons/'));
const dirs = new Set();
for (const f of icons) {
  const m = /^\/public\/icons\/([^/]+)\/([^/]+)\.svg$/.exec(f);
  if (m) dirs.add(`${m[1]}/${m[2]}`);
}
console.log('icon variants', dirs.size);
writeFileSync('tools/cdn-icons.txt', [...dirs].sort().join('\n'), 'utf8');
console.log([...dirs].sort().join(' '));
