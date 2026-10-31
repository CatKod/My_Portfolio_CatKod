import fs from 'fs';
const path = 'site/_next/static/chunks';
for (const f of fs.readdirSync(path)) {
  if (!f.endsWith('.js')) continue;
  const s = fs.readFileSync(path + '/' + f, 'utf8');
  if (s.includes('Firmware & Embedded')) console.log('HAS NEW:', f, s.length);
  if (s.includes('Full-stack Web Development')) console.log('HAS OLD:', f, s.length);
}
