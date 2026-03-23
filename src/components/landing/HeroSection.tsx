import { Check, ArrowRight, Target, Users, Briefcase, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const benefits = [
  "Tarefas, metas e habitos em um so lugar",
  "Conteudo curado em video para cada area",
  "Insights educacionais integrados",
];

const mockupCards = [
  { icon: Target, label: "Foco", progress: 75 },
  { icon: Users, label: "Familia", progress: 60 },
  { icon: Briefcase, label: "Negocios", progress: 45 },
  { icon: Heart, label: "Bem-estar", progress: 80 },
];

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <span
                className="inline-block px-4 py-1.5 rounded-full text-[12px] font-normal"
                style={{
                  border: "1px solid rgba(0,180,216,0.2)",
                  background: "rgba(0,180,216,0.04)",
                  color: "#00B4D8",
                }}
              >
                Organize · Evolua · Viva
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`text-[2.5rem] md:text-[3.25rem] lg:text-[3.5rem] font-extrabold transition-all duration-700 delay-100 ${
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

          {/* Right column — Mockup */}
          <div
            className={`hidden lg:block transition-all duration-1000 delay-300 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div
              className="mockup-container"
              style={{
                transform: "perspective(1200px) rotateY(-8deg) rotateX(3deg)",
                transition: "transform 0.6s ease",
                filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.18))",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "perspective(1200px) rotateY(-4deg) rotateX(1deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "perspective(1200px) rotateY(-8deg) rotateX(3deg)";
              }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  background: "#0F172A",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow:
                    "0 0 0 1px rgba(0,180,216,0.1), 0 20px 60px rgba(0,0,0,0.3), 0 0 80px rgba(0,180,216,0.08)",
                }}
              >
                {/* Inner glow */}
                <div
                  className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at top right, rgba(0,180,216,0.15), transparent 70%)",
                  }}
                />

                {/* macOS header */}
                <div
                  className="flex items-center h-10 px-4 relative"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
                  </div>
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-[13px]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Dailix
                  </span>
                </div>

                {/* 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 p-4">
                  {mockupCards.map((c) => (
                    <div
                      key={c.label}
                      className="p-4"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                      }}
                    >
                      <c.icon className="mb-2" style={{ color: "#00B4D8", width: 20, height: 20 }} />
                      <p className="text-sm font-bold mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>
                        {c.label}
                      </p>
                      <div
                        className="w-full rounded-sm overflow-hidden"
                        style={{ height: 4, background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-sm"
                          style={{
                            width: `${c.progress}%`,
                            background: "rgba(0,180,216,0.6)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
