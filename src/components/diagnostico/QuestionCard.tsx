import { useState } from "react";
import type { DiagnosticQuestion } from "@/lib/diagnosticData";

interface Props {
  question: DiagnosticQuestion;
  stepNumber: number;
  totalSteps: number;
  onAnswer: (optionIndex: number) => void;
}

const QuestionCard = ({ question, stepNumber, totalSteps, onAnswer }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => onAnswer(idx), 400);
  };

  const progress = ((stepNumber) / totalSteps) * 100;

  return (
    <div className="w-full max-w-xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] tracking-[0.14em] uppercase"
            style={{ color: "rgba(0,180,216,0.5)", fontWeight: 400 }}
          >
            Diagnóstico de Execução
          </span>
          <span
            className="text-[12px] tabular-nums"
            style={{ color: "rgba(255,255,255,0.3)", fontWeight: 300 }}
          >
            {stepNumber} de {totalSteps}
          </span>
        </div>
        <div
          className="h-[2px] w-full rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, rgba(0,180,216,0.4), rgba(0,180,216,0.7))",
            }}
          />
        </div>
      </div>

      {/* Question */}
      <h2
        className="font-display text-[1.25rem] md:text-[1.5rem] tracking-tight mb-8"
        style={{ color: "#fff", fontWeight: 400, lineHeight: 1.3 }}
      >
        {question.question}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className="w-full text-left px-5 py-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-[15px] md:text-sm"
              style={{
                background: isSelected
                  ? "rgba(0,180,216,0.1)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  isSelected
                    ? "rgba(0,180,216,0.3)"
                    : "rgba(255,255,255,0.06)"
                }`,
                color: isSelected ? "#00B4D8" : "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 300,
                cursor: selected !== null ? "default" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (selected !== null) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                if (selected !== null) return;
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionCard;
