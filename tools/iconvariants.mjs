import { readFileSync } from 'node:fs';

const list = readFileSync('tools/cdn-icons.txt', 'utf8').split('\n').filter(Boolean);
const want = process.argv.slice(2);
for (const w of want) {
  const hits = list.filter((x) => x.startsWith(w + '/'));
  console.log(w, '->', hits.join(', ') || 'NONE');
}
