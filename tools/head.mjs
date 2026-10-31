import https from 'https';
const urls = process.argv.slice(2);
function head(u) {
  return new Promise((res) => {
    https.get(u, { headers: { 'User-Agent': 'node' } }, (r) => {
      res(r.statusCode);
      r.resume();
    }).on('error', () => res('ERR'));
  });
}
for (const u of urls) console.log(await head(u), u);
