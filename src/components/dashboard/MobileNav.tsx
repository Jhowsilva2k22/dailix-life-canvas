import { Home, Target, Users, Briefcase, Heart, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Início", icon: Home, path: "inicio" },
  { label: "Foco", icon: Target, path: "foco" },
  { label: "Família", icon: Users, path: "familia" },
  { label: "Negócios", icon: Briefcase, path: "negocios" },
  { label: "Bem-estar", icon: Heart, path: "bem-estar" },
];

interface MobileNavProps {
  activeItem: string;
  onNavigate: (path: string) => void;
}

const MobileNav = ({ activeItem, onNavigate }: MobileNavProps) => {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [plano, setPlano] = useState("free");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, plano")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        if (data?.plano) setPlano(data.plano);
      });
  }, [user]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <>
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4"
        style={{ background: "#0F172A" }}
      >
        <span className="font-display text-base font-bold text-white">Dailix</span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center text-xs font-bold font-display"
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "#1E3A5F",
              color: "white",
              fontSize: 16,
            }}
          >
            {(displayName || "U").charAt(0).toUpperCase()}
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2"
              style={{
                background: "#0F172A",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                minWidth: 200,
                zIndex: 50,
              }}
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-white truncate">
                  {displayName || "Usuário"}
                </p>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 inline-block mt-1"
                  style={{
                    background: "rgba(0,180,216,0.15)",
                    color: "#00B4D8",
                    borderRadius: 6,
                  }}
                >
                  {plano}
                </span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
              <button
                onClick={() => { setMenuOpen(false); onNavigate("configuracoes"); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >
                <Settings size={16} />
                Configurações
              </button>
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ color: "#EF4444" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16"
        style={{
          background: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
        }}
      >
        {navItems.map((item) => {
          const isActive = activeItem === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="flex flex-col items-center gap-1 py-1.5 px-2"
            >
              <item.icon
                size={20}
                style={{ color: isActive ? "#00B4D8" : "#94A3B8" }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#00B4D8" : "#94A3B8" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default MobileNav;
