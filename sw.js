const CACHE_NAME = 'microlearning-v6';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icon-192-v2.png', '/icon-512-v2.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Hanya file dari domain sendiri yang di-cache. Supabase dan CDN tetap langsung ke jaringan.
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Halaman utama: coba jaringan dulu, kalau offline pakai salinan cache.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
