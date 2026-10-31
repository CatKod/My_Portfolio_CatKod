import fs from 'fs';

const file = process.argv[2] || 'site/skills';
const html = fs.readFileSync(file, 'utf8');

// ---- flight ----
const flightRe = /self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g;
let flight = '';
for (const m of html.matchAll(flightRe)) {
  const b = m[0].slice(m[0].indexOf(',"') + 2, m[0].lastIndexOf('"'));
  try { flight += JSON.parse('"' + b + '"'); } catch {}
}
const rows = {};
for (const line of flight.split('\n')) {
  const i = line.indexOf(':');
  if (i < 1) continue;
  const key = line.slice(0, i);
  const val = line.slice(i + 1);
  try { rows[key] = JSON.parse(val); } catch {}
}

function resolveRefs(node, seen = new Set()) {
  if (typeof node === 'string') {
    const m = /^\$L([0-9a-f]+)$/.exec(node);
    if (m && rows[m[1]] !== undefined && !seen.has(m[1])) {
      const s = new Set(seen); s.add(m[1]);
      return resolveRefs(rows[m[1]], s);
    }
    return node;
  }
  if (Array.isArray(node)) return node.map((n) => resolveRefs(n, seen));
  if (node && typeof node === 'object') {
    const o = {};
    for (const k in node) o[k] = resolveRefs(node[k], seen);
    return o;
  }
  return node;
}

// find panel row
let panelRow = null;
for (const k in rows) {
  if (JSON.stringify(rows[k]).includes('skill-index-panel')) { panelRow = rows[k]; break; }
}
function walk(node, cb) {
  if (Array.isArray(node)) { node.forEach((n) => walk(n, cb)); return; }
  if (node && typeof node === 'object') {
    cb(node);
    for (const k in node) walk(node[k], cb);
  }
}

console.log('===== FLIGHT skill-index-card =====');
if (panelRow) {
  walk(resolveRefs(panelRow), (o) => {
    if (o.className === 'skill-index-card') {
      const h2 = o.children?.[0]?.children?.[0];
      const p = o.children?.[0]?.children?.[1];
      const tools = o.children?.[0]?.children?.[2];
      const loop = tools?.children?.[1]?.children;
      console.log('h2=', JSON.stringify(h2?.children), 'p=', JSON.stringify(p?.children));
      console.log('  aria=', JSON.stringify(tools?.['aria-label']), 'reverse=', loop?.reverse, 'speed=', loop?.speed);
      console.log('  items=', JSON.stringify((loop?.items || []).map((x) => x.name)));
    }
    if (o.className === 'skill-tool-group') {
      const pills = [];
      walk(o, (x) => { if (x.className === 'skill-tool-pill') pills.push(x.title); });
      console.log('GROUP h2=', JSON.stringify(o.children?.[0]?.children), 'pills=', JSON.stringify(pills));
    }
  });
}
