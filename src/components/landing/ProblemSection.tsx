import { useEffect, useRef, useState } from "react";

const ProblemSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const lines = [
    "Você abre vários apps para tocar o dia.",
    "Anota ideias e nunca revisita.",
    "Define metas, mas perde o ritmo.",
    "Começa hábitos, para no meio e recomeça do zero.",
  ];

  return (
    <section ref={ref} className="py-20 md:py-28" style={{ background: "#0A0F1C" }}>
      <div className="container">
        <div
          className={`max-w-2xl mx-auto transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="font-display text-[1.75rem] md:text-[2.25rem] tracking-tight mb-10"
            style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}
          >
            Você não precisa de mais estímulo.
            <br />
            <span style={{ color: "rgba(0,180,216,0.8)" }}>Precisa de estrutura.</span>
          </h2>

          <div className="space-y-3 mb-8">
            {lines.map((line, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 transition-all duration-500 ${
                  visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                }`}
                style={{ transitionDelay: visible ? `${i * 80 + 200}ms` : "0ms" }}
              >
                <div
                  className="mt-2 flex-shrink-0"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "rgba(0,180,216,0.4)",
                  }}
                />
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontWeight: 300 }}>
                  {line}
                </p>
              </div>
            ))}
          </div>

          <p
            className={`transition-all duration-700 delay-500 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, fontWeight: 300, fontStyle: "italic" }}
          >
            No fim, parece que está em movimento — mas sem controle real.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
