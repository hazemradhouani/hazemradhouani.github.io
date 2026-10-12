// Zero-dependency static server: serves the repo under /portfolio/ like GitHub Pages, gzip, real 404s.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const root = path.resolve(process.argv[2] || "."); const port = +process.argv[3] || 8090; const base = '/portfolio/';
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.ico':'image/x-icon','.woff2':'font/woff2','.mp4':'video/mp4','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.webmanifest':'application/manifest+json'};
http.createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (u.startsWith('/__extra/')) { const p = path.join(process.argv[4] || root, u.slice(9)); if (fs.existsSync(p)) { res.writeHead(200, {'content-type': types[path.extname(p)] || 'application/octet-stream'}); return fs.createReadStream(p).pipe(res); } }
  if (!u.startsWith(base)) { res.writeHead(302, {location: base}); return res.end(); }
  let p = path.join(root, u.slice(base.length)); if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  let status = 200; if (!fs.existsSync(p)) { status = 404; p = path.join(root, '404.html'); if (!fs.existsSync(p)) { res.writeHead(404); return res.end('404'); } }
  const ext = path.extname(p), type = types[ext] || 'application/octet-stream', stat = fs.statSync(p);
  if (ext === '.mp4' && req.headers.range) { const [s, e] = req.headers.range.replace('bytes=','').split('-'); const start = +s, end = e ? +e : stat.size - 1;
    res.writeHead(206, {'content-type': type, 'content-range': `bytes ${start}-${end}/${stat.size}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1}); return fs.createReadStream(p, {start, end}).pipe(res); }
  const gz = /text|json|svg|xml|javascript/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '');
  res.writeHead(status, {'content-type': type, 'cache-control': 'no-cache', ...(gz ? {'content-encoding': 'gzip'} : {'content-length': stat.size})});
  const s = fs.createReadStream(p); gz ? s.pipe(zlib.createGzip()).pipe(res) : s.pipe(res);
}).listen(port, () => console.log(`serving ${root} at http://127.0.0.1:${port}${base}`));
