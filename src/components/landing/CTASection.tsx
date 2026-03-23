import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 md:py-28" ref={ref}>
      <div className="container">
        <div
          className={`relative rounded-2xl p-10 md:p-16 text-center overflow-hidden transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ background: "linear-gradient(135deg, #1E3A5F, #0F172A)" }}
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="font-display text-3xl md:text-[2.5rem] font-bold tracking-tight text-white mb-4" style={{ lineHeight: 1.15 }}>
              Tudo que voce precisa. Em um lugar so.
            </h2>
            <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
              Produtividade, familia, negocios e bem-estar — organizados do seu jeito, no seu ritmo.
            </p>
            <button
              onClick={() => navigate("/cadastro")}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm rounded-[10px] transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "#fff",
                color: "#1E3A5F",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
              style={{
                background: "#fff",
                color: "#1E3A5F",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,255,255,0.25)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Criar conta gratis
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Subtle glow accents */}
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0,180,216,0.15), transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(0,180,216,0.08), transparent 70%)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default CTASection;
