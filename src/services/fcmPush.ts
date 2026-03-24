/**
 * FCM Push — salva token FCM no backend vinculado ao usuário.
 * Camada isolada, opera em paralelo com o web-push VAPID existente.
 */
import { supabase } from "@/integrations/supabase/client";
import { getFCMToken } from "@/lib/firebase";

function detectPlatform(): string {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac/i.test(ua)) return "macos";
  if (/Linux/i.test(ua)) return "linux";
  return "unknown";
}

export async function registerFCMToken(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Permissão negada" };
    }

    const token = await getFCMToken();
    if (!token) {
      return { success: false, error: "Não foi possível obter token FCM" };
    }

    const { error } = await supabase.from("push_subscriptions" as any).upsert(
      {
        user_id: userId,
        endpoint: `fcm::${token}`,
        p256dh: "fcm",
        auth: "fcm",
        device_platform: detectPlatform(),
        device_label: navigator.userAgent.slice(0, 100),
        is_active: true,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) {
      console.error("[FCM] Error saving token:", error);
      return { success: false, error: "Erro ao salvar token" };
    }

    return { success: true };
  } catch (e: any) {
    console.error("[FCM] Registration error:", e);
    return { success: false, error: e?.message || "Erro desconhecido" };
  }
}

export async function unregisterFCMToken(userId: string): Promise<boolean> {
  try {
    const token = await getFCMToken();
    if (!token) return true;

    await supabase
      .from("push_subscriptions" as any)
      .update({ is_active: false, updated_at: new Date().toISOString() } as any)
      .eq("user_id", userId)
      .eq("endpoint", `fcm::${token}`);

    return true;
  } catch {
    return false;
  }
}
