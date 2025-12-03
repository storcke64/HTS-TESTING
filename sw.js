const CACHE_NAME = 'hts-converter-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'daughter_photo.png', // The desired PWA icon
  '1000035855.png',     // Main HTS Logo
  'storcke_hts_logo.png' // Footer Logo (cached for use on site)
];

// Install event: Cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and adding files:', urlsToCache);
        return cache.addAll(urlsToCache).catch(error => {
            console.error('Failed to cache required assets:', error);
            // Non-critical resources failing to cache won't block the install
        });
      })
  );
});

// Fetch event: Serve content from cache first, then fall back to network
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

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
