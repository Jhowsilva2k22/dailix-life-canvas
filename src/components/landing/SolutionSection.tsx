import { useEffect, useRef, useState } from "react";

const SolutionSection = () => {
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
    <section ref={ref} className="py-20 md:py-28" style={{ background: "#0C1222" }}>
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
            Menos ruído. Mais clareza.
            <br />
            Mais continuidade.
          </h2>

          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8, fontWeight: 300 }}>
            <p>
              Dailix foi desenhado para transformar intenção em execução.
            </p>
            <p className="mt-4">
              Um sistema que reúne, no mesmo ambiente, o que precisa ser feito, mantido, construído e lembrado.
            </p>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div
        className="mt-20 mx-auto"
        style={{
          width: 40,
          height: 1,
          background: "rgba(0,180,216,0.2)",
        }}
      />
    </section>
  );
};

export default SolutionSection;
