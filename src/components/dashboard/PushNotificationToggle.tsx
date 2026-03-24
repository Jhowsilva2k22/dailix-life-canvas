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
import { getFCMToken } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotificationSoftAskModal from "./NotificationSoftAskModal";
import NotificationDeniedModal from "./NotificationDeniedModal";

type FinalPushState =
  | "loading"
  | "active"
  | "inactive"
  | "syncing"
  | "inactive-with-permission"
  | "denied"
  | "unsupported"
  | "ios-pwa";

const PushNotificationToggle = () => {
  const { user } = useAuth();
  const [state, setState] = useState<FinalPushState>("loading");
  const [busy, setBusy] = useState(false);
  const [showSoftAsk, setShowSoftAsk] = useState(false);
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    detectState();

    const recheck = () => {
      if (document.visibilityState === "visible") detectState();
    };
    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("focus", recheck);
    return () => {
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("focus", recheck);
    };
  }, [user]);

  const detectState = async () => {
    if (!getPushSupport()) {
      setState(isIOSWithoutPWA() ? "ios-pwa" : "unsupported");
      return;
    }

    const permissionStatus = getPushPermission();

    if (permissionStatus === "denied") {
      setState("denied");
      return;
    }

    const vapidSubscription = await getActiveSubscription();
    const vapidSubscriptionStatus = !!vapidSubscription;

    let fcmTokenStatus = false;

    if (user && permissionStatus === "granted") {
      try {
        const currentFcmToken = await getFCMToken();

        if (currentFcmToken) {
          const { data } = await supabase
            .from("push_subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .eq("endpoint", `fcm::${currentFcmToken}`)
            .eq("is_active", true)
            .limit(1);

          fcmTokenStatus = !!data?.length;
        }
      } catch {
        fcmTokenStatus = false;
      }
    }

    if (vapidSubscriptionStatus || fcmTokenStatus) {
      setState("active");
      return;
    }

    if (permissionStatus === "granted") {
      setState("inactive-with-permission");
      return;
    }

    setState("inactive");
  };

  const handleEnableClick = () => {
    if (!user || busy) return;

    const permissionStatus = getPushPermission();

    if (permissionStatus === "denied") {
      setShowDenied(true);
      return;
    }

    if (permissionStatus === "granted") {
      doEnable();
      return;
    }

    setShowSoftAsk(true);
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
    const permission = Notification.permission;

    if (vapidOk || fcmOk) {
      await detectState();
      toast.success("Notificações ativadas");
    } else {
      if (permission === "denied") {
        setState("denied");
        setShowDenied(true);
      } else if (permission === "granted") {
        setState("inactive-with-permission");
        toast.error("Permissão ativa, mas não foi possível concluir a ativação neste aparelho. Tente novamente.");
      } else {
        setState("inactive");
        toast.error("Erro ao ativar notificações");
      }

      await detectState();
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

  const statusLabel =
    state === "active"
      ? "Notificações ativas"
      : state === "syncing"
        ? "Ativando notificações..."
        : state === "inactive-with-permission"
          ? "Permissão ativa, sincronização pendente"
          : state === "denied"
            ? "Permissão bloqueada"
            : "Notificações desativadas";

  const icon =
    state === "active"
      ? <BellRing size={16} style={{ color: "var(--dash-success-text)" }} />
      : state === "syncing"
        ? <Loader2 size={16} className="animate-spin" style={{ color: "var(--dash-accent)" }} />
        : state === "denied"
          ? <BellOff size={16} style={{ color: "var(--dash-danger-text)" }} />
          : <Bell size={16} style={{ color: "var(--dash-text-muted)" }} />;

  const buttonLabel =
    state === "active"
      ? "Desativar notificações"
      : state === "syncing"
        ? "Ativando..."
        : state === "denied"
          ? "Ver como ativar"
          : "Ativar notificações";

  const buttonDisabled = busy || state === "syncing";

  const borderColor =
    state === "active"
      ? "var(--dash-border-strong)"
      : state === "denied"
        ? "var(--dash-danger-text)"
        : "var(--dash-accent)";

  const bgColor =
    state === "active"
      ? "transparent"
      : state === "denied"
        ? "var(--dash-danger-bg)"
        : "var(--dash-accent-subtle)";

  const textColor =
    state === "active"
      ? "var(--dash-text-muted)"
      : state === "denied"
        ? "var(--dash-danger-text)"
        : "var(--dash-accent)";

  const handleButtonClick = () => {
    if (state === "active") {
      handleDisable();
      return;
    }

    if (state === "denied") {
      setShowDenied(true);
      return;
    }

    handleEnableClick();
  };

  return (
    <>
      <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <p className="mb-3" style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Notificações push
        </p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {icon}
            <span style={{ color: "var(--dash-text)", fontSize: 14 }}>{statusLabel}</span>
          </div>
          <button
            onClick={handleButtonClick}
            disabled={buttonDisabled}
            className="text-sm px-4 py-2 rounded-lg transition-all duration-150 disabled:opacity-50 shrink-0"
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
        {state === "inactive-with-permission" && (
          <p style={{ color: "var(--dash-text-muted)", fontSize: 11, marginTop: 8 }}>
            A permissão do sistema está ativa neste aparelho, mas o canal ainda não foi confirmado
          </p>
        )}
      </div>

      {showSoftAsk && (
        <NotificationSoftAskModal
          onContinue={handleSoftAskContinue}
          onDismiss={() => setShowSoftAsk(false)}
        />
      )}
      {showDenied && <NotificationDeniedModal onClose={() => setShowDenied(false)} />}
    </>
  );
};

export default PushNotificationToggle;
