import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'site/_next/static/chunks';
const f = readdirSync(dir).find(f => f.endsWith('.css') && readFileSync(join(dir, f), 'utf8').includes('.credentials-board{'));
const css = readFileSync(join(dir, f), 'utf8');

function findSnippet(keyword) {
  let idx = 0;
  console.log(`\n=== KEYWORD: ${keyword} ===`);
  while ((idx = css.indexOf(keyword, idx)) !== -1) {
    const start = Math.max(0, idx - 50);
    const end = Math.min(css.length, idx + 250);
    console.log(css.slice(idx, end).split('}')[0] + '}');
    idx += keyword.length;
  }
}

findSnippet('.home-scene{');
findSnippet('.home-title{');
findSnippet('.stage.stage--home .home-title');
findSnippet('.home-intro{');
findSnippet('.stage.stage--home .home-intro');
findSnippet('.home-system{');
findSnippet('.stage.stage--home .home-system');
findSnippet('.home-capability-grid{');
findSnippet('.stage.stage--home .home-capability-grid');
findSnippet('.home-capability-card{');
findSnippet('.stage.stage--home .home-capability-card');
findSnippet('.stage.stage--home{');
