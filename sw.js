
const CACHE_NAME = '100panik-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/pages/index.html',
  '/pages/boutik.html',
  '/pages/koleksyon.html',
  '/pages/istwa.html',
  '/pages/kontak.html',
  '/pages/admin.html',
  '/pages/konekte.html',
  '/pages/enskri.html',
  '/pages/panye.html',
  '/pages/checkout.html',
  '/pages/404.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/images/logo-100panik.jpg',
  '/assets/images/hero-bg.svg',
  '/assets/images/products/product-1.svg',
  '/assets/images/products/product-2.svg',
  '/assets/images/products/product-3.svg',
  '/assets/images/products/product-4.svg',
  '/assets/images/products/product-5.svg',
  '/assets/images/products/product-6.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(response => {
          // Cache dynamic requests (e.g. Supabase API) only if successful
          if (response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        });
      })
  );
});
