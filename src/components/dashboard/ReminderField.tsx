import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { getNotificationSupport, getPermissionState, requestPermission, type PermissionState } from "@/services/notifications";
import { toast } from "sonner";

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
  const supported = getNotificationSupport();

  const handleToggle = async () => {
    if (!lembreteAtivo) {
      // Turning on — check permission
      if (!supported) {
        toast.error("Seu navegador não suporta notificações");
        return;
      }
      if (permission === "denied") {
        toast.error("Notificações bloqueadas. Ative nas configurações do navegador.");
        return;
      }
      if (permission === "default") {
        const result = await requestPermission();
        setPermission(result);
        if (result !== "granted") {
          toast.error("Permissão de notificações negada");
          return;
        }
      }
      onToggle(true);
      if (!lembreteHorario) onTimeChange("08:00");
    } else {
      onToggle(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <BellOff size={14} style={{ color: "var(--dash-text-muted)" }} />
        <span style={{ color: "var(--dash-text-muted)", fontSize: 12 }}>Notificações não disponíveis neste navegador</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <BellOff size={14} style={{ color: "var(--dash-danger-text)" }} />
        <span style={{ color: "var(--dash-text-muted)", fontSize: 12 }}>Notificações bloqueadas no navegador</span>
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
    <div>
      <label className="block mb-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400 }}>Lembrete</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150"
          style={{
            border: `1px solid ${lembreteAtivo ? "var(--dash-accent)" : "var(--dash-border-strong)"}`,
            background: lembreteAtivo ? "var(--dash-accent-subtle)" : "transparent",
            color: lembreteAtivo ? "var(--dash-accent)" : "var(--dash-text-muted)",
            fontWeight: 400,
          }}
        >
          {lembreteAtivo ? <Bell size={14} /> : <BellOff size={14} />}
          {lembreteAtivo ? "Ativado" : "Ativar lembrete"}
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
          Notificação enquanto o app estiver aberto
        </p>
      )}
    </div>
  );
};

export default ReminderField;
