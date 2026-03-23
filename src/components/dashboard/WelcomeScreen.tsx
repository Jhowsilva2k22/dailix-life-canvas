import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeScreenProps {
  displayName: string;
  firstGoal: string;
}

const WelcomeScreen = ({ displayName, firstGoal }: WelcomeScreenProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dailix_welcome_shown")) {
      setShow(true);
      const timer = setTimeout(() => {
        localStorage.setItem("dailix_welcome_shown", "true");
        setShow(false);
      }, 5300);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#0F172A" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.span
            className="font-display text-lg font-bold text-white mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0, duration: 0.5 }}
          >
            Dailix
          </motion.span>

          {/* Name */}
          <motion.h1
            className="font-display text-4xl md:text-[56px] font-bold text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {displayName}.
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="mt-4 text-center"
            style={{ fontSize: 20, fontWeight: 400, color: "#00B4D8" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            Sua vida organizada começa agora.
          </motion.p>

          {/* Goal */}
          {firstGoal && (
            <motion.p
              className="mt-6 text-center italic"
              style={{ fontSize: 16, fontWeight: 300, color: "rgba(255,255,255,0.45)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
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
            transition={{ delay: 3, duration: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
