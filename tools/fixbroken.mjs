import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/rebrand.mjs';
let t = readFileSync(f, 'utf8');

const broken = `  // Lịch sử (flight): thay children của từng node "history-list"
  parts = replaceFlightChildren(parts, 'history-list', (i) => {
    const items = i === 0 ? workHistory : education;
    return JSON.stringify(
      items.map((n) => [
        '
`;

const fixed = [
  '  // Lịch sử (flight): thay children của từng node "history-list"',
  "  parts = replaceFlightChildren(parts, 'history-list', (i) => {",
  '    const items = i === 0 ? workHistory : education;',
  '    return JSON.stringify(',
  '      items.map((n) => [',
  "        '$',",
  "        'article',",
  '        `${n.year}-${n.title}`,',
  '        {',
  "          'data-history-item': true,",
  '          children: [',
  "            ['$', 'span', null, { children: n.year }],",
  "            ['$', 'h2', null, { children: n.title }],",
  "            ['$', 'strong', null, { children: n.org }],",
  "            ['$', 'p', null, { children: n.body }],",
  '          ],',
  '        },',
  '      ]),',
  '    );',
  '  });',
  '',
].join('\n');

if (!t.includes(broken)) {
  console.error('không tìm thấy đoạn hỏng');
  process.exit(1);
}
t = t.replace(broken, fixed);
writeFileSync(f, t, 'utf8');
console.log('ok');
