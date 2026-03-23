import { Home, Target, Users, Briefcase, Heart, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Início", icon: Home, path: "inicio" },
  { label: "Foco", icon: Target, path: "foco" },
  { label: "Família", icon: Users, path: "familia" },
  { label: "Negócios", icon: Briefcase, path: "negocios" },
  { label: "Bem-estar", icon: Heart, path: "bem-estar" },
];

interface DashboardSidebarProps {
  activeItem: string;
  onNavigate: (path: string) => void;
}

const DashboardSidebar = ({ activeItem, onNavigate }: DashboardSidebarProps) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; email: string | null; plano: string }>({
    display_name: null,
    email: null,
    plano: "free",
  });

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

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-30"
      style={{
        width: 240,
        background: "#0F172A",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-6">
        <span className="font-display text-lg font-bold text-white tracking-tight">Dailix</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col px-3 mt-2">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeItem === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className="flex items-center gap-3 text-sm font-medium transition-all text-left relative"
                style={{
                  padding: "10px 16px",
                  color: isActive ? "#00B4D8" : "rgba(255,255,255,0.45)",
                  background: isActive ? "rgba(0,180,216,0.08)" : "transparent",
                  borderRadius: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                    style={{
                      width: 2,
                      height: 20,
                      background: "#00B4D8",
                      borderRadius: 2,
                    }}
                  />
                )}
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => onNavigate("configuracoes")}
          className="flex items-center gap-3 text-sm font-medium transition-all text-left mb-4 relative"
          style={{
            padding: "10px 16px",
            color: activeItem === "configuracoes" ? "#00B4D8" : "rgba(255,255,255,0.45)",
            background: activeItem === "configuracoes" ? "rgba(0,180,216,0.08)" : "transparent",
            borderRadius: 8,
          }}
          onMouseEnter={(e) => {
            if (activeItem !== "configuracoes") {
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (activeItem !== "configuracoes") {
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          {activeItem === "configuracoes" && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{ width: 2, height: 20, background: "#00B4D8", borderRadius: 2 }}
            />
          )}
          <Settings size={18} />
          <span>Configurações</span>
        </button>
      </nav>

      {/* User info + logout */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className="flex items-center justify-center text-sm font-bold flex-shrink-0 font-display"
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "#1E3A5F",
            color: "white",
            fontSize: 16,
          }}
        >
          {(profile.display_name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {profile.display_name || "Usuário"}
          </p>
          <span
            className="text-[11px] font-medium px-2 py-0.5"
            style={{
              background: "rgba(0,180,216,0.15)",
              color: "#00B4D8",
              borderRadius: 6,
            }}
          >
            {profile.plano}
          </span>
        </div>
        <button
          onClick={signOut}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          title="Sair"
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
