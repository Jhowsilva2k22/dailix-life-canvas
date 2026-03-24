import { Home, Target, Heart, Settings, LogOut, Camera, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatar } from "@/contexts/AvatarContext";
import { useState, useRef, useEffect } from "react";
import UserAvatar from "./UserAvatar";
import AvatarUploadModal from "./AvatarUploadModal";

const navItems = [
  { label: "Início", icon: Home, path: "inicio" },
  { label: "Foco", icon: Target, path: "foco" },
  { label: "Bem-estar", icon: Heart, path: "bem-estar" },
  { label: "Config", icon: Settings, path: "configuracoes" },
];

interface MobileNavProps {
  activeItem: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

const MobileNav = ({ activeItem, onNavigate, onOpenSearch }: MobileNavProps) => {
  const { signOut } = useAuth();
  const { avatarUrl, displayName, plano } = useAvatar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        style={{ background: "var(--dash-sidebar)", borderBottom: "1px solid var(--dash-border)" }}
      >
        <span className="font-display text-base font-bold" style={{ color: "var(--dash-text)" }}>Dailix</span>
        <div className="flex items-center gap-2">
          <button onClick={onOpenSearch} className="p-1.5" style={{ color: "var(--dash-text-muted)" }}>
            <Search size={20} strokeWidth={1.5} />
          </button>
          <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((v) => !v)}>
            <UserAvatar avatarUrl={avatarUrl} displayName={displayName} size={34} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2"
              style={{
                background: "var(--dash-surface-elevated)",
                border: "1px solid var(--dash-border-strong)",
                borderRadius: 12,
                padding: 6,
                boxShadow: "var(--dash-shadow-modal)",
                minWidth: 200,
                zIndex: 50,
              }}
            >
              <div className="px-3 py-2.5">
                <p className="text-sm font-medium truncate" style={{ color: "var(--dash-text)" }}>
                  {displayName || "Usuário"}
                </p>
                <span style={{ fontSize: 10, fontWeight: 500, color: "var(--dash-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                  {plano}
                </span>
              </div>
              <div style={{ height: 1, background: "var(--dash-border)", margin: "2px 0" }} />
              <button
                onClick={() => { setMenuOpen(false); setShowAvatarUpload(true); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg transition-colors"
                style={{ color: "var(--dash-text-secondary)" }}
              >
                <Camera size={15} />
                Alterar foto
              </button>
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg transition-colors"
                style={{ color: "var(--dash-danger-text)" }}
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
        </div>
      </header>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around h-16"
        style={{ background: "var(--dash-sidebar)", borderTop: "1px solid var(--dash-border)" }}
      >
        {navItems.map((item) => {
          const isActive = activeItem === item.path;
          return (
            <button key={item.path} onClick={() => onNavigate(item.path)} className="flex flex-col items-center gap-1 py-1.5 px-2">
              <item.icon size={20} style={{ color: isActive ? "var(--dash-accent)" : "var(--dash-text-muted)" }} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ fontSize: 10, fontWeight: isActive ? 500 : 400, color: isActive ? "var(--dash-accent)" : "var(--dash-text-muted)" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {showAvatarUpload && <AvatarUploadModal onClose={() => setShowAvatarUpload(false)} />}
    </>
  );
};

export default MobileNav;
