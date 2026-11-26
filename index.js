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

// Admin: PIN dicek di server. Penulisan ke Supabase pakai service_role (tidak pernah dikirim ke browser)
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 5000000) { reject(new Error('Data terlalu besar')); req.destroy(); }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

async function sbAdmin(method, pathQS, body, extraHeaders) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase belum dikonfigurasi');
  const r = await fetch(url + '/rest/v1/' + pathQS, {
    method,
    headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', ...(extraHeaders || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error('Supabase HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r;
}

async function handleAdmin(req, res, fn) {
  try {
    if ((req.headers['x-admin-pin'] || '') !== ADMIN_PIN) return sendJson(res, 401, { ok: false, error: 'PIN salah' });
    const raw = await readBody(req);
    const body = raw ? JSON.parse(raw) : {};
    sendJson(res, 200, await fn(body));
  } catch (err) {
    sendJson(res, 500, { ok: false, error: String(err.message || err) });
  }
}

const MERGE = { Prefer: 'resolution=merge-duplicates,return=minimal' };

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  if (urlPath === '/api/admin/materi' && req.method === 'POST') {
    return handleAdmin(req, res, async (body) => {
      if (!Array.isArray(body.modules)) throw new Error('modules harus berupa daftar');
      await sbAdmin('POST', 'pengaturan_app?on_conflict=key', [{ key: 'materi', value: { modules: body.modules }, updated_at: new Date().toISOString() }], MERGE);
      return { ok: true };
    });
  }

  if (urlPath === '/api/admin/reset' && req.method === 'POST') {
    return handleAdmin(req, res, async () => {
      await sbAdmin('DELETE', 'nilai_siswa?nama=not.is.null', null, { Prefer: 'return=minimal' });
      const version = Date.now();
      await sbAdmin('POST', 'pengaturan_app?on_conflict=key', [{ key: 'reset', value: { version }, updated_at: new Date().toISOString() }], MERGE);
      return { ok: true, version };
    });
  }

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
