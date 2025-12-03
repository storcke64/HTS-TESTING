const CACHE_NAME = 'hts-v1';
// List of files to cache for offline use
const urlsToCache = [
  './', 
  './index.html',
  './1000035855.png', // Main Logo
  './storcke_hts_logo.png', // Footer Logo
  './manifest.json',
  './sw.js', // Cache the service worker itself
  './daughter_photo.png', // MANDATORY: Daughter's Photo for Splash Screen
];

// Installation event: Caches all essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install Event: Caching App Shell');
  // `event.waitUntil` ensures the Service Worker isn't installed until all files are cached.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Add all required URLs to the cache
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache assets:', error);
      })
  );
});

// Activation event: Clears out old caches to ensure users always get the latest version
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate Event: Cleaning old caches');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Check if the current cacheName is NOT in the whitelist (i.e., it's an old version)
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of non-controlled pages immediately
  return self.clients.claim();
});

// Fetch event: Intercepts network requests and serves from cache first
self.addEventListener('fetch', (event) => {
  // Only serve from cache for GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the cached response
        if (response) {
          return response;
        }
        // No match in cache, fetch from network
        return fetch(event.request).catch(error => {
            console.error('Fetch failed: Network error or file not found', event.request.url, error);
            // In a cache-first strategy, this means the network also failed.
        });
      })
  );
});
