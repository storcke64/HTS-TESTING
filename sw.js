const CACHE_NAME = 'hts-v4';
// IMPORTANT: Use simple relative paths for files in the same directory
const urlsToCache = [
    'index.html',
    'sw.js',
    'manifest.json',
    'icon-192.png', 
    'icon-512.png', 
    // Add the root path for robustness on some servers
    './' 
];

self.addEventListener('install', event => {
    console.log('Service Worker: Installing and caching static assets...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // IMPORTANT: The promise from cache.addAll will reject if any file is missing, failing install.
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Cache.addAll failed:', error);
            })
    );
});

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

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
