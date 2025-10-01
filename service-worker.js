const CACHE_NAME = 'calendario-treino-v2'; // Nome do cache atualizado
const urlsToCache = [
    '/app-treino/',
    '/app-treino/index.html',
    '/app-treino/style.css',
    '/app-treino/script.js',
    '/app-treino/manifest.json',
    '/app-treino/images/icon-192x192.png',
    '/app-treino/images/icon-512x512.png'
];

// Instala o Service Worker e armazena os arquivos em cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercepta as requisições e serve os arquivos do cache se estiver offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se encontrar no cache, retorna do cache
                if (response) {
                    return response;
                }
                // Senão, busca na rede
                return fetch(event.request);
            })
    );
});

// Limpa caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});