const urls = [
  'https://catkod.github.io/',
  'https://catkod.github.io/about',
  'https://catkod.github.io/about/',
  'https://catkod.github.io/work',
  'https://catkod.github.io/work/',
  'https://catkod.github.io/skills',
  'https://catkod.github.io/credentials',
  'https://catkod.github.io/credentials/',
  'https://catkod.github.io/guestbook',
  'https://catkod.github.io/contact',
];

for (const u of urls) {
  try {
    const r = await fetch(u, { redirect: 'manual' });
    const ct = r.headers.get('content-type');
    console.log(String(r.status).padEnd(4), ct?.split(';')[0]?.padEnd(24), u);
  } catch (e) {
    console.log('ERR ', u, e.message);
  }
}
