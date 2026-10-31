import { readFileSync } from 'node:fs';

const t = readFileSync(process.argv[2], 'utf8');
const start = t.indexOf('"projects":[');
const end = t.indexOf('],"featured"');
const arr = t.slice(start + '"projects":['.length, end + 1);
// parse individual project objects by brace matching
const objs = [];
let depth = 0, cur = '';
let inStr = false, esc = false;
for (const ch of arr) {
  if (inStr) {
    cur += ch;
    if (esc) esc = false;
    else if (ch === '\\') esc = true;
    else if (ch === '"') inStr = false;
    continue;
  }
  if (ch === '"') { inStr = true; cur += ch; continue; }
  if (ch === '{') { depth++; cur += ch; continue; }
  if (ch === '}') { depth--; cur += ch; if (depth === 0) { objs.push(cur); cur = ''; } continue; }
  if (ch === ']') break;
  cur += ch;
}
console.log('project count:', objs.length);
objs.forEach((o, i) => {
  const oo = JSON.parse(o);
  console.log(`[${i}] ${oo.slug} | ${oo.title} | ${oo.year} | ${oo.category} | ${oo.status} | stack=${(oo.stack || []).join(',')} | imgs=${(oo.images || []).length} | gh=${oo.githubUrl}`);
});
