import { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAvatar } from "@/contexts/AvatarContext";
import { supabase } from "@/integrations/supabase/client";
import PaymentBrick from "@/components/setup/PaymentBrick";
import { OPEN_ACCESS_MODE } from "@/lib/featureFlags";

const ORIGINAL_PRICE = "R$ 19,90";
const FOUNDER_PRICE = "R$ 9,90";

const benefits = [
  "Tarefas sem limite",
  "Metas completas",
  "Hábitos com continuidade",
  "Insights organizados",
  "Histórico da sua execução",
  "Ambiente premium completo",
];

interface UpgradePageProps {
  onBack: () => void;
}

const UpgradePage = ({ onBack }: UpgradePageProps) => {
  const { user } = useAuth();
  const { plano, refreshAvatar } = useAvatar();
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "awaiting" | "error" | "success">("idle");
  const [paymentError, setPaymentError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll profile until backend confirms founder
  const startPolling = () => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plano").eq("user_id", user.id).single();
      if (data?.plano === "fundador") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        refreshAvatar();
        setPaymentStatus("success");
      }
    }, 3000);
  };

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  if (OPEN_ACCESS_MODE || plano === "fundador") {
    return (
      <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "var(--dash-bg)" }}>
        <div className="max-w-xl mx-auto px-5 md:px-10 pt-20 md:pt-10 pb-24 md:pb-12 text-center">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8" style={{ color: "var(--dash-text-muted)" }}>
            <ArrowLeft size={15} /> Voltar
          </button>
          <div className="rounded-xl p-8" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
            <Check size={32} style={{ color: "var(--dash-accent)" }} className="mx-auto mb-4" />
            <h2 className="font-display text-xl mb-2" style={{ color: "var(--dash-text)" }}>
              {OPEN_ACCESS_MODE ? "Acesso liberado" : "Você já é Fundador"}
            </h2>
            <p className="text-sm" style={{ color: "var(--dash-text-muted)" }}>
              {OPEN_ACCESS_MODE ? "Nesta fase, todos os recursos estão disponíveis sem custo." : "Seu acesso completo já está ativo."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "success") {
    return (
      <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "var(--dash-bg)" }}>
        <div className="max-w-xl mx-auto px-5 md:px-10 pt-20 md:pt-10 pb-24 md:pb-12 text-center">
          <div className="rounded-xl p-8" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
            <Check size={32} style={{ color: "var(--dash-accent)" }} className="mx-auto mb-4" />
            <h2 className="font-display text-xl mb-2" style={{ color: "var(--dash-text)" }}>Pagamento aprovado!</h2>
            <p className="text-sm mb-6" style={{ color: "var(--dash-text-muted)" }}>Seu Plano Fundador foi ativado com sucesso.</p>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg text-sm"
              style={{ background: "var(--dash-accent)", color: "#0C1222", fontWeight: 500 }}
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "var(--dash-bg)" }}>
      <div className="max-w-xl mx-auto px-5 md:px-10 pt-20 md:pt-10 pb-24 md:pb-12">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-8 transition-colors" style={{ color: "var(--dash-text-muted)" }}>
          <ArrowLeft size={15} /> Voltar para Configurações
        </button>

        <span className="text-[11px] tracking-[0.14em] uppercase block mb-6" style={{ color: "rgba(0,180,216,0.5)", fontWeight: 400 }}>
          Upgrade
        </span>

        <h1 className="font-display text-[1.5rem] md:text-[2rem] tracking-tight mb-3" style={{ color: "var(--dash-text)", fontWeight: 400, lineHeight: 1.15 }}>
          Libere o sistema completo do Dailix.
        </h1>
        <p className="text-[15px] mb-10" style={{ color: "var(--dash-text-muted)", fontWeight: 300, lineHeight: 1.8 }}>
          Seu plano atual é limitado. Ao ativar o Plano Fundador, você libera tarefas, metas, hábitos e insights sem restrições.
        </p>

        {/* Current plan */}
        <div className="rounded-xl p-5 mb-6" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <span className="text-[11px] tracking-[0.1em] uppercase block mb-1.5" style={{ color: "var(--dash-text-muted)" }}>Plano atual</span>
          <p className="text-sm" style={{ color: "var(--dash-text)", fontWeight: 400 }}>Gratuito — acesso limitado</p>
        </div>

        {/* Benefits */}
        <div className="mb-8">
          <span className="text-[11px] tracking-[0.1em] uppercase block mb-4" style={{ color: "var(--dash-text-muted)" }}>
            Ao ativar, você libera
          </span>
          <div className="flex flex-col gap-2.5">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="h-4 w-4 flex-shrink-0" style={{ color: "var(--dash-accent)" }} />
                <span className="text-[14px]" style={{ color: "var(--dash-text-secondary)", fontWeight: 300 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price card */}
        <div className="rounded-xl p-6 mb-8 text-center" style={{ background: "rgba(0,180,216,0.04)", border: "1px solid rgba(0,180,216,0.12)" }}>
          <span className="text-[12px] tracking-[0.1em] uppercase block mb-3" style={{ color: "rgba(0,180,216,0.6)" }}>Plano Fundador</span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-[15px] line-through" style={{ color: "var(--dash-text-muted)", fontWeight: 300 }}>de {ORIGINAL_PRICE}</span>
            <span className="text-[15px]" style={{ color: "var(--dash-text-muted)", fontWeight: 300 }}>por</span>
          </div>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="font-display text-[2rem]" style={{ color: "var(--dash-text)", fontWeight: 400 }}>{FOUNDER_PRICE}</span>
          </div>
          <p className="text-[12px] mt-3" style={{ color: "var(--dash-text-muted)", fontWeight: 300 }}>
            Ativação única · Condição especial da fase inicial do Dailix.
          </p>
        </div>

        {/* CTA / Checkout */}
        <div className="flex flex-col gap-4 items-center">
          {!showCheckout ? (
            <button
              onClick={() => setShowCheckout(true)}
              className="inline-flex items-center gap-2 px-7 py-4 text-sm rounded-lg transition-all duration-200 active:scale-[0.97]"
              style={{ background: "var(--dash-accent)", color: "#0C1222", fontWeight: 500, letterSpacing: "0.02em" }}
            >
              Ativar Plano Fundador
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="w-full">
              {(paymentStatus === "pending" || paymentStatus === "awaiting") && (
                <div className="rounded-xl p-5 mb-4 text-center" style={{ background: "rgba(0,180,216,0.06)", border: "1px solid rgba(0,180,216,0.12)" }}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--dash-accent)", borderTopColor: "transparent" }} />
                    <p className="text-[14px]" style={{ color: "var(--dash-accent)" }}>
                      {paymentStatus === "awaiting" ? "Confirmando pagamento..." : "Pagamento pendente"}
                    </p>
                  </div>
                  <p className="text-[13px]" style={{ color: "var(--dash-text-muted)", fontWeight: 300 }}>
                    Assim que o pagamento for confirmado, seu acesso será liberado automaticamente.
                  </p>
                </div>
              )}
              {paymentStatus === "error" && paymentError && (
                <div className="rounded-xl p-4 mb-4 text-center" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p className="text-[13px]" style={{ color: "rgba(239,68,68,0.8)" }}>{paymentError}</p>
                </div>
              )}
              <PaymentBrick
                userEmail={user?.email || ""}
                onSuccess={() => {
                  setPaymentStatus("awaiting");
                  startPolling();
                }}
                onError={(msg) => {
                  setPaymentStatus("error");
                  setPaymentError(msg);
                }}
                onPending={() => {
                  setPaymentStatus("pending");
                  startPolling();
                }}
              />
              <button
                onClick={() => { setShowCheckout(false); setPaymentStatus("idle"); setPaymentError(""); }}
                className="mt-4 text-[12px] block mx-auto transition-colors"
                style={{ color: "var(--dash-text-muted)" }}
              >
                ← Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
