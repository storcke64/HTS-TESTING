const CACHE_NAME = 'hts-tool-cache-v1';
// List of files to cache. Since this is a single-file app, we primarily cache index.html 
// and the Tailwind CDN link. We also include the manifest and hypothetical icons.
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // You MUST have these icon files in your repository for the PWA to install correctly
  '/icon-192.png', 
  '/icon-512.png',
  'https://cdn.tailwindcss.com'
];

// Install Event: Caches necessary static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install Event: Caching static assets.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Event: Cleans up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate Event: Cleaning up old caches.');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOfsw.js(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event: Serves content from cache first (Cache-First strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request);
      })
  );
});
