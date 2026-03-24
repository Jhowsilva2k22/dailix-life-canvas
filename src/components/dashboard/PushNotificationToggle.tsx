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
  type PushState,
} from "@/services/pushNotifications";
import { toast } from "sonner";

const PushNotificationToggle = () => {
  const { user } = useAuth();
  const [state, setState] = useState<"loading" | "active" | "inactive" | "denied" | "unsupported" | "ios-pwa">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    detectState();
  }, []);

  const detectState = async () => {
    if (!getPushSupport()) {
      if (isIOSWithoutPWA()) {
        setState("ios-pwa");
      } else {
        setState("unsupported");
      }
      return;
    }

    const perm = getPushPermission();
    if (perm === "denied") { setState("denied"); return; }

    const sub = await getActiveSubscription();
    setState(sub ? "active" : "inactive");
  };

  const handleEnable = async () => {
    if (!user || busy) return;
    setBusy(true);
    const result = await subscribeToPush(user.id);
    if (result.success) {
      setState("active");
      toast.success("Notificações push ativadas");
    } else {
      if (result.error === "Permissão negada") {
        setState("denied");
      }
      toast.error(result.error || "Erro ao ativar push");
    }
    setBusy(false);
  };

  const handleDisable = async () => {
    if (!user || busy) return;
    setBusy(true);
    await unsubscribeFromPush(user.id);
    setState("inactive");
    toast.success("Notificações push desativadas");
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
              Para receber notificações push no iPhone/iPad, adicione o Dailix à Tela de Início:
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
          <span style={{ color: "var(--dash-text-muted)", fontSize: 13 }}>Notificações push não disponíveis neste navegador</span>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <div className="flex items-center gap-3">
          <BellOff size={16} style={{ color: "var(--dash-danger-text)" }} />
          <span style={{ color: "var(--dash-text-muted)", fontSize: 13 }}>
            Notificações bloqueadas. Ative nas configurações do navegador.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
      <p className="mb-3" style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        Notificações push
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {state === "active" ? (
            <BellRing size={16} style={{ color: "var(--dash-success-text)" }} />
          ) : (
            <Bell size={16} style={{ color: "var(--dash-text-muted)" }} />
          )}
          <span style={{ color: "var(--dash-text)", fontSize: 14 }}>
            {state === "active" ? "Ativadas" : "Desativadas"}
          </span>
        </div>
        <button
          onClick={state === "active" ? handleDisable : handleEnable}
          disabled={busy}
          className="text-sm px-4 py-2 rounded-lg transition-all duration-150 disabled:opacity-50"
          style={{
            border: `1px solid ${state === "active" ? "var(--dash-border-strong)" : "var(--dash-accent)"}`,
            background: state === "active" ? "transparent" : "var(--dash-accent-subtle)",
            color: state === "active" ? "var(--dash-text-muted)" : "var(--dash-accent)",
            fontWeight: 400,
          }}
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : state === "active" ? "Desativar" : "Ativar"}
        </button>
      </div>
      {state === "active" && (
        <p style={{ color: "var(--dash-text-muted)", fontSize: 11, marginTop: 8 }}>
          Você receberá lembretes mesmo com o app fechado
        </p>
      )}
    </div>
  );
};

export default PushNotificationToggle;
