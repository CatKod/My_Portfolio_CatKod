import fs from 'fs';

const file = process.argv[2];
const from = Number(process.argv[3]);
const len = Number(process.argv[4] || 2000);
const filter = process.argv[5];

const s = fs.readFileSync(file, 'utf8');
const chunk = s.slice(from, from + len);
if (filter) {
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(chunk))) {
    if (!m[1].includes(filter)) continue;
    console.log(m[1].trim() + ' { ' + m[2] + ' }');
    console.log();
  }
} else {
  console.log(chunk);
}
