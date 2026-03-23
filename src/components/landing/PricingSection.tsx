import { Check, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const plans = [
  {
    name: "Gratis",
    price: "R$0",
    period: "/mes",
    features: [
      "1 area de organizacao",
      "Tarefas e metas basicas",
      "Conteudo curado limitado",
      "Acesso mobile",
    ],
    cta: "Comece gratis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$29",
    period: "/mes",
    features: [
      "4 areas completas",
      "Metas, habitos e tarefas ilimitados",
      "Conteudo curado completo",
      "Insights e relatorios",
      "Acesso prioritario",
    ],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    name: "Familia",
    price: "R$49",
    period: "/mes",
    features: [
      "Tudo do Pro",
      "Ate 5 membros",
      "Area familiar compartilhada",
      "Calendario integrado",
      "Suporte dedicado",
    ],
    cta: "Assinar Familia",
    highlight: false,
  },
];

const PricingSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-white" ref={ref}>
      <div className="container">
        <div
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-[2rem] md:text-[2.5rem] font-bold mb-4" style={{ color: "#0F172A" }}>
            Planos simples, sem surpresas.
          </h2>
          <p style={{ fontSize: 18, color: "#64748B" }}>
            Escolha o plano ideal para o seu momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`flex flex-col transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: visible ? `${i * 120 + 200}ms` : "0ms",
                borderRadius: 16,
                padding: 32,
                background: "#fff",
                border: p.highlight ? "2px solid #00B4D8" : "1px solid rgba(0,0,0,0.08)",
                boxShadow: p.highlight
                  ? "0 8px 40px rgba(0,180,216,0.15)"
                  : "0 2px 12px rgba(0,0,0,0.04)",
                transform: p.highlight ? "scale(1.04)" : "scale(1)",
              }}
            >
              <h3 className="text-[22px] font-bold mb-2" style={{ color: "#0F172A" }}>
                {p.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-extrabold" style={{ color: "#0F172A" }}>
                  {p.price}
                </span>
                <span className="text-sm" style={{ color: "#64748B" }}>
                  {p.period}
                </span>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {p.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm" style={{ color: "#64748B" }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: "#00B4D8" }} />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 text-sm font-semibold rounded-[10px] transition-all duration-200 active:scale-[0.97]"
                style={
                  p.highlight
                    ? {
                        background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                        color: "#fff",
                        boxShadow: "0 4px 16px rgba(0,180,216,0.3)",
                      }
                    : {
                        border: "1.5px solid #1E3A5F",
                        color: "#1E3A5F",
                        background: "transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (p.highlight) {
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,180,216,0.45)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  } else {
                    e.currentTarget.style.background = "rgba(30,58,95,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (p.highlight) {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,180,216,0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                  } else {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
