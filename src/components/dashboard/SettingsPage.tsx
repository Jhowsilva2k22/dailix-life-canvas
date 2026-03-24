import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatar } from "@/contexts/AvatarContext";
import UserAvatar from "./UserAvatar";
import AvatarUploadModal from "./AvatarUploadModal";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { avatarUrl, displayName, plano } = useAvatar();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const planLabels: Record<string, string> = { free: "Gratuito", pro: "Pro", family: "Family" };

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "var(--dash-bg)" }}>
      <div className="max-w-2xl mx-auto px-5 md:px-10 pt-20 md:pt-10 pb-24 md:pb-12">
        <h1 className="font-display mb-10" style={{ color: "var(--dash-text)", fontSize: 24, fontWeight: 400, letterSpacing: "0.01em" }}>
          Configurações
        </h1>

        {/* Profile */}
        <div className="p-6 mb-4 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <div className="flex items-start gap-4 mb-5">
            <UserAvatar avatarUrl={avatarUrl} displayName={displayName} size={64} />
            <div className="pt-1">
              <p className="font-display text-lg" style={{ color: "var(--dash-text)", fontWeight: 400 }}>{displayName || "Usuário"}</p>
              <p className="text-sm mt-0.5" style={{ color: "var(--dash-text-muted)" }}>{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowAvatarUpload(true)} className="text-sm transition-colors" style={{ color: "var(--dash-accent)", fontWeight: 400 }}>Alterar foto</button>
            <button className="text-sm transition-colors" style={{ color: "var(--dash-accent)", fontWeight: 400 }}>Editar nome</button>
          </div>
        </div>

        {/* Plan */}
        <div className="p-6 mb-4 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <p className="mb-3" style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Plano atual</p>
          <div className="flex items-center gap-3 mb-3">
            <span style={{ fontSize: 10, fontWeight: 500, color: "var(--dash-accent)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {planLabels[plano] || plano}
            </span>
          </div>
          {plano === "free" ? (
            <button className="text-sm transition-colors" style={{ color: "var(--dash-accent)", fontWeight: 400 }}>Fazer upgrade</button>
          ) : (
            <button className="text-sm transition-colors" style={{ color: "var(--dash-accent)", fontWeight: 400 }}>Gerenciar assinatura</button>
          )}
        </div>

        {/* Danger zone */}
        <div className="p-6 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg transition-colors"
              style={{ color: "var(--dash-danger-text)", border: "1px solid var(--dash-danger-bg)" }}
            >
              <LogOut size={15} /> Sair da conta
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm" style={{ color: "var(--dash-text)" }}>Tem certeza que deseja sair?</p>
              <div className="flex items-center gap-3">
                <button onClick={signOut} className="text-sm px-4 py-2.5 rounded-lg" style={{ background: "var(--dash-danger)", color: "var(--dash-text)" }}>Sim, sair</button>
                <button onClick={() => setConfirmLogout(false)} className="text-sm px-4 py-2.5 rounded-lg" style={{ color: "var(--dash-text-muted)" }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAvatarUpload && <AvatarUploadModal onClose={() => setShowAvatarUpload(false)} />}
    </div>
  );
};

export default SettingsPage;
