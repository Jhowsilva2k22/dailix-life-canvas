import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import MobileNav from "@/components/dashboard/MobileNav";
import ModulePage from "@/components/dashboard/ModulePage";
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

  if (!ready) return null;

  return (
    <div className="min-h-screen" style={{ background: "#F1F5F9" }}>
      <DashboardSidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <MobileNav activeItem={activeItem} onNavigate={setActiveItem} />
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
