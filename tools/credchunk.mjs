import fs from 'fs';
const s = fs.readFileSync('site/_next/static/chunks/01e-_5wu9-q94.js', 'utf8');
const j = s.indexOf('PdfPreviewDialog",0,function');
console.log(JSON.stringify(s.slice(j - 100, j + 3000)));
