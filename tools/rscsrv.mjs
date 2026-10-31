import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const port = Number(process.argv[3] || 9313);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

const ROUTES = {
  '/': 'index.html',
  '/about': 'about',
  '/work': 'work',
  '/skills': 'skills',
  '/credentials': 'credentials',
  '/guestbook': 'guestbook',
  '/contact': 'contact',
};

/** Trích toàn bộ payload flight (nội dung đã decode) từ HTML tĩnh. */
function flightPayload(html) {
  const re = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g;
  let out = '';
  for (const m of html.matchAll(re)) {
    try {
      out += JSON.parse('"' + m[1] + '"');
    } catch {
      /* ignore */
    }
  }
  return out;
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = decodeURIComponent(url.pathname);

  // RSC request -> tra payload flight tī� file tĩnh tương ứng
  if (url.searchParams.has('_rsc') || req.headers['rsc'] || req.headers['next-router-state-tree']) {
    const key = ROUTES[p] ?? ROUTES[p.replace(/\/$/, '')];
    if (key) {
      const file = join(root, key);
      if (existsSync(file)) {
        const payload = flightPayload(readFileSync(file, 'utf8'));
        res.writeHead(200, {
          'Content-Type': 'text/x-component',
          'Vary': 'RSC, Next-Router-State-Tree, Next-Router-Prefetch',
        });
        res.end(payload);
        return;
      }
    }
  }

  let file = join(root, p === '/' ? 'index.html' : p);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    const alt = join(file, 'index.html');
    if (existsSync(alt)) file = alt;
  }
  if (!existsSync(file)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found: ' + p);
    return;
  }
  const dot = file.lastIndexOf('.');
  const ext = dot > file.lastIndexOf('/') ? file.slice(dot).toLowerCase() : '';
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'text/html; charset=utf-8' });
  res.end(readFileSync(file));
}).listen(port, () => console.log('rsc-capable static on', port, root));
