import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/rebrand.mjs';
let t = readFileSync(f, 'utf8');

/* --- 1) DOM: thay toàn bộ <article> của history-list, kể cả khi số lượng lệch --- */
const oldDom = `  // Lịch sử công việc + học vấn (DOM): 2 cột history-list
  parts = replaceByClass(parts, 'history-list', (el, listIndex) => {
    const items = listIndex === 0 ? workHistory : education;
    const old = [...el.matchAll(/<article data-history-item="true">[\\s\\S]*?<\\/article>/g)];
    if (!old.length) return null;
    let out = el;
    for (let i = old.length - 1; i >= 0; i--) {
      const n = items[i];
      if (!n) continue;
      const art =
        '<article data-history-item="true">' +
        \`<span>\${esc(n.year)}</span>\` +
        \`<h2>\${esc(n.title)}</h2>\` +
        \`<strong>\${esc(n.org)}</strong>\` +
        \`<p>\${esc(n.body)}</p>\` +
        '</article>';
      out = out.replace(old[i][0], art);
    }
    return out;
  });`;

const newDom = `  // Lịch sử công việc + học vấn (DOM): 2 cột history-list
  parts = replaceByClass(parts, 'history-list', (el, listIndex) => {
    const items = listIndex === 0 ? workHistory : education;
    const old = [...el.matchAll(/<article data-history-item="true">[\\s\\S]*?<\\/article>/g)];
    if (!old.length) return null;
    const arts = items.map(
      (n) =>
        '<article data-history-item="true">' +
        \`<span>\${esc(n.year)}</span>\` +
        \`<h2>\${esc(n.title)}</h2>\` +
        \`<strong>\${esc(n.org)}</strong>\` +
        \`<p>\${esc(n.body)}</p>\` +
        '</article>',
    );
    // thay từ cuối về đầu; nếu nhiều mục mới hơn thì chèn phần dư vào cuối list
    let out = el;
    for (let i = old.length - 1; i >= 0; i--) {
      const art = arts[i];
      if (!art) continue;
      out = out.replace(old[i][0], art);
    }
    if (arts.length > old.length) {
      const extra = arts.slice(old.length).join('');
      out = out.replace('</div></div></div>', \`\${extra}</div></div></div>\`);
    }
    return out;
  });`;

if (!t.includes(oldDom)) {
  console.error('DOM history: không khớp');
} else {
  t = t.replace(oldDom, newDom);
}

/* --- 2) Flight: thay children của history-list --- */
const oldFlight = `  // Lịch sử (flight): thay children của từng node "history-list"
  parts = replaceFlightChildren(parts, 'history-list', (i) => {
    const items = i === 0 ? workHistory : education;
    return JSON.stringify(
      items.map((n) => [
        '$',
        'article',
        \`\${n.year}-\${n.title}\`,
        {
          'data-history-item': true,
          children: [
            ['$', 'span', null, { children: n.year }],
            ['$', 'h2', null, { children: n.title }],
            ['$', 'strong', null, { children: n.org }],
            ['$', 'p', null, { children: n.body }],
          ],
        },
      ]),
    );
  });`;

const newFlight = `  // Lịch sử (flight): thay children của từng node "history-list"
  parts = replaceFlightChildren(parts, 'history-list', (i) => {
    const items = i === 0 ? workHistory : education;
    return JSON.stringify(
      items.map((n) => [
        '$',
        'article',
        \`\${n.year}-\${n.title}\`,
        {
          'data-history-item': true,
          children: [
            ['$', 'span', null, { children: n.year }],
            ['$', 'h2', null, { children: n.title }],
            ['$', 'strong', null, { children: n.org }],
            ['$', 'p', null, { children: n.body }],
          ],
        },
      ]),
    );
  });`;

if (!t.includes(oldFlight)) {
  console.error('flight history: không khớp');
} else {
  t = t.replace(oldFlight, newFlight);
}

writeFileSync(f, t, 'utf8');
console.log('ok');
