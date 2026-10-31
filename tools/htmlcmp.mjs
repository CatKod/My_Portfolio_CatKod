import { readFileSync } from 'node:fs';

const routes = ['/', '/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];
for (const route of routes) {
  const r = await fetch('https://irfansabrian.vercel.app' + route, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const up = await r.text();
  const file = 'site' + (route === '/' ? '/index.html' : route);
  let local = '';
  try { local = readFileSync(file, 'utf8'); } catch {}
  console.log(route, 'up', r.status, up.length, '| local', local.length, '| EQUAL', up === local);
  if (up !== local) {
    let k = 0;
    while (k < Math.min(up.length, local.length) && up[k] === local[k]) k++;
    console.log('   first diff at', k);
    console.log('   U:', JSON.stringify(up.slice(k, k + 200)));
    console.log('   L:', JSON.stringify(local.slice(k, k + 200)));
  }
}
