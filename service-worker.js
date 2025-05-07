// Version 1.1 - Added calendar transition and language switcher functionality.
// Version 1.6 - User mentioned previously
// Version 1.7 - Added Gun.js, SEA.js, and Chart.js for P2P Log app
const CACHE_NAME = 'pioneer-log-cache-v1.7'; // Incremented for new libraries

const urlsToCache = [
  './', // Cache the root path
  './index.html', // Cache the main HTML file
  './manifest.json', // Cache the PWA manifest
  './translations.json', // Cache the translations file

  // Icons
  './icon-192x192.png', // Adjusted path if icons are in the root like manifest
  './icons/icon-192x192.png', // Keeping original if path varies
  './icons/icon-512x512.png',

  // External JS libraries (NEW)
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/gun/gun.js',
  'https://cdn.jsdelivr.net/npm/gun/sea.js', // For Gun security/encryption module

  // External CSS resources (Fonts, Icons from previous script, if still used)
  // Note: The Pioneer Log HTML didn't explicitly include Inter or FontAwesome.
  // If they are used, uncomment and ensure paths are correct.
  // 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  // 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css',
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  console.log(`Service Worker: Instalando (${CACHE_NAME})...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`Service Worker (${CACHE_NAME}): Cache aberto, adicionando arquivos principais:`, urlsToCache);
        const cachePromises = urlsToCache.map(urlToCache => {
            return fetch(new Request(urlToCache, { cache: 'no-cache' })) // Fetch fresh
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Falha ao buscar ${urlToCache}: ${response.status} ${response.statusText}`);
                    }
                    return cache.put(urlToCache, response);
                })
                .catch(err => {
                    console.error(`Service Worker (${CACHE_NAME}): Falha ao adicionar ${urlToCache} ao cache na instalação:`, err);
                    // throw err; // Uncomment to make install fail if any *critical* asset fails
                });
        });
        return Promise.all(cachePromises.map(p => p.catch(e => e))); // Allow install even if some non-critical fail (but log error)
      })
      .then(() => {
        console.log(`Service Worker (${CACHE_NAME}): Arquivos principais cacheados (ou falhas tratadas).`);
        return self.skipWaiting();
      })
      .catch(error => {
        console.error(`Service Worker (${CACHE_NAME}): Falha geral ao cachear arquivos na instalação. Erro:`, error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker: Ativando (${CACHE_NAME})...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker (${CACHE_NAME}): Removendo cache antigo:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`Service Worker (${CACHE_NAME}): Ativado e caches antigos removidos.`);
      return self.clients.claim();
    })
  );
});

// Fetch event: Serve from cache, fallback to network, cache new requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Check if the request URL is one of the core assets.
  // For URLs with query parameters (like fonts.googleapis.com), matching the base URL is often sufficient.
  const isPrecached = urlsToCache.some(cachedUrl => {
    // Simple check for local files by ending.
    if (cachedUrl.startsWith('./')) {
        return event.request.url.endsWith(cachedUrl.substring(1)); // Match /index.html, not just index.html
    }
    // For external URLs, check if the request URL starts with the cached URL.
    // This handles cases where CDN URLs might have query strings not included in urlsToCache.
    return event.request.url.startsWith(cachedUrl);
  });


  if (isPrecached) {
      event.respondWith(
          caches.match(event.request)
              .then((cachedResponse) => {
                  if (cachedResponse) {
                      return cachedResponse;
                  }
                  return fetch(event.request).then(networkResponse => {
                      if (networkResponse && networkResponse.ok) {
                          const responseToCache = networkResponse.clone();
                          caches.open(CACHE_NAME).then(cache => {
                              cache.put(event.request, responseToCache);
                          });
                      }
                      return networkResponse;
                  });
              })
              .catch(error => {
                  console.error(`SW (${CACHE_NAME}): Erro ao buscar (pré-cacheado): ${event.request.url}`, error);
                  // Potentially return a fallback for critical assets if fetch fails completely
              })
      );
  } else {
      event.respondWith(
          fetch(event.request)
              .then((networkResponse) => {
                  if (networkResponse && networkResponse.ok) {
                    // For non-precached assets, clone and cache them as they are requested.
                    // This helps build up the cache for dynamic content or less critical assets.
                      const responseToCache = networkResponse.clone();
                      caches.open(CACHE_NAME)
                          .then((cache) => {
                              cache.put(event.request, responseToCache);
                          });
                  }
                  return networkResponse;
              })
              .catch(() => {
                  return caches.match(event.request)
                      .then(cachedResponse => {
                          if (cachedResponse) {
                              return cachedResponse;
                          }
                          console.warn(`SW (${CACHE_NAME}): Sem cache e sem rede para: ${event.request.url}`);
                          return new Response("Network error and no cache available.", {
                              status: 404,
                              statusText: "Not Found",
                              headers: { 'Content-Type': 'text/plain' }
                          });
                      });
              })
      );
  }
});
