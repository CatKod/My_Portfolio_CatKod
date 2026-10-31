import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/rebrand.mjs';
let t = readFileSync(f, 'utf8');

const oldDom = `    const arts = items.map(
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

const newDom = `    const arts = items.map(
      (n) =>
        '<article data-history-item="true">' +
        \`<span>\${esc(n.year)}</span>\` +
        \`<h2>\${esc(n.title)}</h2>\` +
        \`<strong>\${esc(n.org)}</strong>\` +
        \`<p>\${esc(n.body)}</p>\` +
        '</article>',
    );
    // Thay từ cuối về đầu; mục cũ dư thì xoá hẳn, mục mới dư thì chèn vào.
    let out = el;
    for (let i = old.length - 1; i >= 0; i--) {
      const art = arts[i];
      out = art ? out.replace(old[i][0], art) : out.replace(old[i][0], '');
    }
    if (arts.length > old.length) {
      const extra = arts.slice(old.length).join('');
      out = out.replace('</div></div></div>', \`\${extra}</div></div></div>\`);
    }
    return out;
  });`;

if (!t.includes(oldDom)) {
  console.error('không khớp');
  process.exit(1);
}
t = t.replace(oldDom, newDom);
writeFileSync(f, t, 'utf8');
console.log('ok');
