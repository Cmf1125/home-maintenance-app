// Firebase Cloud Messaging Service Worker
// This file handles push notifications when the app is in the background

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBuBfJvkhiTs0OSFlNE8ZhSTAnOa_sidE0",
  authDomain: "home-keeper-app.firebaseapp.com",
  projectId: "home-keeper-app",
  storageBucket: "home-keeper-app.firebasestorage.app",
  messagingSenderId: "434638918453",
  appId: "1:434638918453:web:5fd99aed69ef4a4c2b727c"
});

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'The Home Keeper';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a maintenance reminder',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'home-keeper-notification',
    requireInteraction: true,
    data: {
      url: payload.data?.url || '/',
      taskId: payload.data?.taskId || null,
      type: payload.data?.type || 'reminder'
    },
    actions: [
      {
        action: 'view',
        title: 'View Tasks',
        icon: '/icon-192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app and navigate to tasks
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification.tag);
});

console.log('[firebase-messaging-sw.js] Service worker loaded');