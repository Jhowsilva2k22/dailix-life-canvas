import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileNav from "@/components/dashboard/MobileNav";
import FocoPage from "@/components/dashboard/foco/FocoPage";
import BemEstarPage from "@/components/dashboard/bemestar/BemEstarPage";
import SettingsPage from "@/components/dashboard/SettingsPage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useReminders } from "@/hooks/useReminders";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("inicio");
  const [ready, setReady] = useState(false);
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

  if (!ready) return null;

  return (
    <div className="dashboard-shell min-h-screen" style={{ background: "var(--dash-bg)" }}>
      <DashboardSidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <MobileNav activeItem={activeItem} onNavigate={setActiveItem} />
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
