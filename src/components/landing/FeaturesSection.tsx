import { useEffect, useRef, useState } from "react";

const pillars = [
  {
    num: "01",
    title: "Tarefas",
    desc: "Saiba exatamente o que precisa de ação agora.",
  },
  {
    num: "02",
    title: "Metas",
    desc: "Mantenha direção sem deixar o longo prazo morrer.",
  },
  {
    num: "03",
    title: "Hábitos",
    desc: "Construa constância com acompanhamento real, não motivação passageira.",
  },
  {
    num: "04",
    title: "Insights",
    desc: "Capture o que importa e traga de volta quando precisar pensar com clareza.",
  },
];

const FeaturesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pilares" className="py-20 md:py-28" ref={ref} style={{ background: "#0A0F1C" }}>
      <div className="container">
        <div
          className={`max-w-2xl mb-16 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span
            className="text-[11px] tracking-[0.14em] uppercase mb-4 block"
            style={{ color: "rgba(0,180,216,0.6)", fontWeight: 400 }}
          >
            Pilares
          </span>
          <h2
            className="font-display text-[1.75rem] md:text-[2.25rem] tracking-tight"
            style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}
          >
            Quatro pilares. Um sistema.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-px" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden" }}>
          {pillars.map((p, i) => (
            <div
              key={p.num}
              className={`group transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                transitionDelay: visible ? `${i * 100 + 200}ms` : "0ms",
                background: "#0C1222",
                padding: "36px 32px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0E1528";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0C1222";
              }}
            >
              <span
                className="font-display block mb-3"
                style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(0,180,216,0.5)", fontWeight: 400 }}
              >
                {p.num}
              </span>
              <h3
                className="font-display text-lg tracking-tight mb-2"
                style={{ color: "#fff", fontWeight: 400 }}
              >
                {p.title}
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, fontWeight: 300 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
