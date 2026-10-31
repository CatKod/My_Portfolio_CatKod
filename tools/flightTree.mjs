import { readFileSync } from 'node:fs';
import { splitFile, splitLines } from './flight.mjs';

const html = readFileSync(process.argv[2], 'utf8');
const only = process.argv[3];
const parts = splitFile(html);

function show(node, depth) {
  if (depth > 14) return;
  const pad = '  '.repeat(depth);
  if (Array.isArray(node)) {
    node.forEach((n) => show(n, depth));
    return;
  }
  if (node === null || typeof node !== 'object') {
    if (typeof node === 'string' && node.length > 70) {
      console.log(pad + JSON.stringify(node.slice(0, 70)) + '…');
    } else {
      console.log(pad + JSON.stringify(node));
    }
    return;
  }
  const keys = Object.keys(node);
  const cls = node.className ? ` class="${node.className}"` : '';
  const label = node.$$typeof ? String(node.$$typeof) : '';
  const head = `${pad}${label}${cls}`;
  console.log(head);
  if (node.children !== undefined) {
    console.log(`${pad}  children:`);
    show(node.children, depth + 2);
  }
  for (const k of keys) {
    if (k === 'children' || k === 'className' || k === '$$typeof') continue;
    const v = node[k];
    if (v && typeof v === 'object') {
      console.log(`${pad}  ${k}:`);
      show(v, depth + 2);
    }
  }
}

parts.forEach((p, pi) => {
  if (p.kind !== 'flight') return;
  const lines = splitLines(p.text);
  lines.forEach((l) => {
    if (!l.id) return;
    let obj;
    try {
      obj = JSON.parse(l.body);
    } catch {
      console.log(`\n### part${pi} id=${l.id} MODULE: ${l.body.slice(0, 90)}`);
      return;
    }
    if (only && l.id !== only) return;
    console.log(`\n### part${pi} id=${l.id}`);
    show(obj, 1);
  });
});
