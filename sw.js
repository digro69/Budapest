/* =====================================================================
   sw.js — Service worker : rend l'application utilisable hors connexion.
   Stratégie « cache d'abord » sur les fichiers de l'application, réseau
   pour tout le reste (les liens externes ne sont jamais mis en cache).
   Incrémenter CACHE_VERSION à chaque mise à jour des fichiers.
   ===================================================================== */

const CACHE_VERSION = 'budapest-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/data.js',
  './js/store.js',
  './js/app.js',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // On ne gère que les GET de même origine : les liens externes passent au réseau.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Rafraîchissement silencieux en arrière-plan.
        fetch(request)
          .then((res) => {
            if (res && res.ok) caches.open(CACHE_VERSION).then((c) => c.put(request, res.clone()));
          })
          .catch(() => {});
        return cached;
      }
      return fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
