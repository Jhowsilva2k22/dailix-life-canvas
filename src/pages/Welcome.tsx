import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [show, setShow] = useState(true);

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

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#0F172A" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute rounded-full"
              style={{
                width: 600, height: 600, top: "-20%", left: "-10%",
                background: "radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 500, height: 500, bottom: "-15%", right: "-10%",
                background: "radial-gradient(circle, rgba(30,58,95,0.06) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 400, height: 400, top: "40%", left: "50%", transform: "translateX(-50%)",
                background: "radial-gradient(circle, rgba(0,180,216,0.04) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Logo */}
          <motion.img
            src="/dailix-icon.png"
            alt="Dailix"
            style={{ width: 48, height: 48 }}
            className="mb-12 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          {/* Name */}
          <motion.h1
            className="font-display text-4xl md:text-[52px] font-bold text-white text-center leading-tight relative z-10"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            {displayName || "Usuário"}.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="font-sans text-lg mt-4 text-center relative z-10"
            style={{ color: "#00B4D8", fontWeight: 400, fontSize: 18 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            Seu espaço está pronto.
          </motion.p>

          {/* Description */}
          <motion.p
            className="font-sans text-center mt-3 relative z-10"
            style={{
              color: "rgba(255,255,255,0.45)",
              fontWeight: 300,
              fontSize: 15,
              maxWidth: 400,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
          >
            Organização, foco e bem-estar — tudo do seu jeito.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            className="mt-10 relative z-10 transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 14,
              letterSpacing: "0.04em",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onClick={() => {
              setShow(false);
              setTimeout(() => navigate("/onboarding"), 800);
            }}
          >
            Configurar meu espaço
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Welcome;
