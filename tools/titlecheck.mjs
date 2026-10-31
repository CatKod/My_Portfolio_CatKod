import fs from 'fs';

const file = process.argv[2];
const html = fs.readFileSync(file, 'utf8');
const m = html.match(/<title>([\s\S]*?)<\/title>/);
console.log(file, '=>', m ? m[1] : '(no title)');
const lang = html.match(/<html[^>]*lang="([^"]*)"/);
console.log('  lang:', lang ? lang[1] : '?');
