import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync(process.argv[2] || 'site/skills', 'utf8');
for (const cls of ['skill-index-card', 'skill-tool-group']) {
  console.log('===', cls);
  elementsByClass(html, cls).forEach((p, i) => {
    const items = [...p.matchAll(/logo-loop-name">([^<]*)</g)].map((x) => x[1]);
    const pills = [...p.matchAll(/skill-tool-pill" title="([^"]*)"/g)].map((x) => x[1]);
    const h2 = /<h2>([^<]*)<\/h2>/.exec(p);
    const body = /<p>([^<]*)<\/p>/.exec(p);
    const aria = /aria-label="([^"]*) tools"/.exec(p);
    console.log(i, 'h2=', h2 && h2[1], 'aria=', aria && aria[1]);
    console.log('  body:', body && body[1]);
    console.log('  items:', JSON.stringify(items));
    if (pills.length) console.log('  pills:', JSON.stringify(pills));
  });
}
