import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileNav from "@/components/dashboard/MobileNav";
import ModulePage from "@/components/dashboard/ModulePage";
import SettingsPage from "@/components/dashboard/SettingsPage";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("inicio");

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
    <div className="min-h-screen" style={{ background: "#F1F5F9" }}>
      <DashboardSidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <MobileNav activeItem={activeItem} onNavigate={setActiveItem} />
      {renderContent()}
    </div>
  );
};

export default Dashboard;
