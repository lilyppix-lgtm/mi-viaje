const CACHE = 'viaje-v3';
const ASSETS = [
  '/mi-viaje/',
  '/mi-viaje/index.html',
  '/mi-viaje/manifest.json',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/fonts/tabler-icons.woff2'
];

// Instalar y cachear recursos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activar y limpiar cachés viejas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: red primero, caché como fallback
self.addEventListener('fetch', e => {
  // Solo interceptar GET
  if (e.request.method !== 'GET') return;
  // No interceptar Firebase (necesita conexión real)
  if (e.request.url.includes('firebasedatabase') || e.request.url.includes('firebaseio')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Guardar copia fresca en caché
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
