import fs from 'fs';
const f = fs.readFileSync(process.argv[2] || 'tools/fl_skills_orig.txt', 'utf8');
// print all top-level rows keys
const lines = f.split('\n');
for (const l of lines) {
  const i = l.indexOf(':');
  if (i < 1) continue;
  const key = l.slice(0, i);
  if (!/^[0-9a-f]+$/.test(key)) continue;
  console.log(key, 'len=' + (l.length - i - 1), l.slice(i + 1, i + 120).replace(/\n/g, ''));
}
