import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/rebrand.mjs';
let t = readFileSync(f, 'utf8');

/* 1) Thay bảng thay thế chung (common.mjs) — bổ sung "Indonesia" -> "Vietnam" */
const oldCommon = `  // --- loader / brand ---
  ['Irfan Sabrian / 2026', \`\${profile.name} / 2026\`],
  ['Irfan / 2026', \`\${profile.name} / 2026\`],
];`;

const newCommon = `  // --- loader / brand ---
  ['Irfan Sabrian / 2026', \`\${profile.name} / 2026\`],
  ['Irfan / 2026', \`\${profile.name} / 2026\`],

  // --- ngôn ngữ Google Translate ---
  ['<option value="id">Indonesia</option>', '<option value="vi">Vietnam</option>'],
];`;

if (!t.includes(oldCommon)) {
  console.error('common: không khớp');
} else {
  t = t.replace(oldCommon, newCommon);
}

/* 2) Thêm phần xử lý chunk JS vào cuối file */
const runner = `
/* ------------------------------------------------------------------ */
/* Client bundles (JS)                                                  */
/* ------------------------------------------------------------------ */

/**
 * Thay thế chuỗi trong các chunk JS của Next.js.
 * Nội dung này chạy ở client nên phải khớp với DOM/flight đã đổi.
 */
function rebrandChunks() {
  const dir = 'site/_next/static/chunks';
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((f) => f.endsWith('.js'));
  const table = [
    ['Loading Irfan Sabrian portfolio', \`Loading \${profile.name} portfolio\`],
    ['Irfan Sabrian / 2026', \`\${profile.name} / 2026\`],
    ['Irfan replied', \`\${profile.name} replied\`],
    ['title:"Irfan Sabrian"', \`title:"\${profile.name}"\`],
    ['irfan-portfolio-google-language', 'catkod-portfolio-google-language'],
    ['irfan-portfolio-loader-complete-v7', 'catkod-portfolio-loader-complete-v7'],
    // Ngôn ngữ: bỏ "Indonesia", giữ nguyên phần còn lại của danh sách
    ['{code:"id",label:"Indonesia"},', ''],
    ['Irfan Sabrian', profile.name],
    ['Irfan', profile.name],
  ];
  for (const file of files) {
    const p = joinPath(dir, file);
    const src = readFileSync(p, 'utf8');
    let out = src;
    for (const [from, to] of table) {
      if (from) out = out.split(from).join(to);
    }
    if (out !== src) {
      writeFileSync(p, out, 'utf8');
      console.log('chunk', file, src.length, '->', out.length);
    }
  }
}
`;

// Chèn trước phần "Chạy"
const marker = `/* ------------------------------------------------------------------ */
/* Chạy                                                                 */`;
if (!t.includes(marker)) {
  console.error('không tìm thấy marker Chạy');
  process.exit(1);
}
t = t.replace(marker, runner + '\n' + marker);

/* 3) Gọi rebrandChunks trong vòng chạy */
t = t.replace(
  `for (const [route, [src, dst]] of Object.entries(ROUTES)) {`,
  `rebrandChunks();

for (const [route, [src, dst]] of Object.entries(ROUTES)) {`,
);

/* 4) Import readdirSync/existsSync */
t = t.replace(
  `import { readFileSync, writeFileSync } from 'node:fs';`,
  `import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';\nimport { join as joinPath } from 'node:path';`,
);

writeFileSync(f, t, 'utf8');
console.log('ok');
