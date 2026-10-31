const routes = ['/', '/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];

for (const route of routes) {
  const full = await fetch('https://irfansabrian.vercel.app' + route + '?_rsc=full123', {
    headers: { RSC: '1', 'Next-Url': route },
  });
  const ft = await full.text();
  const pre = await fetch('https://irfansabrian.vercel.app' + route + '?_rsc=pre123', {
    headers: { RSC: '1', 'Next-Router-Prefetch': '1', 'Next-Url': route },
  });
  const pt = await pre.text();
  console.log(route, '| full', full.status, ft.length, full.headers.get('content-type'), '| prefetch', pre.status, pt.length);
}
