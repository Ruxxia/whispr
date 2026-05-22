self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Passthrough fetch handler to satisfy PWA criteria while keeping SSR dynamic
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('You are offline. Please reconnect to access Whispr.', {
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});
