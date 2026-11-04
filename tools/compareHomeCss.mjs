import { readFileSync } from 'node:fs';

const orig = readFileSync('site.orig.bak/_next/static/chunks/0kv4a-p~1zj9b.css', 'utf8');
const curr = readFileSync('site/_next/static/chunks/0kv4a-p~1zj9b.catkod.1bb0b6dd.css', 'utf8');

function getRules(css) {
  const rules = [];
  const regex = /([^\{\}]+)\{([^\{\}]+)\}/g;
  let m;
  while ((m = regex.exec(css)) !== null) {
    if (m[1].includes('.home-') || m[1].includes('.stage--home')) {
      rules.push({ sel: m[1].trim(), body: m[2].trim() });
    }
  }
  return rules;
}

const rOrig = getRules(orig);
const rCurr = getRules(curr);

console.log('--- RULES IN ORIG ---');
for (const r of rOrig) {
  console.log(`${r.sel} { ${r.body} }`);
}
