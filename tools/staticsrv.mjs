import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const port = Number(process.argv[3] || 9311);

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

createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
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
}).listen(port, () => console.log('static on', port, root));
