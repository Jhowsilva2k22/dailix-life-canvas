import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const modules = [
  { id: "foco", num: "01", label: "Foco", desc: "Tarefas e produtividade" },
  { id: "familia", num: "02", label: "Família", desc: "Rotinas e organização" },
  { id: "negocios", num: "03", label: "Negócios", desc: "Projetos e contatos" },
  { id: "bem-estar", num: "04", label: "Bem-estar", desc: "Hábitos e saúde" },
];

const Onboarding = () => {
  const { session, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [firstGoal, setFirstGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!session) {
      setCheckingOnboarding(false);
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", session.user.id)
        .single();
      if (data?.onboarding_completed) {
        navigate("/dashboard", { replace: true });
      }
      setCheckingOnboarding(false);
    };
    check();
  }, [session, navigate]);

  if (loading || checkingOnboarding) return null;
  if (!session) return <Navigate to="/login" replace />;

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (selectedModules.length === 0) {
      toast.error("Selecione pelo menos uma área.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        modules: selectedModules,
        first_goal: firstGoal || null,
        onboarding_completed: true,
      })
      .eq("user_id", session.user.id);

    if (error) {
      toast.error("Erro ao salvar. Tente novamente.");
      console.error(error);
    } else {
      localStorage.removeItem("dailix_welcome_shown");
      setExiting(true);
      setTimeout(() => navigate("/dashboard"), 600);
    }
    setSubmitting(false);
  };

  const progressSegments = [1, 2, 3];

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ background: "#0F172A" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 h-14 flex-shrink-0">
        <span className="font-display text-lg font-bold text-white tracking-tight">Dailix</span>
        <button
          onClick={signOut}
          className="text-sm transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >
          Sair
        </button>
      </header>

      {/* Progress bar */}
      <div className="flex gap-2 px-6 mb-8">
        {progressSegments.map((s) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{
              background: step >= s ? "#00B4D8" : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start md:items-center justify-center px-4 pt-4 md:pt-0">
        <div
          className="w-full"
          style={{
            maxWidth: 520,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "40px",
            backdropFilter: "blur(12px)",
          }}
        >
          <p className="text-xs font-medium mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            Passo {step} de 3
          </p>

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-display text-2xl text-white" style={{ fontWeight: 400 }}>
                  Configure seu espaço
                </h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Como prefere ser chamado?
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Nome preferido
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Ana, Carlos..."
                  className="w-full px-4 py-3 text-sm rounded-[10px] outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#00B4D8"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              <button
                onClick={() => setStep(2)}
                className="self-end inline-flex items-center gap-2 px-6 py-3 text-sm text-white rounded-[10px] transition-all duration-200 active:scale-[0.97]"
                style={{
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                  boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
                }}
                style={{
                  background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                  boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
                }}
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-display text-2xl text-white" style={{ fontWeight: 400 }}>
                  Escolha suas áreas
                </h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  O que você quer organizar?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((m) => {
                  const selected = selectedModules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleModule(m.id)}
                      className="flex flex-col items-start p-5 rounded-xl transition-all duration-200 text-left active:scale-[0.97]"
                      style={{
                        border: selected
                          ? "1px solid #00B4D8"
                          : "1px solid rgba(255,255,255,0.08)",
                        background: selected
                          ? "rgba(0,180,216,0.08)"
                          : "rgba(255,255,255,0.04)",
                        borderRadius: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.1em",
                          color: "#00B4D8",
                          fontWeight: 500,
                        }}
                      >
                        {m.num}
                      </span>
                      <p className="font-display text-base mt-1 text-white" style={{ fontWeight: 400 }}>
                        {m.label}
                      </p>
                      <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {m.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-[10px] transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
                <button
                  onClick={() => {
                    if (selectedModules.length === 0) {
                      toast.error("Selecione pelo menos uma área.");
                      return;
                    }
                    setStep(3);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm text-white rounded-[10px] transition-all duration-200 active:scale-[0.97]"
                  style={{
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                    boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
                  }}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Defina sua primeira meta
                </h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  O que quer conquistar nos próximos 30 dias?
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Sua meta
                </label>
                <input
                  type="text"
                  value={firstGoal}
                  onChange={(e) => setFirstGoal(e.target.value)}
                  placeholder="Ex: Criar uma rotina matinal consistente"
                  className="w-full px-4 py-3 text-sm rounded-[10px] outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#00B4D8"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-[10px] transition-colors"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </button>
                <button
                  onClick={handleFinish}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[10px] transition-all duration-200 active:scale-[0.97] disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                    boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
                  }}
                >
                  {submitting ? "Salvando..." : "Acessar o Dailix"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Onboarding;
