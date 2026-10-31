/**
 * Tạo ảnh thumbnail giả lập cho 4 chứng chỉ của Hoàng Kim Vĩnh.
 *
 * Site gốc dùng ảnh chụp chứng chỉ thật. Vì không có bản scan của CatKod,
 * ta dựng một "certificate card" SVG->PNG/WebP có cùng tỉ lệ khung, để giao
 * diện giữ nguyên bố cục.
 */
import { existsSync, mkdirSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = 'site/images/credentials';
mkdirSync(OUT, { recursive: true });

/** @type {{file:string, code:string, label:string, title:string, issuer:string, tint:string}[]} */
const CARDS = [
  {
    file: 'certificate-jlpt-n3.png',
    code: 'CERT-01',
    label: 'Language',
    title: 'Japanese Language Proficiency Test - N3',
    issuer: 'Japan Foundation',
    tint: '#b3261e',
  },
  {
    file: 'certificate-machine-learning-specialization.png',
    code: 'CERT-02',
    label: 'Machine Learning',
    title: 'Machine Learning Specialization',
    issuer: 'DeepLearning.AI x Stanford University',
    tint: '#0b7285',
  },
  {
    file: 'certificate-deep-learning-specialization.png',
    code: 'CERT-03',
    label: 'Deep Learning',
    title: 'Deep Learning Specialization',
    issuer: 'DeepLearning.AI',
    tint: '#1c7ed6',
  },
  {
    file: 'certificate-hust-information-technology.png',
    code: 'CERT-04',
    label: 'Study',
    title: 'Information Technology - HUST',
    issuer: 'Hanoi University of Science and Technology',
    tint: '#5f3dc4',
  },
];

const W = 920;
const H = 621;

function svg(card) {
  const esc = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const title = card.title;
  const issuer = card.issuer;
  // xuống dòng tiêu đề
  const words = title.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 34) {
      lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);

  const titleLines = lines
    .map(
      (l, i) =>
        `<text x="460" y="${286 + i * 42}" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#111111" text-anchor="middle">${esc(l)}</text>`,
    )
    .join('');

  const issuerLines = [];
  const iWords = issuer.split(' ');
  let icur = '';
  for (const w of iWords) {
    if ((icur + ' ' + w).trim().length > 40) {
      issuerLines.push(icur.trim());
      icur = w;
    } else {
      icur = (icur + ' ' + w).trim();
    }
  }
  if (icur) issuerLines.push(icur);
  const issuerSvg = issuerLines
    .map(
      (l, i) =>
        `<text x="460" y="${400 + i * 26}" font-family="Helvetica, Arial, sans-serif" font-size="19" fill="#444444" text-anchor="middle">${esc(l)}</text>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f4f1ea"/>
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="${card.tint}" stroke-width="3"/>
  <rect x="36" y="36" width="${W - 72}" height="${H - 72}" fill="none" stroke="${card.tint}" stroke-width="1" opacity="0.45"/>
  <rect x="0" y="0" width="${W}" height="12" fill="${card.tint}"/>
  <text x="460" y="132" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="6" fill="${card.tint}" text-anchor="middle">CERTIFICATE OF COMPLETION</text>
  <text x="460" y="186" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="3" fill="#6b6b6b" text-anchor="middle">${esc(card.code)}</text>
  <line x1="330" y1="206" x2="590" y2="206" stroke="${card.tint}" stroke-width="1" opacity="0.5"/>
  ${titleLines}
  <text x="460" y="${348 + (lines.length - 1) * 21}" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="3" fill="#8a8a8a" text-anchor="middle">IS ISSUED TO</text>
  <text x="460" y="${382 + (lines.length - 1) * 21}" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="#111111" text-anchor="middle">Hoang Kim Vinh</text>
  ${issuerSvg}
  <circle cx="760" cy="510" r="42" fill="none" stroke="${card.tint}" stroke-width="2" opacity="0.6"/>
  <circle cx="760" cy="510" r="32" fill="none" stroke="${card.tint}" stroke-width="1" opacity="0.4"/>
  <path d="M742 510 l12 13 l25 -28" fill="none" stroke="${card.tint}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="460" y="${H - 74}" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="4" fill="#9a9a9a" text-anchor="middle">VERIFIED RECORD</text>
</svg>`;
}

for (const card of CARDS) {
  const out = `${OUT}/${card.file}`;
  if (existsSync(out)) {
    console.log('skip (exists)', out);
    continue;
  }
  const tmp = out.replace(/\.png$/, '.svg');
  writeFileSync(tmp, svg(card), 'utf8');
  execFileSync('python', [
    '-c',
    `import cairosvg,sys; cairosvg.svg2png(url=sys.argv[1], write_to=sys.argv[2], output_width=${W}, output_height=${H})`,
    tmp,
    out,
  ]);
  console.log('created', out);
}
