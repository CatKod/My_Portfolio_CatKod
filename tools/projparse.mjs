import { readFileSync } from 'node:fs';

const t = readFileSync(process.argv[2], 'utf8');
const start = t.indexOf('"projects":[');
if (start < 0) { console.log('no projects key'); process.exit(1); }
// quét từng object cấp cao nhất trong mảng
let i = t.indexOf('[', start);
let depth = 0, inStr = false, esc = false;
let objStart = -1;
const objs = [];
for (let k = i; k < t.length; k++) {
  const ch = t[k];
  if (inStr) {
    if (esc) esc = false;
    else if (ch === '\\') esc = true;
    else if (ch === '"') inStr = false;
    continue;
  }
  if (ch === '"') { inStr = true; continue; }
  if (ch === '{') { if (depth === 0) objStart = k; depth++; continue; }
  if (ch === '}') {
    depth--;
    if (depth === 0) { objs.push(t.slice(objStart, k + 1)); }
    continue;
  }
  if (ch === ']' && depth === 0) break;
}
console.log('projects', objs.length);
const parsed = objs.map(o => JSON.parse(o));
parsed.forEach((p, i) => {
  console.log(`[${i}] ${p.slug} imgs=${(p.images || []).length} image=${p.image ? 'Y' : 'N'} featured=${p.featured} gh=${p.githubUrl}`);
});
const noImg = parsed.find(p => !(p.images || []).length && !p.image);
if (noImg) console.log('\n--- project without images ---\n' + JSON.stringify(noImg, null, 2));
