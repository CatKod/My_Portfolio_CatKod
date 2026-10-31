import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const files = ['index.html', 'about', 'work', 'skills', 'credentials', 'guestbook', 'contact'];
for (const f of files) {
  const parts = splitFile(readFileSync('site/' + f, 'utf8'));
  let dom = '', flight = '';
  for (const p of parts) {
    if (p.kind === 'raw') dom += p.text;
    else flight += p.text;
  }
  const d = (dom.match(/lucide lucide-facebook/g) || []).length;
  const fl = (flight.match(/lucide lucide-facebook/g) || []).length;
  const dIco = (dom.match(/M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7/g) || []).length;
  const fIco = (flight.match(/M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7/g) || []).length;
  // logo: DOM rect/polygon count vs flight
  const dLogo = (dom.match(/viewBox="0 0 304\.95 285\.2"/g) || []).length;
  const fLogo = (flight.match(/"viewBox":"0 0 304\.95 285\.2"/g) || []).length;
  const ckDom = (dom.match(/x="170" y="20" width="58" height="245"/g) || []).length;
  const ckFl = (flight.match(/"x":"170","y":"20","width":"58","height":"245"/g) || []).length;
  console.log(
    f.padEnd(14),
    'fbClass dom/fl:', d, fl,
    '| fbIcon dom/fl:', dIco, fIco,
    '| logoSvg dom/fl:', dLogo, fLogo,
    '| ckRect dom/fl:', ckDom, ckFl,
    d === fl && dIco === fIco && dLogo === fLogo && ckDom === ckFl ? 'OK' : 'MISMATCH',
  );
}
