import { readFileSync } from 'node:fs';

const b = readFileSync(process.argv[2], 'utf8');
const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
let m, all = '';
while ((m = re.exec(b)) !== null) {
  try { all += JSON.parse('"' + m[1] + '"'); } catch (e) { console.log('parse fail'); }
}
console.log('flight len', all.length, 'nonascii', [...all].filter(c => c.charCodeAt(0) > 127).length);
console.log('escaped-u count', (all.match(/\\u[0-9a-f]{4}/gi) || []).length);
const i = all.indexOf('Hoàng');
console.log('raw Hoàng at', i, i >= 0 ? JSON.stringify(all.slice(i - 50, i + 90)) : '');
