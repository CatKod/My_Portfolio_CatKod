import fs from 'fs';
const s = fs.readFileSync('site/_next/static/chunks/15nsyxl.8hl16.js', 'utf8');
for (const n of ['Cppcheck', 'Unity', 'cppcheck']) {
  const i = s.indexOf(n);
  console.log('###', n, i);
  if (i !== -1) console.log(JSON.stringify(s.slice(i - 260, i + 260)));
}
