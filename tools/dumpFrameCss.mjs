import { readFileSync } from 'node:fs';

const css = readFileSync('site/_next/static/chunks/0kv4a-p~1zj9b.catkod.1bb0b6dd.css', 'utf8');

function find(sel) {
  const r = new RegExp('([^{}]*?' + sel + '[^{}]*?)\\{([^}]*?)\\}', 'g');
  let m;
  console.log(`\n=== RULES FOR: ${sel} ===`);
  while ((m = r.exec(css)) !== null) {
    console.log(m[1].trim(), '->', m[2].trim());
  }
}

find('portfolio-frame');
find('frame-footer');
find('\\.stage\\{');
