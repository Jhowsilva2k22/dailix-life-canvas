import { Bell } from "lucide-react";

interface NotificationSoftAskModalProps {
  onContinue: () => void;
  onDismiss: () => void;
}

const NotificationSoftAskModal = ({ onContinue, onDismiss }: NotificationSoftAskModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "var(--dash-overlay)" }}
      onClick={onDismiss}
    >
      <div
        className="w-full md:max-w-sm rounded-t-2xl md:rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{
          background: "var(--dash-surface-elevated)",
          border: "1px solid var(--dash-border-strong)",
          boxShadow: "var(--dash-shadow-modal)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "var(--dash-accent-subtle)" }}
          >
            <Bell size={22} style={{ color: "var(--dash-accent)" }} />
          </div>

          <div>
            <h3
              className="font-display text-base mb-1.5"
              style={{ color: "var(--dash-text)", fontWeight: 500 }}
            >
              Ative lembretes no momento certo
            </h3>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
              Receba avisos das suas tarefas e hábitos, mesmo com o app fechado.
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 mt-1">
            <button
              onClick={onContinue}
              className="w-full py-2.5 text-sm rounded-lg transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "var(--dash-gradient-primary)",
                color: "var(--dash-text)",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
            >
              Continuar
            </button>
            <button
              onClick={onDismiss}
              className="w-full py-2.5 text-sm rounded-lg transition-colors active:scale-[0.98]"
              style={{
                border: "1px solid var(--dash-border-strong)",
                color: "var(--dash-text-muted)",
                fontWeight: 400,
                background: "transparent",
              }}
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSoftAskModal;
