// Servidor local: entrega o site e grava os logs na pasta Logs/ deste PC.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = __dirname, LOGS = path.join(ROOT, 'Logs'), PORT = process.env.PORT || 3000;
fs.mkdirSync(LOGS, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.css': 'text/css', '.mp3': 'audio/mpeg', '.js': 'text/javascript' };

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e5) req.destroy(); });
    req.on('end', () => {
      try {
        const { session, line } = JSON.parse(body);
        const file = path.join(LOGS, `log-${String(session).replace(/[^\w-]/g, '')}.txt`);
        fs.appendFileSync(file, String(line) + '\n', 'utf8');
        res.writeHead(204).end();
      } catch { res.writeHead(400).end(); }
    });
    return;
  }
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, url === '/' ? 'index.html' : url);
  const allowed = file === path.join(ROOT, 'index.html') || (file.startsWith(path.join(ROOT, 'Imagens') + path.sep) || file.startsWith(path.join(ROOT, 'musica') + path.sep));
  if (!allowed) return res.writeHead(404).end('Not found');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return res.writeHead(404).end('Not found');
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || ''); // áudio precisa de Range para pular para 0:53
    if (m) {
      const start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Site no PC:      http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces()))
    for (const i of list) if (i.family === 'IPv4' && !i.internal) console.log(`  Site no celular: http://${i.address}:${PORT}  (mesmo Wi-Fi)`);
  console.log(`  Logs salvos em:  ${LOGS}\n`);
});

