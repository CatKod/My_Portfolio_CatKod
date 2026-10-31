import { readFileSync } from 'node:fs';
const s = readFileSync(process.argv[2], 'utf8');
const re = /<div class="project-actions[^"]*">[\s\S]*?<\/div>/g;
let n = 0;
for (const m of s.matchAll(re)) {
  console.log('--- ' + n++);
  console.log(m[0].slice(0, 800));
  if (n >= 6) break;
}
