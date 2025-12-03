/**
 * Service Worker for the Human Time System (HTS) Converters PWA.
 * This script handles caching of essential assets for offline use.
 */

// Define the name of the cache and the list of assets to cache
const CACHE_NAME = 'hts-converter-v2.0'; 
// The current version is 2.0 to force a service worker update on existing installs.

// List all files necessary for the app to function offline.
// *** IMPORTANT: The new icon file (1000035855.png) is included here. ***
const CACHE_ASSETS = [
    '/',
    'index.html',
    'manifest.json',
    'sw.js',
    'storcke_hts_logo.png', // The footer logo
    '1000035855.png',       // The main HTS icon/splash screen image
];

// 1. Install Event: Caching the static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event: Caching assets...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // Add all essential assets to the cache
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => self.skipWaiting()) // Force the new service worker to activate immediately
            .catch((err) => {
                console.error('[Service Worker] Caching failed during install:', err);
            })
    );
});

// 2. Activate Event: Cleaning up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event: Cleaning old caches...');
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Check if the old cache name is not in the whitelist (i.e., not the current version)
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Claim clients to allow immediate control
    );
});

// 3. Fetch Event: Serving content from cache first, falling back to network
self.addEventListener('fetch', (event) => {
    // Only intercept requests for assets that are listed in the CACHE_ASSETS array
    const url = new URL(event.request.url);
    const isAsset = CACHE_ASSETS.includes(url.pathname) || url.pathname === '/';

    if (isAsset) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Cache hit - return the cached response
                    if (response) {
                        return response;
                    }

                    // No cache hit - fetch from the network
                    return fetch(event.request);
                })
                .catch((err) => {
                    console.error('[Service Worker] Fetch failed:', err);
                    // Optionally, return a generic offline page if the network fails
                    // For this simple app, we just return nothing on failure.
                })
        );
    }
    // For non-asset requests (e.g., external links, API calls), let them go to the network normally.
});

// 4. Message Event: Handling communication (optional but good practice)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
