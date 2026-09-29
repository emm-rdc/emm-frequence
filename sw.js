const CACHE_NAME = 'emm-vf-v2';
const URLS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './db.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Installation : mise en cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS).catch(function(err) {
        console.log('Cache addAll error:', err);
        // Essaie d'ajouter un par un pour ne pas tout rater
        return Promise.all(URLS.map(function(url) {
          return cache.add(url).catch(function(e) { console.log('Skip:', url); });
        }));
      });
    })
  );
  self.skipWaiting();
});

// Activation : supprimer anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch : servir depuis le cache si possible
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Mettre en cache la nouvelle ressource
        if (response && response.status === 200 && event.request.method === 'GET') {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(function() {
        // Fallback : retour à index.html si dispo
        return caches.match('./index.html');
      });
    })
  );
});