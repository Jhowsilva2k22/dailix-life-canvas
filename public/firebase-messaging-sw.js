/* Firebase Cloud Messaging Service Worker — Dailix */
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
