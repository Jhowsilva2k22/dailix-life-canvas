import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Smartphone, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPushSupport,
  getPushPermission,
  isIOSWithoutPWA,
  subscribeToPush,
  unsubscribeFromPush,
  getActiveSubscription,
} from "@/services/pushNotifications";
import { registerFCMToken, unregisterFCMToken } from "@/services/fcmPush";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotificationSoftAskModal from "./NotificationSoftAskModal";
import NotificationDeniedModal from "./NotificationDeniedModal";

type FinalPushState = "loading" | "active" | "inactive" | "syncing" | "denied" | "unsupported" | "ios-pwa";

const PushNotificationToggle = () => {
  const { user } = useAuth();
  const [state, setState] = useState<FinalPushState>("loading");
  const [busy, setBusy] = useState(false);
  const [showSoftAsk, setShowSoftAsk] = useState(false);
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    detectState();
  }, [user]);

  const detectState = async () => {
    if (!getPushSupport()) {
      setState(isIOSWithoutPWA() ? "ios-pwa" : "unsupported");
      return;
    }

    const perm = getPushPermission();
    if (perm === "denied") {
      setState("denied");
      return;
    }

    // Check VAPID subscription locally
    const vapidSub = await getActiveSubscription();
    const vapidActive = !!vapidSub;

    // Check any active subscription in DB (covers FCM tokens too)
    let dbActive = false;
    if (user) {
      try {
        const { data } = await supabase
          .from("push_subscriptions")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .limit(1);
        dbActive = !!data && data.length > 0;
      } catch {}
    }

    if (vapidActive || dbActive) {
      setState("active");
    } else {
      setState("inactive");
    }
  };

  const handleEnableClick = () => {
    if (!user || busy) return;
    const perm = getPushPermission();
    if (perm === "denied") {
      setShowDenied(true);
      return;
    }
    if (perm === "granted") {
      doEnable();
    } else {
      setShowSoftAsk(true);
    }
  };

  const doEnable = async () => {
    if (!user) return;
    setBusy(true);
    setState("syncing");

    const [vapidResult, fcmResult] = await Promise.allSettled([
      subscribeToPush(user.id),
      registerFCMToken(user.id),
    ]);
    const vapidOk = vapidResult.status === "fulfilled" && vapidResult.value.success;
    const fcmOk = fcmResult.status === "fulfilled" && fcmResult.value.success;

    if (vapidOk || fcmOk) {
      setState("active");
      toast.success("Notificações ativadas");
    } else {
      const errorMsg = vapidResult.status === "fulfilled" ? vapidResult.value.error : "Erro";
      if (errorMsg === "Permissão negada") {
        setState("denied");
        setShowDenied(true);
      } else {
        setState("inactive");
        toast.error(errorMsg || "Erro ao ativar notificações");
      }
    }
    setBusy(false);
  };

  const handleSoftAskContinue = async () => {
    setShowSoftAsk(false);
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      doEnable();
    } else if (permission === "denied") {
      setState("denied");
      setShowDenied(true);
    }
  };

  const handleDisable = async () => {
    if (!user || busy) return;
    setBusy(true);
    await Promise.allSettled([
      unsubscribeFromPush(user.id),
      unregisterFCMToken(user.id),
    ]);
    setState("inactive");
    toast.success("Notificações desativadas");
    setBusy(false);
  };

  // --- Render ---

  if (state === "loading") {
    return (
      <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <div className="flex items-center gap-3">
          <Loader2 size={16} className="animate-spin" style={{ color: "var(--dash-text-muted)" }} />
          <span style={{ color: "var(--dash-text-muted)", fontSize: 13 }}>Verificando suporte a notificações…</span>
        </div>
      </div>
    );
  }

  if (state === "ios-pwa") {
    return (
      <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <div className="flex items-start gap-3">
          <Smartphone size={18} style={{ color: "var(--dash-warning-text)", marginTop: 2 }} />
          <div>
            <p style={{ color: "var(--dash-text)", fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
              Instale o Dailix na Tela de Início
            </p>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 12, lineHeight: 1.5 }}>
              Para receber notificações no iPhone/iPad, adicione o Dailix à Tela de Início:
              toque em <strong style={{ color: "var(--dash-text-secondary)" }}>Compartilhar</strong> → <strong style={{ color: "var(--dash-text-secondary)" }}>Tela de Início</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "unsupported") {
    return (
      <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <div className="flex items-center gap-3">
          <BellOff size={16} style={{ color: "var(--dash-text-muted)" }} />
          <span style={{ color: "var(--dash-text-muted)", fontSize: 13 }}>Seu dispositivo não oferece suporte a notificações</span>
        </div>
      </div>
    );
  }

  // Status label
  const statusLabel =
    state === "active" ? "Notificações ativas" :
    state === "syncing" ? "Ativando notificações..." :
    state === "denied" ? "Permissão bloqueada" :
    "Notificações desativadas";

  // Icon
  const icon =
    state === "active" ? <BellRing size={16} style={{ color: "var(--dash-success-text)" }} /> :
    state === "syncing" ? <Loader2 size={16} className="animate-spin" style={{ color: "var(--dash-accent)" }} /> :
    state === "denied" ? <BellOff size={16} style={{ color: "var(--dash-danger-text)" }} /> :
    <Bell size={16} style={{ color: "var(--dash-text-muted)" }} />;

  // Button
  const buttonLabel =
    busy && state !== "syncing" ? <Loader2 size={14} className="animate-spin" /> :
    state === "active" ? "Desativar notificações" :
    state === "syncing" ? "Ativando..." :
    state === "denied" ? "Ver como ativar" :
    "Ativar notificações";

  const buttonDisabled = busy || state === "syncing";

  const borderColor =
    state === "active" ? "var(--dash-border-strong)" :
    state === "denied" ? "var(--dash-danger-text)" :
    "var(--dash-accent)";

  const bgColor =
    state === "active" ? "transparent" :
    state === "denied" ? "var(--dash-danger-bg)" :
    "var(--dash-accent-subtle)";

  const textColor =
    state === "active" ? "var(--dash-text-muted)" :
    state === "denied" ? "var(--dash-danger-text)" :
    "var(--dash-accent)";

  const handleButtonClick = () => {
    if (state === "active") handleDisable();
    else if (state === "denied") setShowDenied(true);
    else handleEnableClick();
  };

  return (
    <>
      <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <p className="mb-3" style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Notificações push
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <span style={{ color: "var(--dash-text)", fontSize: 14 }}>{statusLabel}</span>
          </div>
          <button
            onClick={handleButtonClick}
            disabled={buttonDisabled}
            className="text-sm px-4 py-2 rounded-lg transition-all duration-150 disabled:opacity-50"
            style={{
              border: `1px solid ${borderColor}`,
              background: bgColor,
              color: textColor,
              fontWeight: 400,
            }}
          >
            {buttonLabel}
          </button>
        </div>
        {state === "active" && (
          <p style={{ color: "var(--dash-text-muted)", fontSize: 11, marginTop: 8 }}>
            Você receberá lembretes mesmo com o app fechado
          </p>
        )}
      </div>

      {showSoftAsk && (
        <NotificationSoftAskModal
          onContinue={handleSoftAskContinue}
          onDismiss={() => setShowSoftAsk(false)}
        />
      )}
      {showDenied && (
        <NotificationDeniedModal onClose={() => setShowDenied(false)} />
      )}
    </>
  );
};

export default PushNotificationToggle;
