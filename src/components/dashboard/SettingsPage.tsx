import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const planLabels: Record<string, string> = {
    free: "Gratuito",
    pro: "Pro",
    family: "Family",
  };

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F8FAFC" }}>
      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        <h1 className="font-display text-2xl md:text-[28px] font-bold mb-8" style={{ color: "#0F172A" }}>
          Configurações
        </h1>

        {/* Profile section */}
        <div
          className="p-6 rounded-xl mb-6"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
        >
          <h2 className="font-display text-base font-bold mb-4" style={{ color: "#0F172A" }}>
            Perfil
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>
                Nome
              </label>
              <p className="text-sm font-medium" style={{ color: "#0F172A" }}>
                {profile.display_name || "—"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748B" }}>
                Email
              </label>
              <p className="text-sm" style={{ color: "#0F172A" }}>
                {profile.email || user?.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Plan section */}
        <div
          className="p-6 rounded-xl mb-6"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
        >
          <h2 className="font-display text-base font-bold mb-4" style={{ color: "#0F172A" }}>
            Plano
          </h2>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,180,216,0.1)", color: "#00B4D8" }}
            >
              {planLabels[profile.plano] || profile.plano}
            </span>
            {profile.plano !== "family" && (
              <button
                className="text-sm font-medium transition-colors"
                style={{ color: "#00B4D8" }}
              >
                Fazer upgrade
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <div
          className="p-6 rounded-xl"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
        >
          {!confirmLogout ? (
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "#EF4444" }}
            >
              <LogOut size={16} />
              Sair da conta
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm" style={{ color: "#0F172A" }}>
                Tem certeza?
              </p>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium px-4 py-1.5 rounded-lg text-white"
                style={{ background: "#EF4444" }}
              >
                Sim, sair
              </button>
              <button
                onClick={() => setConfirmLogout(false)}
                className="text-sm font-medium"
                style={{ color: "#64748B" }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
