import fs from 'fs';
const file = process.argv[2] || 'site/credentials';
const html = fs.readFileSync(file, 'utf8');
// Lấy SSR HTML trước hydration (server render)
const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1].replace(/<script[\s\S]*?<\/script>/gi, '');
const m = body.match(/<div class="credential-certificate-list">[\s\S]*?<\/div><\/div>/);
console.log('SSR list found:', !!m);
if (m) {
  const c = m[0];
  console.log('anchors:', (c.match(/<a /g) || []).length);
  console.log('buttons:', (c.match(/<button/g) || []).length);
  console.log('Open credential:', (c.match(/Open credential/g) || []).length);
  console.log('Preview PDF:', (c.match(/Preview PDF/g) || []).length);
}
