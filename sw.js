importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');

// Bumping to v41 to force users to download the latest index.html updates without messaging logic
const CACHE_NAME = 'student-data-v41-private-schools'; 

const urlsToCache = [
  './',
  './index.html',
  './admin_apanel.html', 
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
        urlsToCache.forEach(url => {
            cache.add(url).catch(err => console.warn('Cache skip:', url));
        });
    })
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Only cache GET requests
  if (req.method !== 'GET') return;
  
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  // Delete old caches to free up space and ensure latest files are used
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});
