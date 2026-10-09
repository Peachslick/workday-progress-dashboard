const CACHE_NAME = "workday-journey-v8.6.0.5.1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./workday.css?v=8.6.0.5",
  "./workday-core.js?v=8.6.0.5.1",
  "./workday-features.js?v=8.6.0.5.1",
  "./manifest.webmanifest",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/fonts/Sarabun-Regular.ttf",
  "./assets/fonts/Sarabun-Medium.ttf",
  "./assets/fonts/Sarabun-SemiBold.ttf",
  "./assets/fonts/Sarabun-Bold.ttf",
  "./assets/fonts/Sarabun-ExtraBold.ttf",
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("workday-journey-v") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname.endsWith("/supabase-config.js")) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        return response;
      }))
    );
    return;
  }

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com" || url.hostname === "cdn.jsdelivr.net") {
    event.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
          return response;
        }).catch(() => cached);
        return cached || network;
      })
    );
  }
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      for (const client of clients) if ("focus" in client) return client.focus();
      if (self.clients.openWindow) return self.clients.openWindow("./index.html");
    })
  );
});
