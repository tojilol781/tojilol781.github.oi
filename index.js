const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || process.env.SERVER_PORT || '10260', 10);
const HTML_FILE = path.join(__dirname, 'micro smp.html');

// Baca .env sederhana (KEY=VALUE) agar SUPABASE_URL dan SUPABASE_ANON_KEY terbaca
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
} catch (e) { /* .env opsional */ }

// Hanya URL dan anon key (kunci publik) yang dikirim ke browser
const SUPABASE_CONFIG_JS = 'window.SUPABASE_URL = ' + JSON.stringify(process.env.SUPABASE_URL || '') + ';\n' +
  'window.SUPABASE_ANON_KEY = ' + JSON.stringify(process.env.SUPABASE_ANON_KEY || '') + ';\n';

// File PWA: rute URL -> [nama file, content type]
const STATIC_FILES = {
  '/manifest.json': ['manifest.json', 'application/manifest+json; charset=utf-8'],
  '/sw.js': ['sw.js', 'application/javascript; charset=utf-8'],
  '/icon-192-v2.png': ['icon-192-v2.png', 'image/png'],
  '/icon-512-v2.png': ['icon-512-v2.png', 'image/png'],
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  if (urlPath === '/supabase-config.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(SUPABASE_CONFIG_JS);
  }

  if (STATIC_FILES[urlPath]) {
    const [file, type] = STATIC_FILES[urlPath];
    return fs.readFile(path.join(__dirname, file), (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not Found');
      }
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  }

  if (urlPath !== '/' && urlPath !== '/index.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  }
  fs.readFile(HTML_FILE, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Gagal membaca file HTML');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di port ${PORT}`);
});
