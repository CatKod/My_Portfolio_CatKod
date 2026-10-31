import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/profile.mjs';
let t = readFileSync(f, 'utf8');

// 1) Thêm ảnh chứng chỉ
t = t.replace(
  /export const credentials = \[\n/,
  `export const credentials = [\n`,
);

// 2) Bổ sung trường image cho từng chứng chỉ
const IMAGES = {
  'CERT-01': '/images/credentials/certificate-jlpt-n3.png',
  'CERT-02': '/images/credentials/certificate-machine-learning-specialization.png',
  'CERT-03': '/images/credentials/certificate-deep-learning-specialization.png',
  'CERT-04': '/images/credentials/certificate-hust-information-technology.png',
};
for (const [code, img] of Object.entries(IMAGES)) {
  const re = new RegExp(`(code: '${code}',\\n)`);
  t = t.replace(re, `$1    image: '${img}',\n`);
}

writeFileSync(f, t, 'utf8');
console.log('ok');
