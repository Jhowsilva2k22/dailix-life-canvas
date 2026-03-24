/**
 * Notification permission & scheduling service — V1 minimal.
 *
 * Limitations (transparent to user):
 * - Notifications only fire while the app tab is open.
 * - No background push in V1.
 */

export type PermissionState = "granted" | "denied" | "default" | "unsupported";

export function getNotificationSupport(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermissionState(): PermissionState {
  if (!getNotificationSupport()) return "unsupported";
  return Notification.permission as PermissionState;
}

export async function requestPermission(): Promise<PermissionState> {
  if (!getNotificationSupport()) return "unsupported";
  const result = await Notification.requestPermission();
  return result as PermissionState;
}

export function showNotification(title: string, body: string): void {
  if (getPermissionState() !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  } catch {
    // Silent fail — some environments block Notification constructor
  }
}
