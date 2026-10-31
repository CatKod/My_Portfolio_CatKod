import fs from 'fs';
const f = fs.readFileSync(process.argv[2], 'utf8');
const re = /\{"items":\[.*?\](.*?)\}/gs;
let m, i = 0;
while ((m = re.exec(f))) {
  i++;
  const names = [...m[0].matchAll(/"name":"([^"]+)"/g)].map((x) => x[1]);
  console.log(i, JSON.stringify(m[1]), names.join(','));
}
