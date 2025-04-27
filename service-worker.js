// Version 1.1 - Added calendar transition and language switcher functionality.
const CACHE_NAME = 'jw-assignments-cache-v1.5'; // Incremented version

const urlsToCache = [
  './', // Cache the root path
  './index.html', // Cache the main HTML file
  './manifest.json', // Cache the PWA manifest
  './translations.json', // Cache the translations file
  // Make sure icon paths are correct relative to the SW file
  './icons/icon-192x192.png', // Cache main icons
  './icons/icon-512x512.png',
  // External resources (fonts, icons)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css',
  // Consider adding the web font files loaded by fontawesome if needed for full offline
  // Example: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/webfonts/fa-solid-900.woff2'
  // Check network tab in dev tools to see exact font files loaded.
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  console.log(`Service Worker: Instalando (${CACHE_NAME})...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`Service Worker (${CACHE_NAME}): Cache aberto, adicionando arquivos principais:`, urlsToCache);
        // Use cache.addAll for simpler initial caching if atomic failure is acceptable
        // cache.addAll(urlsToCache)
        // Or fetch individually for better error handling:
        const cachePromises = urlsToCache.map(urlToCache => {
            // Use 'no-cache' to ensure fresh fetch during install, bypassing HTTP cache
            return fetch(new Request(urlToCache, { cache: 'no-cache' }))
                .then(response => {
                    if (!response.ok) {
                        // Don't cache non-200 responses during install
                        throw new Error(`Falha ao buscar ${urlToCache}: ${response.status} ${response.statusText}`);
                    }
                    // Cache the valid response
                    return cache.put(urlToCache, response);
                })
                .catch(err => {
                    console.error(`Service Worker (${CACHE_NAME}): Falha ao adicionar ${urlToCache} ao cache na instalação:`, err);
                    // Optionally decide if install should fail if a core asset is missing
                    // throw err; // Uncomment to make install fail if any asset fails
                });
        });
        // Use Promise.allSettled if you want the SW to install even if some non-critical assets fail
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log(`Service Worker (${CACHE_NAME}): Arquivos principais cacheados com sucesso (ou falhas ignoradas).`);
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(error => {
        // This catch block will run if caches.open fails or if an error is thrown inside cachePromises and not caught
        console.error(`Service Worker (${CACHE_NAME}): Falha geral ao cachear arquivos na instalação. Verifique todos os URLs em urlsToCache e sua conexão. Erro:`, error);
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
          // Delete any caches that aren't the current one
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker (${CACHE_NAME}): Removendo cache antigo:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`Service Worker (${CACHE_NAME}): Ativado e caches antigos removidos.`);
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// Fetch event: Serve from cache, fallback to network, cache new requests
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and requests to Chrome extensions
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Strategy: Cache first, then network for listed assets. Network first for others.
  const isPrecached = urlsToCache.some(url => event.request.url.endsWith(url.replace('./', ''))); // Basic check if it's a core asset

  if (isPrecached) {
      // Cache First for core assets
      event.respondWith(
          caches.match(event.request)
              .then((cachedResponse) => {
                  if (cachedResponse) {
                      // console.log(`SW (${CACHE_NAME}): Servindo do cache: ${event.request.url}`);
                      return cachedResponse;
                  }
                  // console.log(`SW (${CACHE_NAME}): Não encontrado no cache, buscando na rede: ${event.request.url}`);
                  // Fallback to network if not in cache (should ideally be cached during install)
                  return fetch(event.request).then(networkResponse => {
                      // Optional: Cache the response if fetched successfully (might happen if install failed partially)
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
                  // Optionally return a fallback page/response here for offline scenarios
              })
      );
  } else {
      // Network First, then Cache for dynamic/other assets
      event.respondWith(
          fetch(event.request)
              .then((networkResponse) => {
                  // Check if we received a valid response
                  if (networkResponse && networkResponse.ok) {
                      const responseToCache = networkResponse.clone();
                      caches.open(CACHE_NAME)
                          .then((cache) => {
                              // console.log(`SW (${CACHE_NAME}): Cacheando resposta da rede: ${event.request.url}`);
                              cache.put(event.request, responseToCache);
                          });
                  }
                  return networkResponse;
              })
              .catch(() => {
                  // Network failed, try to serve from cache as a fallback
                  // console.log(`SW (${CACHE_NAME}): Rede falhou, tentando cache para: ${event.request.url}`);
                  return caches.match(event.request)
                      .then(cachedResponse => {
                          if (cachedResponse) {
                              return cachedResponse;
                          }
                          // Optional: Return a generic offline fallback if nothing is cached
                          console.warn(`SW (${CACHE_NAME}): Sem cache e sem rede para: ${event.request.url}`);
                          // return caches.match('/offline.html'); // Example fallback page
                          return new Response("Network error and no cache available.", {
                              status: 404,
                              statusText: "Not Found"
                          });
                      });
              })
      );
  }
});
