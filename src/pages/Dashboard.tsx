import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileNav from "@/components/dashboard/MobileNav";
import FocoPage from "@/components/dashboard/foco/FocoPage";
import BemEstarPage from "@/components/dashboard/bemestar/BemEstarPage";
import SettingsPage from "@/components/dashboard/SettingsPage";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("inicio");
  const [ready, setReady] = useState(false);

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

  const renderContent = () => {
    switch (activeItem) {
      case "inicio":
        return <DashboardContent />;
      case "foco":
        return <FocoPage />;
      case "bem-estar":
        return <BemEstarPage />;
      case "configuracoes":
        return <SettingsPage />;
      default:
        return <DashboardContent />;
    }
  };

  if (!ready) return null;

  return (
    <div className="dashboard-shell min-h-screen" style={{ background: "var(--dash-bg)" }}>
      <DashboardSidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <MobileNav activeItem={activeItem} onNavigate={setActiveItem} />
      <motion.div
        key={activeItem}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default Dashboard;
