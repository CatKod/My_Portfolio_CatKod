import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const dir = process.argv[2];
const base = process.argv[3];
const sub = process.argv[4] || '';
const files = readdirSync(dir);
for (const f of files) {
  const local = readFileSync(dir + '/' + f);
  const res = await fetch(`${base}/${sub}${f}`);
  const up = Buffer.from(await res.arrayBuffer());
  const lh = createHash('sha256').update(local).digest('hex');
  const uh = createHash('sha256').update(up).digest('hex');
  console.log((lh === uh ? 'OK   ' : 'DIFF ') + f + '  local=' + local.length + ' up=' + up.length);
  if (lh !== uh) {
    let i = 0;
    const n = Math.min(local.length, up.length);
    while (i < n && local[i] === up[i]) i++;
    console.log('   first diff at byte', i);
    console.log('   local:', JSON.stringify(local.subarray(Math.max(0, i - 60), i + 60).toString('utf8')));
    console.log('   up   :', JSON.stringify(up.subarray(Math.max(0, i - 60), i + 60).toString('utf8')));
  }
}
