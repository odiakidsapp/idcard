const CACHE_NAME = 'student-data-v21-source-separation'; // Bumped to v21 to force update on all devices

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
        console.log('Opened cache v21');
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
```eof

### How this forces the update:
By changing `CACHE_NAME` to `v21`, the browser detects a change in the Service Worker file. When that happens:
1. It downloads the new `v21` Service Worker.
2. `self.skipWaiting()` forces the new Service Worker to activate immediately.
3. `clients.claim()` forces the new Service Worker to take control of the currently open app on the user's phone.
4. The `activate` event deletes the old `v20` cache completely.
5. The field user will see the "A new version is available!" blue banner drop down from the top of their screen, prompting them to hit "Refresh Now", which will pull the perfectly fixed `index.html` file!
