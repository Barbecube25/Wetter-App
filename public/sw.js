const CACHE_NAME = 'wetter-app-v1';
const DYNAMIC_CACHE = 'wetter-app-dynamic-v1';

// Dateien, die sofort gecacht werden sollen (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
  // Vite generiert Hash-Dateinamen für JS/CSS, diese werden dynamisch gecacht
];

// 1. Install Event: Statische Assets cachen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Sofort aktivieren
});

// 2. Activate Event: Alte Caches aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event: Netzwerkanfragen abfangen
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. API-Anfragen (Open-Meteo & Brightsky) -> Network First
  // Wir wollen immer frische Daten, aber falls offline, nehmen wir den Cache.
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('brightsky.dev')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // B. Statische Ressourcen (JS, CSS, Bilder) -> Stale-While-Revalidate
  // Sofort aus dem Cache laden, aber im Hintergrund aktualisieren.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
