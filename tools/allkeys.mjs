import { readFileSync } from 'node:fs';

for (const f of ['rsc_work.txt', 'rsc_home.txt', 'rsc_about.txt', 'rsc_skills.txt', 'rsc_cred.txt', 'rsc_guest.txt', 'rsc_contact.txt']) {
  const t = readFileSync(f, 'utf8');
  const keys = [...t.matchAll(/"([a-zA-Z][a-zA-Z0-9]*)":/g)].map(m => m[1]);
  console.log('=== ' + f);
  console.log([...new Set(keys)].join(', '));
  console.log();
}
