// Service Worker for PWA functionality
const CACHE_NAME = 'taskflow-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Fetch from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return from cache if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the response for future use
            if (event.request.method === 'GET' &&
                event.request.url.startsWith(self.location.origin)) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail, return offline page
            return caches.match('/offline.html');
          });
      })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-operations') {
    event.waitUntil(syncOfflineOperations());
  }
});

async function syncOfflineOperations() {
  const offlineOperations = await getOfflineOperations();
  if (offlineOperations.length === 0) return;

  try {
    const response = await fetch('/api/offline/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offlineOperations),
    });

    if (response.ok) {
      await clearOfflineOperations();
      // Show notification
      self.registration.showNotification('Sync Complete', {
        body: 'Your offline changes have been synced!',
        icon: '/icons/icon-192x192.png',
      });
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

async function getOfflineOperations() {
  // In a real implementation, this would get data from IndexedDB
  return JSON.parse(localStorage.getItem('offlineOperations') || '[]');
}

async function clearOfflineOperations() {
  // In a real implementation, this would clear IndexedDB
  localStorage.removeItem('offlineOperations');
}

// Push notification handling
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    data: {
      url: data.url,
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  }
});