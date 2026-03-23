import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileNav from "@/components/dashboard/MobileNav";
import ModulePage from "@/components/dashboard/ModulePage";
import SettingsPage from "@/components/dashboard/SettingsPage";
import WelcomeScreen from "@/components/dashboard/WelcomeScreen";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("inicio");
  const [profile, setProfile] = useState<{ display_name: string | null; first_goal: string | null }>({
    display_name: null,
    first_goal: null,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, first_goal")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const renderContent = () => {
    switch (activeItem) {
      case "inicio":
        return <DashboardContent />;
      case "foco":
      case "familia":
      case "negocios":
      case "bem-estar":
        return <ModulePage moduleKey={activeItem} />;
      case "configuracoes":
        return <SettingsPage />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <WelcomeScreen
        displayName={profile.display_name || "Usuário"}
        firstGoal={profile.first_goal || ""}
      />
      <DashboardSidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <MobileNav activeItem={activeItem} onNavigate={setActiveItem} />
      {renderContent()}
    </div>
  );
};

export default Dashboard;
