const CACHE_NAME = 'hts-converter-v1';

// List of files to cache for offline use. This includes all assets used in index.html.
const urlsToCache = [
    './index.html',
    './manifest.json',
    './1000035855.png', // Main Logo
    './storcke_hts_logo.png', // Footer Logo
    './icon-192.png', // PWA Icon
    './icon-512.png' // PWA Icon
];

// --- Installation: Pre-cache assets ---
self.addEventListener('install', (event) => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and pre-caching essential assets.');
                return cache.addAll(urlsToCache);
            })
    );
});

// --- Fetch: Serve assets from cache first ---
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request);
            })
    );
});

// --- Activation: Clean up old caches ---
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
