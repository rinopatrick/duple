const CACHE = 'duple-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (e: any) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e: any) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
