// GA Forms System — Service Worker
// Caches core files so the inspection form works without internet signal
// Robert Quinn Ltd © 2026

const CACHE_NAME = 'ga-forms-v1';
const CORE_FILES = [
  './',
  './form.html',
  './login.html',
  './js/data.js',
  './js/auth.js',
  './js/ui.js',
  './js/firebase-config.js',
  './js/firebase.js',
  './js/offline.js',
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap'
];

// Install: cache all core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can, ignore failures (e.g. Google Fonts on first offline install)
      return Promise.allSettled(CORE_FILES.map(url => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache with network fallback (cache-first for app shell)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Don't intercept Firebase API calls — let them go to network
  if (url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // For HTML/JS/CSS: cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses for our domain
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./form.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
