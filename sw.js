// Define a cache name with a version to ensure updates trigger a refresh
const CACHE_NAME = 'hts-tool-cache-v3.1'; 

// List of files to cache upon installation
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  // Crucial: Cache the icon images
  '1000035855.png',
  'daughter_photo.png',
  'storcke_hts_logo.png'
];

// Installation event: Caches all essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing and caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
          // Force the new service worker to activate immediately
          return self.skipWaiting(); 
      })
  );
});

// Activation event: Cleans up old caches to ensure the latest version runs
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating and cleaning old caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // Ensure all clients controlled by this service worker are updated
        return self.clients.claim(); 
    })
  );
});

// Fetch event: Serves files from cache first, then network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for navigation and assets
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response
        if (response) {
          return response;
        }
        
        // No cache hit - fetch from the network
        return fetch(event.request).catch(() => {
          // If network fails (offline), and the file isn't in cache,
          // you could return an offline page here. For now, we fail silently.
          console.error('[SW] Fetch failed for:', event.request.url);
        });
      })
  );
});
