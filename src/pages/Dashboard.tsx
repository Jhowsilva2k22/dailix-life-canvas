import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileNav from "@/components/dashboard/MobileNav";

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState("inicio");

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <DashboardSidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <MobileNav activeItem={activeItem} onNavigate={setActiveItem} />
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
