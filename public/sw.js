// Service Worker para Sitio Automotor PWA
// Garantiza inicio instantáneo en modo standalone y arranque sin cuelgues de splash screen

const CACHE_NAME = 'sa-pwa-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/logo.png',
  '/logofrase.png',
  '/favicon.ico',
  '/favicon-48x48.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
];

// Instalación: Precachear assets críticos de la shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial fallback:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpiar caches obsoletos y tomar control inmediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch:
// - Peticiones de navegación (HTML shell): Network-first con fallback a cache inmediato
// - Assets estáticos: Stale-while-revalidate
// - Peticiones a APIs externas (Supabase, Mercado Pago, etc.): Network directo sin cache
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignorar métodos no GET
  if (request.method !== 'GET') return;

  // Ignorar llamadas a Supabase, Mercado Pago u orígenes de terceros dinámicos
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('mercadopago') ||
    url.pathname.startsWith('/api/') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // 1. Navegación (HTML de inicio de la PWA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Si falla la red o está offline, responder inmediatamente con el shell cacheado
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = (await cache.match('/')) || (await cache.match('/index.html'));
          return cachedIndex || Response.error();
        })
    );
    return;
  }

  // 2. Assets estáticos del mismo origen (CSS, JS, imágenes locales)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        }).catch(() => {
          // Error de red ignorado para assets en background
        });

        // Retornar de inmediato el cache si existe, o esperar a la red
        return cachedResponse || fetchPromise;
      })
    );
  }
});
