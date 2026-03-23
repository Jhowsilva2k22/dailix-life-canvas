import { useEffect, useRef, useState } from "react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    num: "01",
    title: "Produtividade",
    desc: "Tarefas, metas semanais e habitos diarios com acompanhamento visual do seu progresso.",
  },
  {
    num: "02",
    title: "Familia",
    desc: "Organize eventos, compromissos e decisoes familiares em um espaco compartilhado.",
  },
  {
    num: "03",
    title: "Negocios",
    desc: "Projetos, financas e objetivos profissionais com visao clara de resultados.",
  },
  {
    num: "04",
    title: "Bem-estar",
    desc: "Acompanhe sono, exercicios e saude mental com metricas que fazem sentido.",
  },
];

const FeaturesSection = () => {
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
    <section
      id="features"
      className="py-20 md:py-28"
      ref={ref}
      style={{ background: "linear-gradient(180deg, #EFF6FF, #E0F2FE)" }}
    >
      <div className="container">
        <div
          className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="font-display text-[2rem] md:text-[2.5rem] font-bold mb-4" style={{ color: "#0F172A" }}>
            Quatro areas. Uma plataforma.
          </h2>
          <p style={{ fontSize: 18, color: "#64748B" }}>
            Tudo que voce precisa para organizar cada parte da sua vida.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: visible ? `${i * 100 + 200}ms` : "0ms",
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.9)",
                borderRadius: 16,
                padding: 32,
                boxShadow: "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)";
              }}
            >
              <f.icon style={{ color: "#00B4D8", width: 28, height: 28, marginBottom: 16 }} />
              <h3 className="font-display text-xl font-bold mb-2" style={{ color: "#0F172A" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
