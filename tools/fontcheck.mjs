import fs from 'fs';
import path from 'path';

const root = 'site';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(p);
  }
})(root);

const re = /[\w.-]+-s\.[a-z0-9]{8,}\.woff2/g;
const refs = new Map();
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  for (const m of s.matchAll(re)) {
    if (!refs.has(m[0])) refs.set(m[0], []);
    refs.get(m[0]).push(f);
  }
}

console.log('font refs found:', refs.size);
for (const [name, where] of refs) {
  const exists = fs.existsSync(path.join(root, '_next/static/media', name));
  console.log((exists ? 'HAVE ' : 'MISS ') + name + '  <- ' + [...new Set(where)].join(', '));
}

console.log('\nfiles in media dir:');
for (const f of fs.readdirSync(path.join(root, '_next/static/media'))) {
  console.log('  ' + f);
}
