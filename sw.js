const CACHE_NAME = 'student-data-v22-auto-load'; // Bumped to v22 to force update on all devices

const urlsToCache = [
  './',
  './index.html',
  './admin_apanel.html',
  './portal.html',
  './manifest.json',

  // Fonts and Backgrounds cached for completely offline preview generation
  './OdiaFont.ttf',
  './background.png',
  './eng_background.png',

  // Images 
  './icon-192.png',
  './icon-512.png',

  // External Libraries (Cached for Offline Use)
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.15.0/firebase-storage-compat.js', 
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Forces the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache v22');
        return cache.addAll(urlsToCache);
      })
  );
});

// Dynamic Network-First fallback so bugs get patched on users' phones immediately
self.addEventListener('fetch', event => {
  const req = event.request;

  // Use Network-First for HTML files (gets bug fixes instantly)
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(networkResponse => {
           const responseClone = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(req, responseClone));
           return networkResponse;
        })
        .catch(() => {
           // If completely offline, fall back to the cached HTML
           return caches.match(req);
        })
    );
  } else {
    // For all other assets (JS, Images, Fonts), keep Cache-First for speed and offline capabilities
    event.respondWith(
      caches.match(req).then(cachedResponse => {
        if (cachedResponse) {
            return cachedResponse;
        }
        return fetch(req);
      })
    );
  }
});

self.addEventListener('activate', event => {
  // Take control of all open pages immediately
  event.waitUntil(clients.claim());
  
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
