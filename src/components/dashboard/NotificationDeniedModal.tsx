import { BellOff } from "lucide-react";
import { useState } from "react";

interface NotificationDeniedModalProps {
  onClose: () => void;
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const NotificationDeniedModal = ({ onClose }: NotificationDeniedModalProps) => {
  const [showHelp, setShowHelp] = useState(false);
  const ios = isIOS();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "var(--dash-overlay)" }}
      onClick={onClose}
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
            style={{ background: "var(--dash-danger-bg)" }}
          >
            <BellOff size={22} style={{ color: "var(--dash-danger-text)" }} />
          </div>

          <div>
            <h3
              className="font-display text-base mb-1.5"
              style={{ color: "var(--dash-text)", fontWeight: 500 }}
            >
              Notificações desativadas
            </h3>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
              {ios
                ? "Você bloqueou as notificações do Dailix. Para ativar depois, vá em Ajustes do iPhone > Notificações > Dailix."
                : "Você bloqueou as notificações do Dailix. Para ativar, acesse as configurações do seu navegador e permita notificações para este site."}
            </p>
          </div>

          {!showHelp ? (
            <div className="flex flex-col w-full gap-2 mt-1">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm rounded-lg transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "var(--dash-gradient-primary)",
                  color: "var(--dash-text)",
                  fontWeight: 400,
                }}
              >
                Entendi
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="w-full py-2.5 text-sm rounded-lg transition-colors active:scale-[0.98]"
                style={{
                  border: "1px solid var(--dash-border-strong)",
                  color: "var(--dash-text-muted)",
                  fontWeight: 400,
                  background: "transparent",
                }}
              >
                Ver como ativar
              </button>
            </div>
          ) : (
            <div className="w-full text-left mt-1">
              <div
                className="p-4 rounded-xl space-y-2"
                style={{
                  background: "var(--dash-surface)",
                  border: "1px solid var(--dash-border)",
                }}
              >
                {ios ? (
                  <ol className="space-y-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 12, lineHeight: 1.6 }}>
                    <li>1. Abra <strong style={{ color: "var(--dash-text)" }}>Ajustes</strong> do iPhone</li>
                    <li>2. Toque em <strong style={{ color: "var(--dash-text)" }}>Notificações</strong></li>
                    <li>3. Encontre <strong style={{ color: "var(--dash-text)" }}>Dailix</strong> na lista</li>
                    <li>4. Ative <strong style={{ color: "var(--dash-text)" }}>Permitir Notificações</strong></li>
                  </ol>
                ) : (
                  <ol className="space-y-1.5" style={{ color: "var(--dash-text-secondary)", fontSize: 12, lineHeight: 1.6 }}>
                    <li>1. Clique no ícone de <strong style={{ color: "var(--dash-text)" }}>cadeado</strong> na barra de endereço</li>
                    <li>2. Encontre <strong style={{ color: "var(--dash-text)" }}>Notificações</strong></li>
                    <li>3. Altere para <strong style={{ color: "var(--dash-text)" }}>Permitir</strong></li>
                    <li>4. Recarregue a página</li>
                  </ol>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full mt-3 py-2.5 text-sm rounded-lg transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "var(--dash-gradient-primary)",
                  color: "var(--dash-text)",
                  fontWeight: 400,
                }}
              >
                Entendi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDeniedModal;
