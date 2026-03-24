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

  return (
    <section ref={ref} className="py-20 md:py-28" style={{ background: "#0A0F1C" }}>
      <div className="container">
        <div
          className={`max-w-2xl mx-auto transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="font-display text-[1.75rem] md:text-[2.25rem] tracking-tight mb-8"
            style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}
          >
            Você não precisa de mais estímulo.
            <br />
            <span style={{ color: "rgba(0,180,216,0.8)" }}>Precisa de estrutura.</span>
          </h2>

          <div className="space-y-4" style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, fontWeight: 300 }}>
            <p>
              A maioria das pessoas não falha por falta de vontade.
              <br />
              Falha por viver sem estrutura.
            </p>
            <p>
              Listas soltas, metas esquecidas, hábitos sem continuidade e informações espalhadas criam a sensação de movimento sem controle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
