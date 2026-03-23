import { Home, Target, Users, Briefcase, Heart } from "lucide-react";
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

interface MobileNavProps {
  activeItem: string;
  onNavigate: (path: string) => void;
}

const MobileNav = ({ activeItem, onNavigate }: MobileNavProps) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [user]);

  return (
    <>
      {/* Mobile header */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between h-14 px-4"
        style={{ background: "#0F172A" }}
      >
        <span className="font-display text-base font-bold text-white">Dailix</span>
        <div
          className="flex items-center justify-center text-xs font-bold font-display"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "#1E3A5F",
            color: "white",
          }}
        >
          {(displayName || "U").charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Bottom navigation */}
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
