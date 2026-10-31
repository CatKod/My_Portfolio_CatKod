import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';

const html = readFileSync('site.orig.bak/skills', 'utf8');
for (const cls of ['skill-index-card', 'skill-tool-group']) {
  console.log('===', cls);
  elementsByClass(html, cls).forEach((p, i) => {
    const rev = p.includes('logo-loop--reverse');
    const dur = /logo-loop-duration:(\d+)s/.exec(p);
    const items = [...p.matchAll(/logo-loop-name">([^<]*)</g)].map((x) => x[1]);
    const pills = [...p.matchAll(/skill-tool-pill" title="([^"]*)"/g)].map((x) => x[1]);
    const h2 = /<h2>([^<]*)<\/h2>/.exec(p);
    const body = /<p>([^<]*)<\/p>/.exec(p);
    console.log(i, 'rev=' + rev, 'dur=' + (dur && dur[1]), 'h2=' + (h2 && h2[1]));
    console.log('   items:', JSON.stringify(items));
    if (pills.length) console.log('   pills:', JSON.stringify(pills));
    if (body) console.log('   body:', body[1]);
  });
}
