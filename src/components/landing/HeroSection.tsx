import { Check, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const benefits = [
  "Tarefas, metas e habitos em um so lugar",
  "Conteudo curado em video para cada area",
  "Insights educacionais integrados",
];


const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      ref={ref}
      className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden"
      style={{ background: "#F8FAFC" }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,58,95,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,95,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Orbs */}
      <div
        className="absolute pointer-events-none animate-orb-1"
        style={{
          top: "-5%",
          right: "-5%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute pointer-events-none animate-orb-2"
        style={{
          bottom: "-10%",
          left: "-5%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(30,58,95,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute pointer-events-none animate-orb-3"
        style={{
          top: "30%",
          left: "35%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(0,180,216,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-[60%] max-md:max-w-full">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <span
                className="text-[13px] font-medium"
                style={{
                  color: "#00B4D8",
                  letterSpacing: "0.08em",
                }}
              >
                Organize · Evolua · Viva
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`font-display text-[2.5rem] md:text-[3.25rem] lg:text-[3.5rem] font-extrabold transition-all duration-700 delay-100 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ color: "#0F172A", lineHeight: 1.1 }}
            >
              Organize sua vida.
              <br />
              Do seu{" "}
              <span className="hero-gradient-text">jeito.</span>
            </h1>

            {/* Subtitle */}
            <p
              className={`max-w-lg transition-all duration-700 delay-200 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ fontSize: 18, color: "#64748B", lineHeight: 1.6 }}
            >
              Uma plataforma para reunir produtividade, familia, negocios e bem-estar — com conteudo
              e inteligencia para te ajudar a evoluir.
            </p>

            {/* Bullets */}
            <ul
              className={`flex flex-col gap-2.5 transition-all duration-700 delay-300 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm" style={{ color: "#64748B" }}>
                  <Check className="h-4 w-4 shrink-0" style={{ color: "#00B4D8" }} />
                  {b}
                </li>
              ))}
            </ul>

            {/* Buttons */}
            <div
              className={`flex flex-wrap gap-3 pt-2 transition-all duration-700 delay-[400ms] ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <button
                onClick={() => navigate("/cadastro")}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-[10px] transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #1E3A5F, #00B4D8)",
                  boxShadow: "0 8px 32px rgba(0,180,216,0.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,180,216,0.5)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,180,216,0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Comece gratis
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="px-7 py-3.5 text-sm font-semibold rounded-[10px] transition-all duration-200 active:scale-[0.97]"
                style={{
                  border: "1.5px solid #1E3A5F",
                  color: "#1E3A5F",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(30,58,95,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Ver demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
