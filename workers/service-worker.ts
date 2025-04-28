/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="es2015" />

const CACHE_VERSION = '1';

const URLS_TO_CACHE = [
  '/',
  '/api/referenciales'
] as const;

// Asignamos el valor a la variable global CACHE_NAME
(self as any).CACHE_NAME = `referenciales-cache-v${CACHE_VERSION}`;


self.addEventListener('fetch', ((event: FetchEvent) => {
  if (event.request.url.includes('/api/referenciales')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(event.request.clone());
          if (networkResponse.ok) {
            await cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
          throw new Error('Respuesta de red no válida');
        } catch (error) {
          console.error('Error en fetch:', error);
          const cachedResponse = await cache.match(event.request);
          if (!cachedResponse) {
            return new Response('No hay datos disponibles', {
              status: 404,
              statusText: 'Not Found',
              headers: {
                'Content-Type': 'text/plain',
              },
            });
          }
          return cachedResponse;
        }
      })()
    );
  }
}) as EventListener);

self.addEventListener('install', ((event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[Service Worker] Caching app shell');
      await cache.addAll([...URLS_TO_CACHE]); // <-- Añade [... ] alrededor de URLS_TO_CACHE
      await (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
    })()
  );
}) as EventListener);

self.addEventListener('activate', ((event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const deletions = cacheKeys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key));
      
      await Promise.all(deletions);
      await (self as unknown as ServiceWorkerGlobalScope).clients.claim();
      
      console.log('[Service Worker] Activado y controlando clientes');
    })()
  );
}) as EventListener);