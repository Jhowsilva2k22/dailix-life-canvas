import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { universalQuestions } from "@/lib/diagnosticData";
import {
  emptyScores,
  applyScores,
  pickAdaptiveVertentes,
  buildQuestionSequence,
  resolveOutcome,
  type DiagnosticScores,
  type DiagnosticOutcome,
} from "@/lib/diagnosticEngine";
import type { DiagnosticQuestion } from "@/lib/diagnosticData";
import QuestionCard from "@/components/diagnostico/QuestionCard";
import DiagnosticResult from "@/components/diagnostico/DiagnosticResult";

const Diagnostico = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<DiagnosticScores>(emptyScores());
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>(universalQuestions);
  const [outcome, setOutcome] = useState<DiagnosticOutcome | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const totalSteps = 8;

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      const currentQuestion = questions[step];
      const selectedOption = currentQuestion.options[optionIndex];
      const newScores = applyScores(scores, selectedOption.scores);
      setScores(newScores);

      // After 6 universal questions, build adaptive sequence
      if (step === 5) {
        const topTwo = pickAdaptiveVertentes(newScores);
        const fullSequence = buildQuestionSequence(topTwo);
        setQuestions(fullSequence);
      }

      const nextStep = step + 1;

      if (nextStep >= totalSteps) {
        // Done — compute result
        setTransitioning(true);
        setTimeout(() => {
          setOutcome(resolveOutcome(newScores));
          setTransitioning(false);
        }, 500);
        return;
      }

      // Transition to next question
      setTransitioning(true);
      setTimeout(() => {
        setStep(nextStep);
        setTransitioning(false);
      }, 300);
    },
    [step, scores, questions]
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0C1222" }}
    >
      {/* Minimal header */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center"
        style={{
          background: "rgba(12,18,34,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="container flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm transition-colors duration-200"
            style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300 }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
            }
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <span
            className="font-display text-sm tracking-wide"
            style={{ color: "rgba(255,255,255,0.6)", fontWeight: 400, letterSpacing: "0.06em" }}
          >
            Dailix
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center pt-14 px-4 py-12 md:py-20">
        <div
          className={`w-full transition-all duration-300 ${
            transitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
          }`}
        >
          {outcome ? (
            <DiagnosticResult
              principal={outcome.principal}
              secundario={outcome.secundario}
            />
          ) : (
            <QuestionCard
              key={questions[step]?.id}
              question={questions[step]}
              stepNumber={step + 1}
              totalSteps={totalSteps}
              onAnswer={handleAnswer}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnostico;
