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

  const planLabels: Record<string, string> = {
    free: "Gratuito",
    pro: "Pro",
    family: "Family",
  };

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F1F5F9" }}>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        <h1 className="font-display mb-8" style={{ color: "#0F172A", fontSize: 24, fontWeight: 400, letterSpacing: "0.01em" }}>
          Configurações
        </h1>

        {/* Profile section */}
        <div className="p-8 mb-6" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16 }}>
          <div className="flex items-start gap-4 mb-4">
            <UserAvatar avatarUrl={avatarUrl} displayName={displayName} size={72} />
            <div className="pt-1">
              <p className="font-display text-xl font-bold" style={{ color: "#0F172A" }}>
                {displayName || "Usuário"}
              </p>
              <p className="text-sm" style={{ color: "#64748B" }}>
                {user?.email || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAvatarUpload(true)}
              className="text-sm font-medium transition-colors"
              style={{ color: "#00B4D8" }}
            >
              Alterar foto
            </button>
            <button className="text-sm font-medium transition-colors" style={{ color: "#00B4D8" }}>
              Editar nome
            </button>
          </div>
        </div>

        {/* Plan section */}
        <div className="p-8 mb-6" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16 }}>
          <h2 className="font-display text-base font-bold mb-4" style={{ color: "#0F172A" }}>
            Plano atual
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[11px] font-medium px-2 py-0.5"
              style={{ background: "rgba(0,180,216,0.15)", color: "#00B4D8", borderRadius: 6 }}
            >
              {planLabels[plano] || plano}
            </span>
          </div>
          {plano === "free" ? (
            <button className="text-sm font-medium transition-colors" style={{ color: "#00B4D8" }}>
              Fazer upgrade
            </button>
          ) : (
            <button className="text-sm font-medium transition-colors" style={{ color: "#00B4D8" }}>
              Gerenciar assinatura
            </button>
          )}
        </div>

        {/* Danger zone */}
        <div className="p-8" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16 }}>
          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm" style={{ color: "#0F172A" }}>Tem certeza que deseja sair?</p>
              <div className="flex items-center gap-3">
                <button onClick={signOut} className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ background: "#EF4444" }}>
                  Sim, sair
                </button>
                <button onClick={() => setConfirmLogout(false)} className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "#64748B" }}>
                  Cancelar
                </button>
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
