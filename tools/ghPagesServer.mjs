/**
 * Kiểm tra bản deploy như GitHub Pages sẽ phục vụ:
 *  - route không đuôi -> thư mục kèm index.html
 *  - MIME type đúng
 *  - .nojekyll tồn tại, _next/ được phục vụ nguyên vẹn
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'deploy');
const port = Number(process.argv[3] || 9314);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const abs = path.join(root, p);
  if (!abs.startsWith(root)) return null;
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  const nested = path.join(abs, 'index.html');
  if (fs.existsSync(nested)) return nested;
  return null;
}

http
  .createServer((req, res) => {
    const file = resolve(req.url);
    if (!file) {
      const nf = path.join(root, '404.html');
      const body = fs.existsSync(nf) ? fs.readFileSync(nf) : Buffer.from('Not found');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(body);
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  })
  .listen(port, () => console.log('gh-pages-like server http://localhost:' + port + ' root=' + root));
