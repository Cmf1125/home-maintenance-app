// Minimal Service Worker for PWA compliance
// This is intentionally basic to avoid breaking existing functionality

const CACHE_NAME = 'home-keeper-v5';

// Only cache essential files - avoid caching dynamic content
const urlsToCache = [
  '/',
  '/styles.css',
  '/calendar.css',
  '/enhanced-styles.css',
  '/clean-layout.css'
];

self.addEventListener('install', function(event) {
  console.log('🔧 Service worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Service worker caching essential files');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('⚠️ Service worker cache failed:', error);
        // Don't block installation if caching fails
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Only handle GET requests for same origin
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
        .catch(function() {
          // If both cache and network fail, just let it fail gracefully
          return fetch(event.request);
        })
    );
  }
});

console.log('✅ Service worker loaded - minimal implementation for PWA compliance');