import { readFileSync, writeFileSync } from 'node:fs';

const f = 'site/_next/static/chunks/0kv4a-p~1zj9b.catkod.1bb0b6dd.css';
const css = readFileSync(f, 'utf8');

const TARGETS = [
  '.home-scene',
  '.home-system',
  '.home-capability-grid',
  '.home-capability-card',
  '.home-intro',
  '.home-title',
  '.stage--home',
  '.home-scene-home',
];

const lines = [];
const seen = new Set();

const ruleRe = /([^{}@]+)\{([^{}]*)\}/g;
let m;
while ((m = ruleRe.exec(css))) {
  const sel = m[1].trim();
  if (!TARGETS.some((t) => sel.includes(t))) continue;
  const key = sel + '{' + m[2] + '}';
  if (seen.has(key)) continue;
  seen.add(key);
  // xac dinh media query cha (neu co)
  let media = '';
  const before = css.slice(0, m.index);
  const lastAt = before.lastIndexOf('@media');
  if (lastAt !== -1) {
    const brace = before.indexOf('{', lastAt);
    if (brace !== -1) {
      // dem dau ngoac de biet media con dang mo
      let depth = 0;
      let closed = true;
      for (let i = brace; i < before.length; i++) {
        if (before[i] === '{') depth++;
        else if (before[i] === '}') depth--;
      }
      if (depth > 0) media = before.slice(lastAt, brace).trim();
    }
  }
  lines.push((media ? media + ' ' : '') + sel + ' {' + m[2] + '}');
}

const outText = lines.join('\n');
writeFileSync('D:/GitHub/My_Portfolio_CatKod/tools/home-rules.txt', outText);
console.log(outText);
