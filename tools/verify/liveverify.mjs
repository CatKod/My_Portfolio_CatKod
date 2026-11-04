import https from 'node:https';

const head = (url) =>
  new Promise((res) => {
    https
      .get(url, (r) => {
        r.resume();
        res({ status: r.statusCode, len: r.headers['content-length'] });
      })
      .on('error', (e) => res({ status: 'ERR', len: e.message }));
  });

const base = 'https://catkod.github.io/_next/static/chunks/';

// Các tên file user có thể đang cache (HTML cũ) — phải trả 200.
const legacy = [
  '0kv4a-p~1zj9b.catkod.css', // CSS đang phục vụ trước khi deploy
  '0kv4a-p~1zj9b.css', // tên gốc của Next.js
  '13nbfvio._z2b.css',
  '01e-_5wu9-q94.catkod.js',
  '01e-_5wu9-q94.js',
  '0vof9py47_u18.catkod.js',
  '0vof9py47_u18.js',
  '0ocwl5hn2190n.catkod.js',
  '0y7k_s2ee1078.catkod.js',
  '03wksmz03n~ne.catkod.js',
  '09ebkw8~fxq_b.catkod.js',
  '03lu_-.84~_q..catkod.js',
  '15nsyxl.8hl16.catkod.js',
  '0_~wm1q5~a~.5.catkod.js',
];

console.log('=== tên CŨ (cache đang tồn tại) phải trả 200 ===');
let bad = 0;
for (const f of legacy) {
  const r = await head(base + f);
  if (r.status !== 200) bad++;
  console.log(`   ${r.status}  ${f}  (${r.len} bytes)`);
}

// CSS cũ phải CHỨA BẢN VÁ (không phải bản gốc).
console.log('\n=== nội dung CSS cũ đã vá? ===');
const grab = (u) =>
  new Promise((res) => {
    https
      .get(u, (r) => {
        let d = '';
        r.on('data', (c) => (d += c));
        r.on('end', () => res(d));
      })
      .on('error', () => res(''));
  });
for (const f of ['0kv4a-p~1zj9b.catkod.css', '0kv4a-p~1zj9b.css']) {
  const c = await grab(base + f);
  console.log(
    `   ${f}: min-height:2lh=${c.includes('min-height:2lh')} grid-area:1/2/3/3=${c.includes('grid-area:1/2/3/3')} len=${c.length}`,
  );
}

// Tên MỚI phải trả 200
console.log('\n=== tên MỚI (có hash) ===');
for (const f of [
  '0kv4a-p~1zj9b.catkod.1bb0b6dd.css',
  '01e-_5wu9-q94.catkod.9632e2f1.js',
  '0vof9py47_u18.catkod.086a38e7.js',
]) {
  const r = await head(base + f);
  console.log(`   ${r.status}  ${f}`);
}

console.log(bad ? `\n${bad} tên cũ KHÔNG tồn tại (user cache sẽ gặp 404)` : '\nTất cả tên cũ đều tồn tại');
