/* Dailix Unified Service Worker — Web Push (VAPID) + Firebase Cloud Messaging */

// ── Firebase SDK for background messaging ──
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC2P9uDIqmWhuIYff-KDrg4zM37jbQLGtw",
  authDomain: "dailix-notification.firebaseapp.com",
  projectId: "dailix-notification",
  storageBucket: "dailix-notification.firebasestorage.app",
  messagingSenderId: "1068232953165",
  appId: "1:1068232953165:web:d7e4670d3c4fabe4abbb04",
});

const messaging = firebase.messaging();

// FCM background messages
messaging.onBackgroundMessage((payload) => {
  const data = payload.notification || payload.data || {};
  const title = data.title || "Dailix";
  const body = data.body || "Você tem um lembrete";
  const route = (payload.data && payload.data.route) || "/dashboard";

  self.registration.showNotification(title, {
    body,
    icon: "/dailix-icon.png",
    badge: "/dailix-icon.png",
    data: { route },
    vibrate: [100, 50, 100],
  });
});

// ── VAPID Web Push (non-FCM) ──
self.addEventListener("push", (event) => {
  // Skip if this is an FCM message (handled by onBackgroundMessage above)
  if (event.data) {
    try {
      const json = event.data.json();
      // FCM wraps messages with a specific structure; VAPID messages have title directly
      if (json.firebase || json.from === "1068232953165") return;
    } catch {
      // Not JSON, treat as VAPID
    }
  }

  let data = { title: "Dailix", body: "Você tem um lembrete", route: "/dashboard" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // fallback to defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/dailix-icon.png",
      badge: "/dailix-icon.png",
      data: { route: data.route || "/dashboard" },
      vibrate: [100, 50, 100],
    })
  );
});

// ── Notification click — shared for both VAPID and FCM ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const route = event.notification.data?.route || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(route);
          return client.focus();
        }
      }
      return self.clients.openWindow(route);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
