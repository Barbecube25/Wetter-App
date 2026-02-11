const CACHE_NAME = 'wetter-app-v4'; // Version erhöht für Cache-Update
const DYNAMIC_CACHE = 'wetter-app-dynamic-v4';

// Dateien, die sofort gecacht werden sollen (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1163/1163661.png' // Neues Standard-Icon
];

// 1. Install Event: Statische Assets cachen
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing new version...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn("[Service Worker] Ein Asset konnte nicht geladen werden:", err);
        // Don't fail installation if optional assets fail to cache
        return Promise.resolve();
      });
    }).catch(err => {
      console.error('[Service Worker] Installation failed:', err);
      // Even if caching fails, continue installation
      return Promise.resolve();
    })
  );
  // Force immediate activation
  self.skipWaiting();
});

// 2. Activate Event: Alte Caches aufräumen
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Aktivierung - Bereinige alte Caches');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map((key) => {
              console.log('[Service Worker] Lösche alten Cache:', key);
              return caches.delete(key);
            })
        );
      }),
      // Force immediate control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[Service Worker] Aktivierung abgeschlossen');
    }).catch(err => {
      console.error('[Service Worker] Activation error:', err);
      // Continue activation even if cleanup fails
      return self.clients.claim();
    })
  );
});

// 3. Fetch Event: Netzwerkanfragen abfangen
self.addEventListener('fetch', (event) => {
  // Skip non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Navigation requests -> Network First (avoid stale index.html after updates)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone()).catch(err => {
                console.warn('[Service Worker] Failed to cache navigation:', err);
              });
              return response;
            });
          }
          return response;
        })
        .catch((error) => {
          console.warn('[Service Worker] Navigation request failed, using cached shell', error);
          return caches.match('/index.html').then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cached version, return a simple offline page
            return new Response(
              '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title></head><body style="font-family:system-ui;text-align:center;padding:50px"><h1>⚠️ Offline</h1><p>Please check your internet connection and reload.</p><button onclick="location.reload()" style="padding:10px 20px;font-size:16px;cursor:pointer">Reload</button></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // A. API-Anfragen (Open-Meteo & Brightsky) -> Network First
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('brightsky.dev')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request.url, response.clone()).catch(err => {
                console.warn('[Service Worker] Failed to cache API response:', err);
              });
              return response;
            });
          }
          return response;
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
      // If we have a cached response, return it immediately and update in background
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone()).catch(err => {
                console.warn('[Service Worker] Failed to cache static resource:', err);
              });
            });
          }
        }).catch(err => {
          console.warn('[Service Worker] Background fetch failed for:', event.request.url, err);
        });
        return cachedResponse;
      }
      
      // No cached response, try network
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()).catch(err => {
              console.warn('[Service Worker] Failed to cache static resource:', err);
            });
          });
        }
        return networkResponse;
      }).catch(err => {
        console.error('[Service Worker] Fetch failed for:', event.request.url, err);
        // Both cache and network failed, return error response
        return new Response('Resource unavailable', { 
          status: 503, 
          statusText: 'Service Unavailable' 
        });
      });
    })
  );
});
