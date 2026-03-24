import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Vertente } from "@/lib/diagnosticData";
import {
  resultContent,
  secondaryPatternTexts,
  vertenteLabelMap,
} from "@/lib/diagnosticData";

interface Props {
  principal: Vertente;
  secundario: Vertente;
}

const DiagnosticResult = ({ principal, secundario }: Props) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const result = resultContent[principal];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const blocks = [
    { label: "O que isso revela", text: result.revela },
    { label: "O custo invisível disso", text: result.custo },
    { label: "O que precisa mudar", text: result.mudanca },
    { label: "Como o Dailix resolve isso", text: result.resolve },
    { label: "Seu melhor ponto de entrada", text: result.entrada },
  ];

  return (
    <div
      className={`w-full max-w-xl mx-auto transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Header */}
      <div className="mb-10">
        <span
          className="text-[11px] tracking-[0.14em] uppercase block mb-4"
          style={{ color: "rgba(0,180,216,0.5)", fontWeight: 400 }}
        >
          Seu diagnóstico atual
        </span>
        <h1
          className="font-display text-[1.5rem] md:text-[2rem] tracking-tight"
          style={{ color: "#fff", fontWeight: 400, lineHeight: 1.15 }}
        >
          {result.titulo}
        </h1>
      </div>

      {/* Content blocks */}
      <div className="flex flex-col gap-8 mb-10">
        {blocks.map((block, i) => (
          <div
            key={i}
            className="transition-all duration-500"
            style={{
              animationDelay: `${i * 100}ms`,
            }}
          >
            <span
              className="text-[12px] md:text-[11px] tracking-[0.1em] uppercase block mb-2"
              style={{ color: "rgba(0,180,216,0.45)", fontWeight: 400 }}
            >
              {block.label}
            </span>
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 15,
                lineHeight: 1.85,
                fontWeight: 300,
              }}
            >
              {block.text}
            </p>
          </div>
        ))}
      </div>

      {/* Secondary pattern */}
      <div
        className="rounded-xl p-6 mb-10"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          className="text-[12px] md:text-[11px] tracking-[0.1em] uppercase block mb-2"
          style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}
        >
          Padrão secundário identificado
        </span>
        <p
          className="mb-3"
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 15,
            fontWeight: 400,
          }}
        >
          {vertenteLabelMap[secundario]}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 14,
            lineHeight: 1.75,
            fontWeight: 300,
          }}
        >
          {secondaryPatternTexts[secundario]}
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate("/cadastro")}
          className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm rounded-lg transition-all duration-200 active:scale-[0.97]"
          style={{
            background: "#00B4D8",
            color: "#0C1222",
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#00C9F0";
            e.currentTarget.style.boxShadow =
              "0 8px 32px rgba(0,180,216,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#00B4D8";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {result.cta}
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate("/cadastro")}
          className="inline-flex items-center justify-center px-7 py-4 text-sm rounded-lg transition-all duration-200"
          style={{
            color: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontWeight: 300,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          Criar minha conta
        </button>
      </div>
    </div>
  );
};

export default DiagnosticResult;
