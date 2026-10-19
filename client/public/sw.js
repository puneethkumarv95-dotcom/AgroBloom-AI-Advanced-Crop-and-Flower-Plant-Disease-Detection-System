/**
 * AgroBloom AI - Progressive Web App Service Worker (v1.0.0)
 * Caches offline application shell, core styles, and genuine neural model assets.
 * Strictly excludes private authentication and user tokens from caching.
 */

const CACHE_NAME = 'agrobloom-shell-v1';
const MODEL_CACHE_NAME = 'agrobloom-models-v1';

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

const MODEL_ASSETS = [
  '/models/offline_metadata.json',
  '/models/crop_head_weights.json',
  '/models/flower_head_weights.json'
];

// Install: Cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching core application shell');
      return cache.addAll(APP_SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== MODEL_CACHE_NAME) {
            console.log('[Service Worker] Purging legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy - Network-first for dynamic API, Cache-first for models and static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache authentication tokens or private session APIs
  if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/profile')) {
    return;
  }

  // Model weight and metadata files: Cache-First
  if (url.pathname.startsWith('/models/')) {
    event.respondWith(
      caches.open(MODEL_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (err) {
          return cached || new Response(JSON.stringify({ error: 'Offline asset not cached' }), { status: 503 });
        }
      })
    );
    return;
  }

  // HTML / App Navigation: Network first with Cache Fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/')) || (await cache.match('/index.html'));
      })
    );
    return;
  }

  // Static Assets (CSS, JS, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && event.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

