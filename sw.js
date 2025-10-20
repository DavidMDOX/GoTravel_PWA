// no-op service worker: 覆盖旧缓存但不再拦截任何请求
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 不拦截任何 fetch，让浏览器直接从网络加载最新文件
