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
  const [profile, setProfile] = useState<{ display_name: string | null; email: string | null }>({ display_name: null, email: null });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, email")
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
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-6">
        <span className="font-display text-lg font-bold text-white tracking-tight">Dailix</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
        {navItems.map((item) => {
          const isActive = activeItem === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={{
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                borderLeft: isActive ? "3px solid #00B4D8" : "3px solid transparent",
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="mt-auto" />

        <button
          onClick={() => onNavigate("configuracoes")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mt-4"
          style={{
            color: activeItem === "configuracoes" ? "#FFFFFF" : "rgba(255,255,255,0.5)",
            background: activeItem === "configuracoes" ? "rgba(255,255,255,0.08)" : "transparent",
            borderLeft: activeItem === "configuracoes" ? "3px solid #00B4D8" : "3px solid transparent",
          }}
        >
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
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: "rgba(0,180,216,0.2)", color: "#00B4D8" }}
        >
          {(profile.display_name || "U").charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {profile.display_name || "Usuário"}
          </p>
          <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
            {profile.email || user?.email}
          </p>
        </div>
        <button
          onClick={signOut}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          title="Sair"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
