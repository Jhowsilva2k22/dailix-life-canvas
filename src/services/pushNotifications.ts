/**
 * Web Push subscription service for Dailix V1.
 */
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = "BFGmLaE_bjGguvgRdghUUkSEjuBUgrJADGJ-jSwQMEdzpgzxQrgYZ-OnR8QNjJmCOxROAeCb47XrNHt61SJ9f8w";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export type PushState = "granted" | "denied" | "default" | "unsupported" | "no-sw";

export function getPushSupport(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export function getPushPermission(): PushState {
  if (!getPushSupport()) return typeof navigator !== "undefined" && "serviceWorker" in navigator ? "unsupported" : "no-sw";
  return Notification.permission as PushState;
}

export function isIOSWithoutPWA(): boolean {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isStandalone = (window.navigator as any).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  return isIOS && !isStandalone;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function subscribeToPush(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const reg = await registerServiceWorker();
    if (!reg) return { success: false, error: "Service Worker indisponível" };

    const permission = Notification.permission;
    if (permission !== "granted") {
      console.warn("[VAPID] Permission not granted:", permission);
      return { success: false, error: `Permissão: ${permission}` };
    }

    console.log("[VAPID] Subscribing to push manager...");
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
    });

    const key = sub.getKey("p256dh");
    const auth = sub.getKey("auth");
    if (!key || !auth) return { success: false, error: "Chaves de push inválidas" };

    const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)));
    const authKey = btoa(String.fromCharCode(...new Uint8Array(auth)));

    const platform = detectPlatform();

    const { error } = await supabase.from("push_subscriptions" as any).upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: p256dh,
        auth: authKey,
        device_platform: platform,
        device_label: navigator.userAgent.slice(0, 100),
        is_active: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) return { success: false, error: "Erro ao salvar subscription" };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Erro desconhecido" };
  }
}

export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await supabase
        .from("push_subscriptions" as any)
        .update({ is_active: false, updated_at: new Date().toISOString() } as any)
        .eq("user_id", userId)
        .eq("endpoint", sub.endpoint);
    }
    return true;
  } catch {
    return false;
  }
}

export async function getActiveSubscription(): Promise<PushSubscription | null> {
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

function detectPlatform(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "macos";
  if (/Linux/i.test(ua)) return "linux";
  return "unknown";
}
