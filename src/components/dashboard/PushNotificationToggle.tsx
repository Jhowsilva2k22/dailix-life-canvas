import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Smartphone, Loader2, RefreshCw } from "lucide-react";
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

type PushState = "loading" | "active" | "inactive" | "inactive-with-permission" | "denied" | "unsupported" | "ios-pwa";

const PushNotificationToggle = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushState>("loading");
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

    // Check VAPID subscription
    const vapidSub = await getActiveSubscription();
    const vapidActive = !!vapidSub;

    // Check FCM/any active subscription in database
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
    } else if (perm === "granted") {
      setState("inactive-with-permission");
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

  const getStatusLabel = () => {
    switch (state) {
      case "active": return "Notificações ativas";
      case "inactive-with-permission": return "Permissão ativa, sincronização pendente";
      case "denied": return "Permissão bloqueada";
      default: return "Ativar notificações";
    }
  };

  const getButtonLabel = () => {
    if (busy) return <Loader2 size={14} className="animate-spin" />;
    switch (state) {
      case "active": return "Desativar";
      case "inactive-with-permission": return "Sincronizar";
      case "denied": return "Ver como ativar";
      default: return "Ativar";
    }
  };

  const getIcon = () => {
    switch (state) {
      case "active": return <BellRing size={16} style={{ color: "var(--dash-success-text)" }} />;
      case "inactive-with-permission": return <RefreshCw size={16} style={{ color: "var(--dash-warning-text)" }} />;
      case "denied": return <BellOff size={16} style={{ color: "var(--dash-danger-text)" }} />;
      default: return <Bell size={16} style={{ color: "var(--dash-text-muted)" }} />;
    }
  };

  const handleButtonClick = () => {
    if (state === "active") {
      handleDisable();
    } else if (state === "denied") {
      setShowDenied(true);
    } else {
      handleEnableClick();
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case "active": return "var(--dash-border-strong)";
      case "inactive-with-permission": return "var(--dash-warning-text)";
      case "denied": return "var(--dash-danger-text)";
      default: return "var(--dash-accent)";
    }
  };

  const getBgColor = () => {
    switch (state) {
      case "active": return "transparent";
      case "inactive-with-permission": return "var(--dash-warning-bg, rgba(234,179,8,0.1))";
      case "denied": return "var(--dash-danger-bg)";
      default: return "var(--dash-accent-subtle)";
    }
  };

  const getTextColor = () => {
    switch (state) {
      case "active": return "var(--dash-text-muted)";
      case "inactive-with-permission": return "var(--dash-warning-text)";
      case "denied": return "var(--dash-danger-text)";
      default: return "var(--dash-accent)";
    }
  };

  return (
    <>
      <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <p className="mb-3" style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Notificações push
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <span style={{ color: "var(--dash-text)", fontSize: 14 }}>
              {getStatusLabel()}
            </span>
          </div>
          <button
            onClick={handleButtonClick}
            disabled={busy}
            className="text-sm px-4 py-2 rounded-lg transition-all duration-150 disabled:opacity-50"
            style={{
              border: `1px solid ${getBorderColor()}`,
              background: getBgColor(),
              color: getTextColor(),
              fontWeight: 400,
            }}
          >
            {getButtonLabel()}
          </button>
        </div>
        {state === "active" && (
          <p style={{ color: "var(--dash-text-muted)", fontSize: 11, marginTop: 8 }}>
            Você receberá lembretes mesmo com o app fechado
          </p>
        )}
        {state === "inactive-with-permission" && (
          <p style={{ color: "var(--dash-text-muted)", fontSize: 11, marginTop: 8 }}>
            A permissão está ativa, mas o registro precisa ser concluído
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
