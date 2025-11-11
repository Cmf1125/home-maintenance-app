// Robust Service Worker with automatic error recovery and cache management
const CACHE_VERSION = `${Date.now()}-vendor-fix`; // Use timestamp for automatic versioning
const CACHE_NAME = `home-keeper-v${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Essential files that should be cached
const STATIC_ASSETS = [
  '/',
  '/styles.css',
  '/calendar.css', 
  '/enhanced-styles.css',
  '/clean-layout.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting(); // Force immediate activation
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any cache that doesn't match our current version
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
      .catch((error) => {
        console.error('[SW] Fetch failed:', error);
        // Return a fallback response for critical failures
        if (request.mode === 'navigate') {
          return caches.match('/') || new Response('App temporarily unavailable', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        throw error;
      })
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // For HTML pages and JavaScript files, always try network first to get fresh content
  if (request.mode === 'navigate' || 
      url.pathname.endsWith('.html') || 
      url.pathname.endsWith('.js') ||
      url.pathname === '/') {
    try {
      console.log('[SW] Network-first for:', url.pathname);
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      throw new Error('Network response not ok');
    } catch (error) {
      console.log('[SW] Network failed, trying cache for:', url.pathname);
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }
  
  // For CSS and other assets, try cache first, then network
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map(cache => caches.delete(cache)));
      }).then(() => {
        console.log('[SW] All caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] Service worker script loaded');