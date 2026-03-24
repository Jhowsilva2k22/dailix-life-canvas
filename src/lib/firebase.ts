import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC2P9uDIqmWhuIYff-KDrg4zM37jbQLGtw",
  authDomain: "dailix-notification.firebaseapp.com",
  projectId: "dailix-notification",
  storageBucket: "dailix-notification.firebasestorage.app",
  messagingSenderId: "1068232953165",
  appId: "1:1068232953165:web:d7e4670d3c4fabe4abbb04",
  measurementId: "G-W7LKEJ5MCR",
};

const FCM_VAPID_KEY = "BMUE-MEc8uACoo6jxD0RiRBLT3Q-Sn36k6mlskePnWu3L8oCp9SsFZWbxrEUrWL1sjXhWB3Nml251MEqU2ddC5c";

const app = initializeApp(firebaseConfig);

let messagingInstance: Messaging | null = null;

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported();
  if (!supported) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export async function getFCMToken(): Promise<string | null> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    const registration =
      (await navigator.serviceWorker.getRegistration("/")) ||
      (await navigator.serviceWorker.ready);

    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (e) {
    console.error("[FCM] Error getting token:", e);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
  if (!messagingInstance) return null;
  const unsub = onMessage(messagingInstance, callback);
  return unsub;
}
