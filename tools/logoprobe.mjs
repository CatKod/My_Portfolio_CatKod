import { readFileSync } from 'node:fs';

const f = process.argv[2] || 'site/index.html';
const s = readFileSync(f, 'utf8');
const re = /<svg aria-hidden="true" class="h-\d w-\d" viewBox="0 0 304\.95 285\.2"[\s\S]*?<\/svg>/g;
let m;
while ((m = re.exec(s))) {
  console.log('--- len', m[0].length);
  console.log(m[0]);
}
