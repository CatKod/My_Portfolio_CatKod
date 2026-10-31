import fs from 'fs';
const route = process.argv[2] || '/work';
const res = await fetch('http://localhost:9310' + route);
const html = await res.text();
fs.writeFileSync('tmp_ssr.html', html);
console.log('saved tmp_ssr.html', html.length);
