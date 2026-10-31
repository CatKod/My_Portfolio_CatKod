import { readFileSync } from 'node:fs';
import { splitFlight } from './transform.mjs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/credentials', 'utf8');
const dom = splitFlight(html).filter((p) => p.kind === 'raw').map((p) => p.text).join('');
for (const cls of ['credential-stat-grid', 'credential-certificate-list', 'credential-role-grid']) {
  const els = elementsByClass(dom, cls);
  console.log(`\n### ${cls}: ${els.length}`);
  els.forEach((el, i) => {
    console.log(`  [${i}] head=${JSON.stringify(el.slice(0, 60))}`);
    console.log(`      tail=${JSON.stringify(el.slice(-60))}`);
  });
}
