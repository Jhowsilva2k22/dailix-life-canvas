import { Home, Target, Heart, Settings, LogOut, Camera, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatar } from "@/contexts/AvatarContext";
import { useState } from "react";
import UserAvatar from "./UserAvatar";
import AvatarUploadModal from "./AvatarUploadModal";

const navItems = [
  { label: "Início", icon: Home, path: "inicio" },
  { label: "Foco", icon: Target, path: "foco" },
  { label: "Bem-estar", icon: Heart, path: "bem-estar" },
];

interface DashboardSidebarProps {
  activeItem: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
}

const DashboardSidebar = ({ activeItem, onNavigate, onOpenSearch }: DashboardSidebarProps) => {
  const { signOut } = useAuth();
  const { avatarUrl, displayName, plano } = useAvatar();
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  return (
    <>
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-30"
        style={{ width: 240, background: "var(--dash-sidebar)", borderRight: "1px solid var(--dash-border)" }}
      >
        <div className="flex items-center h-16 px-6">
          <span className="font-display text-lg font-bold" style={{ color: "var(--dash-text)" }}>Dailix</span>
        </div>

        <nav className="flex-1 flex flex-col px-3 mt-4">
          {/* Search button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-3 transition-all text-left mb-2"
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 400,
              color: "var(--dash-text-muted)",
              background: "var(--dash-muted-surface)",
              borderRadius: 10,
              border: "1px solid var(--dash-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--dash-text-secondary)";
              e.currentTarget.style.background = "var(--dash-muted-surface-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--dash-text-muted)";
              e.currentTarget.style.background = "var(--dash-muted-surface)";
            }}
          >
            <Search size={15} strokeWidth={1.5} />
            <span className="flex-1">Buscar...</span>
            <kbd style={{ fontSize: 10, color: "var(--dash-text-muted)", opacity: 0.7 }}>⌘K</kbd>
          </button>

          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = activeItem === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className="flex items-center gap-3 transition-all text-left relative"
                  style={{
                    padding: "10px 16px",
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "var(--dash-text)" : "var(--dash-text-muted)",
                    background: isActive ? "var(--dash-muted-surface-hover)" : "transparent",
                    borderRadius: 10,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--dash-text-secondary)";
                      e.currentTarget.style.background = "var(--dash-muted-surface)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--dash-text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2"
                      style={{ width: 2, height: 16, background: "var(--dash-accent)", borderRadius: 2 }}
                    />
                  )}
                  <item.icon size={17} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1" />

          <button
            onClick={() => onNavigate("configuracoes")}
            className="flex items-center gap-3 text-sm transition-all text-left mb-4 relative"
            style={{
              padding: "10px 16px",
              fontWeight: activeItem === "configuracoes" ? 500 : 400,
              color: activeItem === "configuracoes" ? "var(--dash-text)" : "var(--dash-text-muted)",
              background: activeItem === "configuracoes" ? "var(--dash-muted-surface-hover)" : "transparent",
              borderRadius: 10,
            }}
            onMouseEnter={(e) => {
              if (activeItem !== "configuracoes") {
                e.currentTarget.style.color = "var(--dash-text-secondary)";
                e.currentTarget.style.background = "var(--dash-muted-surface)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeItem !== "configuracoes") {
                e.currentTarget.style.color = "var(--dash-text-muted)";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {activeItem === "configuracoes" && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2"
                style={{ width: 2, height: 16, background: "var(--dash-accent)", borderRadius: 2 }}
              />
            )}
            <Settings size={17} strokeWidth={activeItem === "configuracoes" ? 2 : 1.5} />
            <span>Configurações</span>
          </button>
        </nav>

        <div className="px-4 py-4 flex items-center gap-3" style={{ borderTop: "1px solid var(--dash-border)" }}>
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarUpload(true)}>
            <UserAvatar avatarUrl={avatarUrl} displayName={displayName} size={36} />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "var(--dash-overlay)", borderRadius: 12 }}
            >
              <Camera size={13} style={{ color: "var(--dash-text)" }} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontSize: 13, fontWeight: 400, color: "var(--dash-text-secondary)" }}>
              {displayName || "Usuário"}
            </p>
            <span style={{ fontSize: 10, fontWeight: 500, color: "var(--dash-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {plano}
            </span>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--dash-text-muted)" }}
            title="Sair"
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--dash-text-secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--dash-text-muted)"; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {showAvatarUpload && <AvatarUploadModal onClose={() => setShowAvatarUpload(false)} />}
    </>
  );
};

export default DashboardSidebar;
