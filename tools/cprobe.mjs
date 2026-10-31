import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';
import { spanOfArray } from './flightNode.mjs';

const f = process.argv[2] || 'site.orig.bak/contact';
const parts = splitFile(readFileSync(f, 'utf8'));
for (const p of parts) {
  if (p.kind !== 'flight') continue;
  const marker = '"className":"contact-panel","children":[';
  const i = p.text.indexOf(marker);
  if (i < 0) continue;
  const open = i + marker.length;
  const span = spanOfArray(p.text, open);
  const children = p.text.slice(span.start, span.end);
  console.log('children len', children.length);
  // children = [ [a,a,a], div ]
  const inner = spanOfArray(children, 0);
  console.log('inner span', inner);
  console.log('INNER[0..2]:', children.slice(0, 120));
  console.log('AFTER INNER:', JSON.stringify(children.slice(inner.end, inner.end + 300)));
  break;
}
