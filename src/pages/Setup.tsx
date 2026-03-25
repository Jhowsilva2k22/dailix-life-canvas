import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Target, ListTodo, Sparkles, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Vertente } from "@/lib/diagnosticData";
import { vertenteLabelMap, resultContent } from "@/lib/diagnosticData";
import { profileSeeds } from "@/lib/onboardingProfiles";

interface DiagnosticData {
  principal: Vertente;
  secundario: Vertente;
}

const ORIGINAL_PRICE = "R$ 19,90";
const FOUNDER_PRICE = "R$ 9,90";
const FOUNDER_PERIOD = "/mês";

const fade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

/* ── Shared UI pieces ─────────────────────────────────────────────── */

const Orbs = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute rounded-full" style={{ width: 600, height: 600, top: "-20%", left: "-10%", background: "radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%)" }} />
    <div className="absolute rounded-full" style={{ width: 500, height: 500, bottom: "-15%", right: "-10%", background: "radial-gradient(circle, rgba(30,58,95,0.06) 0%, transparent 70%)" }} />
  </div>
);

const PrimaryBtn = ({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-2 px-7 py-4 text-sm rounded-lg transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
    style={{ background: "#00B4D8", color: "#0C1222", fontWeight: 400, letterSpacing: "0.02em" }}
  >
    {children}
  </button>
);

const GhostBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="text-sm transition-colors duration-200"
    style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}
    onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
  >
    {children}
  </button>
);

const SectionLabel = ({ children }: { children: string }) => (
  <span className="text-[11px] tracking-[0.14em] uppercase block mb-6" style={{ color: "rgba(0,180,216,0.5)", fontWeight: 400 }}>
    {children}
  </span>
);

const prioColor = (p: string) =>
  p === "alta" ? "#00B4D8" : "rgba(255,255,255,0.25)";

/* ── Main ─────────────────────────────────────────────────────────── */

