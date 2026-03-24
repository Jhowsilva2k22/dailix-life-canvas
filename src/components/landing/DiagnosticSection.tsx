import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const DiagnosticSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="diagnostico" ref={ref} className="py-20 md:py-28" style={{ background: "#0A0F1C" }}>
      <div className="container">
        <div
          className={`max-w-xl mx-auto transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{
              background: "linear-gradient(145deg, rgba(0,180,216,0.04) 0%, rgba(12,18,34,0.8) 100%)",
              border: "1px solid rgba(0,180,216,0.1)",
            }}
          >
            <span
              className="text-[11px] tracking-[0.14em] uppercase mb-5 block"
              style={{ color: "rgba(0,180,216,0.6)", fontWeight: 400 }}
            >
              Diagnóstico
            </span>
            <h2
              className="font-display text-[1.5rem] md:text-[1.75rem] tracking-tight mb-4"
              style={{ color: "#fff", fontWeight: 400, lineHeight: 1.2 }}
            >
              Descubra em poucos minutos o nível
              <br className="hidden md:block" />
              da sua execução atual
            </h2>
            <p
              className="mb-8"
              style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.75, fontWeight: 300, maxWidth: 400, margin: "0 auto 2rem" }}
            >
              Uma entrada simples e direta para entender se hoje o seu maior gargalo é foco, constância, organização ou dispersão.
            </p>
            <button
              onClick={() => navigate("/diagnostico")}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm rounded-lg transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "rgba(0,180,216,0.12)",
                color: "#00B4D8",
                border: "1px solid rgba(0,180,216,0.2)",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,180,216,0.2)";
                e.currentTarget.style.borderColor = "rgba(0,180,216,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,180,216,0.12)";
                e.currentTarget.style.borderColor = "rgba(0,180,216,0.2)";
              }}
            >
              Fazer diagnóstico
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiagnosticSection;
