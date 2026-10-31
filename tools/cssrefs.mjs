import fs from 'fs';
import path from 'path';

const dir = 'site/_next/static/chunks';
const cssFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.css'));
console.log('CSS files:', cssFiles.join(', '));

for (const f of cssFiles) {
  const refs = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const s = fs.readFileSync(p, 'utf8');
        const n = s.split('/_next/static/chunks/' + f).length - 1;
        if (n) refs.push(p + ' x' + n);
      }
    }
  };
  walk('site');
  console.log('\n' + f + ' -> ' + refs.length + ' file');
  refs.forEach((r) => console.log('   ' + r));
}