const Setup = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [diagnostic, setDiagnostic] = useState<DiagnosticData | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dailix_diagnostic");
    if (stored) {
      try { setDiagnostic(JSON.parse(stored)); } catch { navigate("/welcome", { replace: true }); }
    } else {
      navigate("/welcome", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("display_name, onboarding_completed")
      .eq("user_id", session.user.id).single()
      .then(({ data }) => {
        if (data?.onboarding_completed) { navigate("/dashboard", { replace: true }); return; }
        const name = data?.display_name || session.user.user_metadata?.full_name || "";
        setDisplayName(name);
        setReady(true);
      });
  }, [session, navigate]);

  if (loading || !ready || !diagnostic) return null;
  if (!session) return <Navigate to="/login" replace />;

  const profile = profileSeeds[diagnostic.principal];
  const result = resultContent[diagnostic.principal];
  const firstName = displayName.split(" ")[0] || "você";

  const seedAndFinish = async (plano: string) => {
    setSubmitting(true);
    const userId = session.user.id;

    await supabase.from("profiles").update({
      modules: [...new Set(profile.modulosPrioritarios)],
      onboarding_completed: true,
      plano,
      diagnostico_principal: diagnostic.principal,
      diagnostico_secundario: diagnostic.secundario,
    } as any).eq("user_id", userId);

    await supabase.from("tasks").insert(
      profile.tarefas.map(t => ({ user_id: userId, titulo: t.titulo, prioridade: t.prioridade }))
    );

    if (profile.habitos?.length) {
      await supabase.from("habits").insert(
        profile.habitos.map(h => ({ user_id: userId, titulo: h.titulo, categoria: h.categoria, frequencia: h.frequencia }))
      );
    }

    if (profile.metas?.length) {
      await supabase.from("goals").insert(
        profile.metas.map(g => ({ user_id: userId, titulo: g.titulo, descricao: g.descricao }))
      );
    }

    localStorage.removeItem("dailix_diagnostic");
    navigate("/dashboard");
    setSubmitting(false);
  };

  const next = () => setStep(s => s + 1);

  const benefits = [
    "Tarefas sem limite",
    "Metas completas",
    "Hábitos com continuidade",
    "Insights organizados",
    "Histórico da sua execução",
    "Ambiente premium completo",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ background: "#0C1222" }}>
      <Orbs />

      {/* Step dots */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center h-14" style={{ background: "rgba(12,18,34,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className="h-1 rounded-full transition-all duration-500" style={{ width: step >= s ? 28 : 12, background: step >= s ? "#00B4D8" : "rgba(255,255,255,0.08)" }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-xl mx-auto px-6 pt-20 pb-16 relative z-10">
        <AnimatePresence mode="wait">

          {/* ── STEP 1 — Welcome ──────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" {...fade} className="flex flex-col items-center text-center">
              <SectionLabel>Bem-vindo ao Dailix</SectionLabel>
              <h1 className="font-display text-[1.75rem] md:text-[2.5rem] tracking-tight mb-6" style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}>
                <span style={{ color: "#00B4D8" }}>{firstName}</span>, sua nova estrutura começa agora.
              </h1>
              <p className="text-[15px] mb-12" style={{ color: "rgba(255,255,255,0.5)", maxWidth: 420, fontWeight: 300, lineHeight: 1.8 }}>
                Você acabou de dar um passo raro: trocar improviso por estrutura.
                <br /><br />
                Com base no seu diagnóstico, o Dailix já começou a preparar o seu melhor ponto de partida.
              </p>
              <PrimaryBtn onClick={next}>
                Ver meu sistema inicial
                <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
            </motion.div>
          )}

          {/* ── STEP 2 — Direction ────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" {...fade}>
              <SectionLabel>Seu ponto de partida foi definido</SectionLabel>
              <h2 className="font-display text-[1.5rem] md:text-[2rem] tracking-tight mb-10" style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}>
                Seu diagnóstico virou direção.
              </h2>

              <div className="flex flex-col gap-6 mb-10">
                <div className="rounded-xl p-5" style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.12)" }}>
                  <span className="text-[11px] tracking-[0.1em] uppercase block mb-1.5" style={{ color: "rgba(0,180,216,0.6)" }}>Diagnóstico principal</span>
                  <p className="text-white text-[15px]" style={{ fontWeight: 400 }}>{vertenteLabelMap[diagnostic.principal]}</p>
                </div>
                <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-[11px] tracking-[0.1em] uppercase block mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Padrão secundário</span>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 400 }}>{vertenteLabelMap[diagnostic.secundario]}</p>
                </div>
              </div>

              <div className="mb-10">
                <span className="text-[11px] tracking-[0.1em] uppercase block mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>O que isso significa</span>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.8, fontWeight: 300 }}>
                  {profile.direcaoTexto}
                </p>
              </div>

              <div className="mb-10">
                <span className="text-[11px] tracking-[0.1em] uppercase block mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Por onde vamos começar</span>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(profile.modulosPrioritarios)].map(m => (
                    <span key={m} className="px-3 py-1.5 rounded-md text-[13px]" style={{ background: "rgba(0,180,216,0.08)", border: "1px solid rgba(0,180,216,0.15)", color: "#00B4D8" }}>
                      {m === "foco" ? "Foco" : m === "bem-estar" ? "Bem-estar" : m === "familia" ? "Família" : "Negócios"}
                    </span>
                  ))}
                </div>
              </div>

              <PrimaryBtn onClick={next}>
                Montar meu sistema
                <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
            </motion.div>
          )}

          {/* ── STEP 3 — System ready ─────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" {...fade}>
              <SectionLabel>Sistema inicial</SectionLabel>
              <h2 className="font-display text-[1.5rem] md:text-[2rem] tracking-tight mb-3" style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}>
                Seu sistema inicial está pronto.
              </h2>
              <p className="text-[15px] mb-10" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 300, lineHeight: 1.7 }}>
                Com base no seu diagnóstico, o Dailix organizou o melhor ponto de partida para sua execução.
              </p>

              {/* Tasks */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <ListTodo className="h-4 w-4" style={{ color: "#00B4D8" }} />
                  <span className="text-[12px] tracking-[0.08em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Tarefas iniciais</span>
                </div>
                <div className="flex flex-col gap-2">
                  {profile.tarefas.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="h-4 w-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: prioColor(t.prioridade) }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>{t.titulo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habits */}
              {profile.habitos?.length ? (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4" style={{ color: "#00B4D8" }} />
                    <span className="text-[12px] tracking-[0.08em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Hábito recomendado</span>
                  </div>
                  {profile.habitos.map((h, i) => (
                    <div key={i} className="rounded-lg px-4 py-3" style={{ background: "rgba(0,180,216,0.04)", border: "1px solid rgba(0,180,216,0.1)" }}>
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 300 }}>{h.titulo}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Goals */}
              {profile.metas?.length ? (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-4 w-4" style={{ color: "#00B4D8" }} />
                    <span className="text-[12px] tracking-[0.08em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Meta definida</span>
                  </div>
                  {profile.metas.map((g, i) => (
                    <div key={i} className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[14px] mb-1" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>{g.titulo}</p>
                      <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>{g.descricao}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <PrimaryBtn onClick={next}>
                Ver minha estrutura
                <ArrowRight className="h-4 w-4" />
              </PrimaryBtn>
            </motion.div>
          )}

          {/* ── STEP 4 — Preview ──────────────────────────────────── */}
          {step === 4 && (
            <motion.div key="s4" {...fade}>
              <SectionLabel>Prévia do seu ambiente</SectionLabel>
              <h2 className="font-display text-[1.5rem] md:text-[2rem] tracking-tight mb-3" style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}>
                É assim que sua execução começa a ganhar forma.
              </h2>
              <p className="text-[15px] mb-10" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 300, lineHeight: 1.7 }}>
                O Dailix já organizou seu ponto de partida. Agora você pode ativar o sistema completo para continuar a partir daqui.
              </p>

              {/* Mock app preview */}
              <div className="rounded-2xl overflow-hidden mb-10" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Mock header */}
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="font-display text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Dailix</span>
                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(0,180,216,0.1)", color: "#00B4D8" }}>{profile.previewLabel}</span>
                </div>

                {/* Mock "Hoje" section */}
                <div className="p-5">
                  <span className="text-[11px] tracking-[0.1em] uppercase block mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Hoje</span>
                  <div className="flex flex-col gap-2">
                    {profile.tarefas.slice(0, 2).map((t, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="h-3.5 w-3.5 rounded-full border-[1.5px] flex-shrink-0" style={{ borderColor: prioColor(t.prioridade) }} />
                        <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>{t.titulo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock stats row */}
                <div className="flex gap-3 px-5 pb-5">
                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "rgba(0,180,216,0.04)", border: "1px solid rgba(0,180,216,0.08)" }}>
                    <p className="text-[18px] font-display" style={{ color: "#00B4D8" }}>{profile.tarefas.length}</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>tarefas</p>
                  </div>
                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[18px] font-display" style={{ color: "rgba(255,255,255,0.7)" }}>{profile.habitos?.length || 0}</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>hábitos</p>
                  </div>
                  <div className="flex-1 rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[18px] font-display" style={{ color: "rgba(255,255,255,0.7)" }}>{profile.metas?.length || 0}</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>metas</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 items-center">
                <PrimaryBtn onClick={next}>
                  Ativar meu Dailix
                  <ArrowRight className="h-4 w-4" />
                </PrimaryBtn>
                <GhostBtn onClick={next}>Ver o que será liberado</GhostBtn>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5 — Paywall ──────────────────────────────────── */}
          {step === 5 && (
            <motion.div key="s5" {...fade}>
              <SectionLabel>Ativar sistema completo</SectionLabel>
              <h2 className="font-display text-[1.5rem] md:text-[2rem] tracking-tight mb-3" style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}>
                Seu diagnóstico já virou estrutura. Agora ative o sistema completo.
              </h2>
              <p className="text-[15px] mb-10" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 300, lineHeight: 1.8 }}>
                Você já começou com o ponto de partida certo.
                Ao ativar o Dailix, você libera a execução completa com tarefas, metas, hábitos e insights organizados a partir do seu próprio padrão.
              </p>

              {/* Benefits */}
              <div className="mb-8">
                <span className="text-[11px] tracking-[0.1em] uppercase block mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>Ao ativar agora, você libera</span>
                <div className="flex flex-col gap-2.5">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="h-4 w-4 flex-shrink-0" style={{ color: "#00B4D8" }} />
                      <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.65)", fontWeight: 300 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price card */}
              <div className="rounded-xl p-6 mb-8 text-center" style={{ background: "rgba(0,180,216,0.04)", border: "1px solid rgba(0,180,216,0.12)" }}>
                <span className="text-[12px] tracking-[0.1em] uppercase block mb-3" style={{ color: "rgba(0,180,216,0.6)" }}>Plano Fundador</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-[2rem]" style={{ color: "#fff", fontWeight: 400 }}>{FOUNDER_PRICE}</span>
                  <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.4)" }}>{FOUNDER_PERIOD}</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-4 items-center">
                <PrimaryBtn onClick={() => seedAndFinish("fundador")} disabled={submitting}>
                  {submitting ? "Ativando..." : profile.ctaPaywall}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </PrimaryBtn>
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>
                  Acesso imediato. Cancelamento simples. Pix e cartão.
                </p>
                <GhostBtn onClick={() => seedAndFinish("free")}>
                  Continuar com acesso limitado
                </GhostBtn>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Setup;
