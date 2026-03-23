import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Welcome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [firstGoal, setFirstGoal] = useState("");
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, first_goal")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setFirstGoal(data.first_goal || "");
        }
      });
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 4500);

    const redirect = setTimeout(() => {
      localStorage.setItem("dailix_welcome_shown", "true");
      navigate("/dashboard", { replace: true });
    }, 5300);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirect);
    };
  }, [navigate]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
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
          {/* Logo */}
          <motion.p
            className="font-display text-xl font-bold text-white mb-12 tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0 }}
          >
            Dailix
          </motion.p>

          {/* Name */}
          <motion.h1
            className="font-display text-4xl md:text-[56px] font-bold text-white text-center leading-tight"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Olá, {displayName || "Usuário"}.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="font-sans text-lg md:text-xl mt-4 text-center"
            style={{ color: "#00B4D8", fontWeight: 400 }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Sua vida organizada começa agora.
          </motion.p>

          {/* Goal */}
          {firstGoal && (
            <motion.p
              className="font-sans text-base mt-6 italic text-center"
              style={{ color: "rgba(255,255,255,0.45)", fontWeight: 300 }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 2 }}
            >
              "{firstGoal}"
            </motion.p>
          )}

          {/* Icon */}
          <motion.img
            src="/dailix-icon.png"
            alt="Dailix"
            className="mt-10"
            style={{ width: 48, height: 48 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Welcome;
