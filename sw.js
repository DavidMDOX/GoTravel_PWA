// 简单缓存（版本 v4）：离线可打开首页与静态资源
const CACHE = "go-travel-pwa-v4";
const CORE = ["/", "/index.html", "/app.js", "/manifest.json"];

// 安装：预缓存核心资源
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

// 激活：清理旧版本缓存
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// 必须有 fetch 事件（Chrome 安装要求）
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // 仅处理同源请求，确保多域名下作用正常
  if (url.origin !== self.location.origin) return;

  // 优先网络，失败回退缓存；同时把成功响应放入缓存（SWR 简化版）
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((m) => m || caches.match("/")))
  );
});
