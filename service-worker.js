const cacheName = 'myflix-cache-v2';
const assets = [
  './',
  './index.html',
  './details.html',
  './settings.html',
  './styles.css',
  './script.js',
  './details.js',
  './themes.js',
  './manifest.json',
  './assets/logo.png',
  './assets/favicon.ico',
  './assets/placeholder.jpg',
  './assets/icon-192x192.png',
  './assets/icon-512x512.png'
];

// Install-Event: Dateien cachen
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(assets);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate-Event: Alten Cache löschen
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch-Event: Caching-Strategie
self.addEventListener('fetch', (event) => {
  // Bei API-Anfragen: Netzwerk zuerst, dann Cache
  if (event.request.url.includes('api.themoviedb.org')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          let responseClone = response.clone();
          caches.open(cacheName).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Für andere Anfragen: Cache-first, dann Netzwerk
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          let responseClone = fetchResponse.clone();
          caches.open(cacheName).then(cache => {
            cache.put(event.request, responseClone);
          });
          return fetchResponse;
        });
      }).catch(() => {
        // Fallback für HTML-Anfragen:
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('./index.html');
        }
      })
    );
  }
});
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log("Service Worker erfolgreich registriert!"))
      .catch(error => console.error("Fehler bei der Registrierung:", error));
  }
  