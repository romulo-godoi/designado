const CACHE_NAME = 'jw-assignments-cache-v1.0';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './translations.json',
  './icon-192x192.png',
  './icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css',
];

self.addEventListener('install', (event) => {
  console.log(`Service Worker: Instalando (${CACHE_NAME})...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`Service Worker (${CACHE_NAME}): Cache aberto, adicionando arquivos principais:`, urlsToCache);
        const cachePromises = urlsToCache.map(urlToCache => {
             return fetch(new Request(urlToCache, { cache: 'reload' }))
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Falha ao buscar ${urlToCache}: ${response.status} ${response.statusText}`);
                    }
                    return cache.put(urlToCache, response);
                })
                .catch(err => {
                     console.error(`Service Worker (${CACHE_NAME}): Falha ao adicionar ${urlToCache} ao cache na instalação:`, err);
                     throw err;
                });
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        console.log(`Service Worker (${CACHE_NAME}): Arquivos principais cacheados com sucesso.`);
        return self.skipWaiting();
      })
      .catch(error => {
        console.error(`Service Worker (${CACHE_NAME}): Falha geral ao cachear arquivos na instalação. Verifique todos os URLs em urlsToCache e sua conexão. Erro:`, error);
      })
  );
});

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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
            (networkResponse) => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();

                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });

                return networkResponse;
            }
        ).catch(error => {
            console.error(`SW (${CACHE_NAME}): Fetch falhou (provavelmente offline e sem cache):`, error, event.request.url);
        });
      })
  );
});
