import { execFileSync } from 'node:child_process';

const api = (path) =>
  JSON.parse(execFileSync('gh', ['api', path], { encoding: 'utf8' }));

console.log('=== commit b5154c1 files ===');
const c = api('repos/CatKod/CatKod/commits/b5154c1');
console.log('date:', c.commit.committer.date);
console.log('msg:', c.commit.message.slice(0, 200));
for (const f of c.files) console.log(' ', f.status, f.filename);

console.log('\n=== full tree (recursive) ===');
const t = api('repos/CatKod/CatKod/git/trees/main?recursive=1');
for (const e of t.tree) {
  if (e.type === 'blob') console.log(' ', e.path);
}

console.log('\n=== all refs ===');
for (const r of api('repos/CatKod/CatKod/git/matching-refs/heads/')) {
  console.log(' ', r.ref, r.object.sha.slice(0, 10));
}
