import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register unified service worker (VAPID + FCM)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Firebase foreground messages — show toast when app is open
import("./lib/firebase").then(async ({ getFirebaseMessaging }) => {
  const messaging = await getFirebaseMessaging();
  if (messaging) {
    const { onMessage } = await import("firebase/messaging");
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "Dailix";
      const body = payload.notification?.body || "";
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, icon: "/dailix-icon.png" });
      }
    });
  }
}).catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
