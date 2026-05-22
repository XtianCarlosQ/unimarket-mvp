const CACHE_VERSION = 2;
const CACHE_NAME = `unimarket-mvp-v${CACHE_VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/data.js",
  "./js/app.js",
  "./manifest.json",
  "./assets/logo-bag.svg",
  "./assets/icons/icon-144.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/products/crab.svg",
  "./assets/products/bracelet.svg",
  "./assets/products/necklace.svg",
  "./assets/products/stickers.svg",
  "./assets/products/book.svg",
  "./assets/products/snack.svg",
  "./assets/products/hoodie.svg",
  "./assets/products/calculator.svg",
  "./assets/products/notes.svg",
  "./assets/products/flower.svg",
  "./assets/products/earrings.svg",
  "./assets/products/lunch.svg",
  "./assets/avatars/valeria.svg",
  "./assets/avatars/tejido.svg",
  "./assets/avatars/dulce.svg",
  "./assets/avatars/fashion.svg",
  "./assets/avatars/books.svg",
  "./assets/avatars/tech.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  const isAsset = url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2)$/i);
  
  if (isAsset) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        }).catch(() => null);
      })
    );
  } else {
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => {
          return cached || caches.match("./index.html");
        });
      })
    );
  }
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
