import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Target, Users, Briefcase, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const modules = [
  { id: "foco", label: "Foco", icon: Target, desc: "Tarefas e produtividade" },
  { id: "familia", label: "Família", icon: Users, desc: "Rotinas e organização" },
  { id: "negocios", label: "Negócios", icon: Briefcase, desc: "Projetos e contatos" },
  { id: "bem-estar", label: "Bem-estar", icon: Heart, desc: "Hábitos e saúde" },
];

const Onboarding = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [firstGoal, setFirstGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

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
      navigate("/dashboard");
    }
    setSubmitting(false);
  };

  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8FAFC" }}>
      <div className="w-full h-1" style={{ background: "#E2E8F0" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: progressWidth, background: "linear-gradient(90deg, #1E3A5F, #00B4D8)" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full" style={{ maxWidth: 560 }}>
          <p className="text-xs font-medium mb-2" style={{ color: "#94A3B8" }}>
            Passo {step} de 3
          </p>

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
                  Configure seu espaço
                </h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                  Como prefere ser chamado na plataforma?
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="displayName" style={{ color: "#0F172A" }}>Nome preferido</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Ana, Carlos..."
                />
              </div>
              <button
                onClick={() => setStep(2)}
                className="self-end inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[10px] transition-all duration-200 active:scale-[0.97]"
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
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                  Escolha suas áreas
                </h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                  Selecione o que quer organizar.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((m) => {
                  const selected = selectedModules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleModule(m.id)}
                      className="flex flex-col items-start p-4 rounded-xl transition-all duration-200 text-left active:scale-[0.97]"
                      style={{
                        border: selected
                          ? "2px solid #00B4D8"
                          : "1px solid #E2E8F0",
                        background: selected
                          ? "rgba(0,180,216,0.04)"
                          : "#FFFFFF",
                        boxShadow: selected
                          ? "0 0 0 1px rgba(0,180,216,0.2)"
                          : "none",
                      }}
                    >
                      <m.icon
                        className="mb-2"
                        style={{
                          width: 24,
                          height: 24,
                          color: selected ? "#00B4D8" : "#64748B",
                        }}
                      />
                      <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                        {m.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
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
                  style={{ color: "#64748B" }}
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
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-[10px] transition-all duration-200 active:scale-[0.97]"
                  style={{
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
                <h2 className="text-2xl font-bold" style={{ color: "#0F172A" }}>
                  Defina sua primeira meta
                </h2>
                <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                  O que quer conquistar nos próximos 30 dias?
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="goal" style={{ color: "#0F172A" }}>Sua meta</Label>
                <Input
                  id="goal"
                  value={firstGoal}
                  onChange={(e) => setFirstGoal(e.target.value)}
                  placeholder="Ex: Organizar minha rotina matinal"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium rounded-[10px] transition-colors"
                  style={{ color: "#64748B" }}
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
    </div>
  );
};

export default Onboarding;
