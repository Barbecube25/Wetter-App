const CACHE_NAME = 'wetter-app-v3'; // Version erhöht für Cache-Update
const DYNAMIC_CACHE = 'wetter-app-dynamic-v3';

// Dateien, die sofort gecacht werden sollen (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1163/1163661.png' // Neues Standard-Icon
];

// 1. Install Event: Statische Assets cachen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn("[Service Worker] Ein Asset konnte nicht geladen werden:", err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Alte Caches aufräumen
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Aktivierung - Bereinige alte Caches');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log('[Service Worker] Lösche alten Cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('[Service Worker] Cache-Bereinigung abgeschlossen');
      // Force immediate control of all clients (wichtig nach Update)
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Netzwerkanfragen abfangen
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. API-Anfragen (Open-Meteo & Brightsky) -> Network First
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

  // B. Statische Ressourcen -> Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(err => {});
      return cachedResponse || fetchPromise;
    })
  );
});
