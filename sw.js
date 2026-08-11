// Add these imports to the VERY TOP of the file (Line 1)
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC76wT0RbwuLGbhp0mU7kje25g-xxydLqU",
    authDomain: "idcard-60586.firebaseapp.com",
    projectId: "idcard-60586",
    storageBucket: "idcard-60586.firebasestorage.app",
    messagingSenderId: "331979663377",
    appId: "1:331979663377:web:026e537a7fcaca813129b0"
});

const messaging = firebase.messaging();

const CACHE_NAME = 'student-data-v37-auto-load-update'; // Bumped to v35

const urlsToCache = [
  './',
  './index.html',
  './app.html', 
  './admin_apanel.html', 
  './manifest.json',
  './OdiaFont.ttf',
  './background.png',
  './eng_background.png',
  './icon-192.png',
  './icon-512.png',
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
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('Opened cache v35');
        // Cache files one by one so a single missing file doesn't crash the worker
        for (let url of urlsToCache) {
          try {
            await cache.add(url);
          } catch (err) {
            console.warn('Could not cache file (skipping):', url, err);
          }
        }
      })
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(networkResponse => {
           const responseClone = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(req, responseClone));
           return networkResponse;
        })
        .catch(() => {
           return caches.match(req);
        })
    );
  } else {
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
  event.waitUntil(clients.claim());
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

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || 'ID Cards Pro';
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icon-192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
