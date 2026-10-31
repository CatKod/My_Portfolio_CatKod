const BASE = process.argv[2] || 'http://127.0.0.1:9310';
const ROUTES = ['/', '/about', '/work', '/skills', '/credentials', '/guestbook', '/contact'];

const NEEDLES = ['Irfan', 'Sabrian', 'irfan', 'sabrian', 'Indonesia', 'Indonesi'];

(async () => {
  for (const p of ROUTES) {
    const html = await (await fetch(BASE + p)).text();
    const rsc = await (
      await fetch(BASE + p + '?_rsc=abc', { headers: { RSC: '1' } })
    ).text();
    const ct = (await fetch(BASE + p + '?_rsc=abc', { headers: { RSC: '1' } })).headers.get(
      'content-type'
    );
    const find = (s) => NEEDLES.filter((n) => s.includes(n));
    const pushes = (html.match(/self\.__next_f\.push/g) || []).length;
    const emptyPush = /self\.__next_f\.push\(\[1,"\\n"\]\)/.test(html);
    console.log(
      `${p.padEnd(12)} html=${String(html.length).padStart(7)} pushes=${String(pushes).padStart(3)}` +
        ` emptyPush=${emptyPush} rsc=${String(rsc.length).padStart(6)} ct=${ct}` +
        ` htmlOld=[${find(html)}] rscOld=[${find(rsc)}]`
    );
  }
})();
