import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';
import { SOCIALS } from './socials.mjs';

const files = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];
for (const f of files) {
  const parts = splitFile(readFileSync('site.orig.bak/' + f, 'utf8'));
  console.log('==', f);
  for (const [from, to] of SOCIALS) {
    let dom = 0, flight = 0;
    for (const p of parts) {
      if (p.kind === 'raw') dom += p.text.split(from).length - 1;
      else flight += p.text.split(from).length - 1;
    }
    if (dom + flight) console.log('  dom', dom, 'flight', flight, JSON.stringify(from.slice(0, 60)));
  }
}
