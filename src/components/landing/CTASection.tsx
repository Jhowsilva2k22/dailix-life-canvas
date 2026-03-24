import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
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
    <section className="py-24 md:py-32" ref={ref} style={{ background: "#0C1222" }}>
      <div className="container">
        <div
          className={`max-w-xl mx-auto text-center transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2
            className="font-display text-[1.75rem] md:text-[2.25rem] tracking-tight mb-5"
            style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}
          >
            Pare de reagir ao caos.
            <br />
            Comece a operar com estrutura.
          </h2>
          <p className="mb-10" style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.75, fontWeight: 300 }}>
            Crie sua conta e comece a organizar o que importa.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/cadastro")}
              className="inline-flex items-center gap-2 px-8 py-4 text-sm rounded-lg transition-all duration-200 active:scale-[0.97]"
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
              Criar minha conta
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#diagnostico"
              className="inline-flex items-center px-7 py-4 text-sm rounded-lg transition-all duration-200"
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
              Entrar no acesso prioritário
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
