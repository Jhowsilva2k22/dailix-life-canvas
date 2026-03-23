import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    email: string | null;
    plano: string;
  }>({ display_name: null, email: null, plano: "free" });
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, email, plano")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const planLabels: Record<string, string> = {
    free: "Gratuito",
    pro: "Pro",
    family: "Family",
  };

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F1F5F9" }}>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        <h1 className="font-display text-2xl md:text-[28px] font-bold mb-8" style={{ color: "#0F172A" }}>
          Configurações
        </h1>

        {/* Profile section */}
        <div
          className="p-8 mb-6"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex items-center justify-center font-display font-bold flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "#1E3A5F",
                color: "white",
                fontSize: 22,
              }}
            >
              {(profile.display_name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-display text-xl font-bold" style={{ color: "#0F172A" }}>
                {profile.display_name || "Usuário"}
              </p>
              <p className="text-sm" style={{ color: "#64748B" }}>
                {profile.email || user?.email || "—"}
              </p>
            </div>
          </div>
          <button
            className="text-sm font-medium transition-colors"
            style={{ color: "#00B4D8" }}
          >
            Editar nome
          </button>
        </div>

        {/* Plan section */}
        <div
          className="p-8 mb-6"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16 }}
        >
          <h2 className="font-display text-base font-bold mb-4" style={{ color: "#0F172A" }}>
            Plano atual
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[11px] font-medium px-2 py-0.5"
              style={{
                background: "rgba(0,180,216,0.15)",
                color: "#00B4D8",
                borderRadius: 6,
              }}
            >
              {planLabels[profile.plano] || profile.plano}
            </span>
          </div>
          {profile.plano === "free" ? (
            <button
              className="text-sm font-medium transition-colors"
              style={{ color: "#00B4D8" }}
            >
              Fazer upgrade
            </button>
          ) : (
            <button
              className="text-sm font-medium transition-colors"
              style={{ color: "#00B4D8" }}
            >
              Gerenciar assinatura
            </button>
          )}
        </div>

        {/* Danger zone */}
        <div
          className="p-8"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16 }}
        >
          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm" style={{ color: "#0F172A" }}>
                Tem certeza que deseja sair?
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={signOut}
                  className="text-sm font-medium px-4 py-2 rounded-lg text-white"
                  style={{ background: "#EF4444" }}
                >
                  Sim, sair
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="text-sm font-medium px-4 py-2 rounded-lg"
                  style={{ color: "#64748B" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
