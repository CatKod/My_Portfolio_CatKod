import { readFileSync } from 'node:fs';

/** Đọc flight payload và trả về map id -> raw row. */
export function flightRows(file) {
  const s = readFileSync(file, 'utf8');
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  let flight = '';
  for (const m of s.matchAll(re)) {
    try {
      flight += JSON.parse(m[1]);
    } catch {
      /* ignore */
    }
  }
  const rows = new Map();
  for (const line of flight.split('\n')) {
    const m = line.match(/^([0-9a-f]+):(.*)$/);
    if (!m) continue;
    rows.set(m[1], m[2]);
  }
  return rows;
}

/**
 * Render cây flight thành danh sách "bước" dạng văn bản:
 *   { kind: 'text', value }
 *   { kind: 'tag', name, cls }
 */
export function flightSteps(rows) {
  const steps = [];
  const seen = new Set();

  function parseRow(raw) {
    // hàng bắt đầu bằng "I[" hoặc "T" là reference không phải cây.
    if (raw.startsWith('I[') || raw.startsWith('T')) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function walk(node) {
    if (node === null || node === undefined) return;
    if (Array.isArray(node)) {
      for (const v of node) walk(v);
      return;
    }
    if (typeof node !== 'object') return;
    if (Array.isArray(node.$$typeof)) return; // module reference

    // ["$", type, key, props]
    if (Array.isArray(node) || typeof node === 'string') return;
    const entries = Object.entries(node);
    for (const [key, value] of entries) {
      if (key === 'children') {
        if (typeof value === 'string') steps.push({ kind: 'text', value });
        else walk(value);
      } else {
        walk(value);
      }
    }
  }

  // duyệt các hàng là cây (bắt đầu bằng "[" hoặc "{")
  for (const [id, raw] of rows) {
    if (seen.has(id)) continue;
    const tree = parseRow(raw);
    if (!tree) continue;
    seen.add(id);
    walk(tree);
  }
  return steps;
}

/** Trích text của DOM (body, bỏ script/style). */
export function domTextSteps(file) {
  const s = readFileSync(file, 'utf8');
  const flightRe = /self\.__next_f\.push\(\[1,"(?:[^"\\]|\\.)*"\]\)/g;
  let dom = '';
  let last = 0;
  for (const m of s.matchAll(flightRe)) {
    dom += s.slice(last, m.index);
    last = m.index + m[0].length;
  }
  dom += s.slice(last);

  const bodyMatch = dom.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : dom;
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');

  const steps = [];
  for (const m of body.matchAll(/>([^<>]+)</g)) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t) steps.push({ kind: 'text', value: t });
  }
  return steps;
}
