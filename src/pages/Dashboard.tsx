import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileNav from "@/components/dashboard/MobileNav";
import FocoPage from "@/components/dashboard/foco/FocoPage";
import BemEstarPage from "@/components/dashboard/bemestar/BemEstarPage";
import SettingsPage from "@/components/dashboard/SettingsPage";
import GlobalSearchDialog from "@/components/dashboard/GlobalSearchDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useReminders } from "@/hooks/useReminders";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("inicio");
  const [ready, setReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useReminders();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data && !data.onboarding_completed) {
          navigate("/welcome", { replace: true });
        } else {
          setReady(true);
        }
      });
  }, [user, navigate]);

  // Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  if (!ready) return null;

  return (
    <div className="dashboard-shell min-h-screen" style={{ background: "var(--dash-bg)" }}>
      <DashboardSidebar activeItem={activeItem} onNavigate={setActiveItem} onOpenSearch={() => setSearchOpen(true)} />
      <MobileNav activeItem={activeItem} onNavigate={setActiveItem} onOpenSearch={() => setSearchOpen(true)} />
      <GlobalSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={setActiveItem} />
      <div style={{ display: activeItem === "inicio" ? "block" : "none" }}>
        <DashboardContent />
      </div>
      <div style={{ display: activeItem === "foco" ? "block" : "none" }}>
        <FocoPage />
      </div>
      <div style={{ display: activeItem === "bem-estar" ? "block" : "none" }}>
        <BemEstarPage />
      </div>
      <div style={{ display: activeItem === "configuracoes" ? "block" : "none" }}>
        <SettingsPage />
      </div>
    </div>
  );
};

export default Dashboard;
