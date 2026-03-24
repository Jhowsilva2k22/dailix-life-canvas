import { useEffect, useRef, useState } from "react";

const DifferentiationSection = () => {
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
          className={`max-w-2xl mx-auto text-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="font-display text-[1.75rem] md:text-[2.25rem] tracking-tight mb-8"
            style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}
          >
            Produtividade real não parece correria.
            <br />
            <span style={{ color: "rgba(0,180,216,0.8)" }}>Parece controle.</span>
          </h2>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.8, fontWeight: 300, maxWidth: 520, margin: "0 auto" }}>
            Dailix não foi feito para te bombardear com estímulo. Foi feito para reduzir ruído, sustentar consistência e organizar sua execução em alto nível.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DifferentiationSection;
