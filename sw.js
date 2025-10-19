// Basic offline-first SW for a wrapper app
const CACHE = 'go-travel-pwa-v1';
const CORE = [
  '/', '/index.html', '/manifest.json',
  '/styles.css', '/config.js',
  '/icons/icon-180.png', '/icons/icon-192.png', '/icons/icon-512.png',
  '/billing.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Never cache Hugging Face iframe requests; pass-through network
  if (url.href.includes('.hf.space')) {
    return; // default fetch
  }
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(m => m || caches.match('/index.html')))
  );
});
