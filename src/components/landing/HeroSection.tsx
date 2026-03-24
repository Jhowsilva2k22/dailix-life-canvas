import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden"
      style={{ background: "#0C1222" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Accent orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          right: "5%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="container relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className={`mb-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span
              className="text-[12px] md:text-[11px] tracking-[0.14em] uppercase"
              style={{ color: "rgba(0,180,216,0.7)", fontWeight: 400 }}
            >
              Diagnóstico de Execução Dailix
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`font-display text-[2.25rem] md:text-[3rem] lg:text-[3.5rem] tracking-tight transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ color: "#fff", lineHeight: 1.08, fontWeight: 400 }}
          >
            Descubra o que está travando
            <br />
            sua execução.
          </h1>

          {/* Subheadline */}
          <p
            className={`mt-6 max-w-lg transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, fontWeight: 300 }}
          >
            Um diagnóstico rápido para identificar o padrão que hoje está roubando sua clareza, constância ou controle.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-wrap gap-4 mt-10 transition-all duration-700 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={() => navigate("/diagnostico")}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm rounded-lg transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "#00B4D8",
                color: "#0C1222",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#00C9F0";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,180,216,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#00B4D8";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Fazer diagnóstico
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#pilares"
              className="inline-flex items-center px-7 py-3.5 text-sm rounded-lg transition-all duration-200"
              style={{
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontWeight: 300,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              Ver como funciona
            </a>
          </div>
        </div>
      </div>

      {/* Bottom fade line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
      />
    </section>
  );
};

export default HeroSection;
