import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { getNotificationSupport, getPermissionState, type PermissionState } from "@/services/notifications";
import NotificationSoftAskModal from "./NotificationSoftAskModal";
import NotificationDeniedModal from "./NotificationDeniedModal";

interface ReminderFieldProps {
  lembreteAtivo: boolean;
  lembreteHorario: string;
  onToggle: (active: boolean) => void;
  onTimeChange: (time: string) => void;
  /** If true, show a note that a date is needed first */
  needsDate?: boolean;
}

const ReminderField = ({ lembreteAtivo, lembreteHorario, onToggle, onTimeChange, needsDate }: ReminderFieldProps) => {
  const [permission, setPermission] = useState<PermissionState>(getPermissionState());
  const [showSoftAsk, setShowSoftAsk] = useState(false);
  const [showDenied, setShowDenied] = useState(false);
  const supported = getNotificationSupport();

  const handleToggle = () => {
    if (!lembreteAtivo) {
      if (!supported) return;
      if (permission === "denied") {
        setShowDenied(true);
        return;
      }
      if (permission === "granted") {
        activateReminder();
      } else {
        // "default" — show soft ask
        setShowSoftAsk(true);
      }
    } else {
      onToggle(false);
    }
  };

  const activateReminder = () => {
    onToggle(true);
    if (!lembreteHorario) onTimeChange("08:00");
  };

  const handleSoftAskContinue = async () => {
    setShowSoftAsk(false);
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
    if (result === "granted") {
      activateReminder();
    } else if (result === "denied") {
      setPermission("denied");
      setShowDenied(true);
    }
    // "default" = dismissed — do nothing silently
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <BellOff size={14} style={{ color: "var(--dash-text-muted)" }} />
        <span style={{ color: "var(--dash-text-muted)", fontSize: 12 }}>Seu dispositivo não oferece suporte a notificações</span>
      </div>
    );
  }

  if (needsDate && !lembreteAtivo) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <Bell size={14} style={{ color: "var(--dash-text-muted)" }} />
        <span style={{ color: "var(--dash-text-muted)", fontSize: 12 }}>Defina um prazo para ativar lembrete</span>
      </div>
    );
  }

  return (
    <>
      <div>
        <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Lembrete</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150"
            style={{
              border: `1px solid ${lembreteAtivo ? "var(--dash-accent)" : permission === "denied" ? "var(--dash-danger-text)" : "var(--dash-border-strong)"}`,
              background: lembreteAtivo ? "var(--dash-accent-subtle)" : permission === "denied" ? "var(--dash-danger-bg)" : "transparent",
              color: lembreteAtivo ? "var(--dash-accent)" : permission === "denied" ? "var(--dash-danger-text)" : "var(--dash-text-muted)",
              fontWeight: 400,
            }}
          >
            {lembreteAtivo ? <Bell size={14} /> : <BellOff size={14} />}
            {lembreteAtivo ? "Ativado" : permission === "denied" ? "Permissão bloqueada" : "Ativar lembrete"}
          </button>

          {lembreteAtivo && (
            <input
              type="time"
              value={lembreteHorario}
              onChange={(e) => onTimeChange(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg outline-none"
              style={{
                background: "var(--dash-surface)",
                border: "1px solid var(--dash-border-strong)",
                color: "var(--dash-text)",
                colorScheme: "dark",
              }}
            />
          )}
        </div>
        {lembreteAtivo && (
          <p style={{ color: "var(--dash-text-muted)", fontSize: 11, marginTop: 6 }}>
            Ative notificações push em Configurações para receber lembretes com o app fechado
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

export default ReminderField;
