import {
  type Vertente,
  type ScoreEntry,
  type DiagnosticQuestion,
  universalQuestions,
  adaptiveQuestions,
} from "./diagnosticData";

export interface DiagnosticScores {
  dispersao: number;
  ritmo: number;
  direcao: number;
  saturacao: number;
  reatividade: number;
}

export interface DiagnosticOutcome {
  principal: Vertente;
  secundario: Vertente;
  scores: DiagnosticScores;
}

const VERTENTES: Vertente[] = [
  "dispersao",
  "ritmo",
  "direcao",
  "saturacao",
  "reatividade",
];

export function emptyScores(): DiagnosticScores {
  return { dispersao: 0, ritmo: 0, direcao: 0, saturacao: 0, reatividade: 0 };
}

export function applyScores(
  current: DiagnosticScores,
  entries: ScoreEntry[]
): DiagnosticScores {
  const next = { ...current };
  for (const e of entries) {
    next[e.vertente] += e.pontos;
  }
  return next;
}

/** Pick the two strongest vertentes from accumulated scores */
export function resolveOutcome(scores: DiagnosticScores): DiagnosticOutcome {
  const sorted = VERTENTES.slice().sort((a, b) => scores[b] - scores[a]);
  let principal = sorted[0];
  let secundario = sorted[1];
  // ensure they're different
  if (principal === secundario) secundario = sorted[2] ?? sorted[1];
  return { principal, secundario, scores };
}

/** After 6 universal questions, pick the top 2 vertentes for adaptive questions */
export function pickAdaptiveVertentes(
  scores: DiagnosticScores
): [Vertente, Vertente] {
  const sorted = VERTENTES.slice().sort((a, b) => scores[b] - scores[a]);
  return [sorted[0], sorted[1]];
}

/** Build the full 8-question sequence: 6 universal + 2 adaptive */
export function buildQuestionSequence(
  adaptiveVertentes: [Vertente, Vertente]
): DiagnosticQuestion[] {
  const [v1, v2] = adaptiveVertentes;
  return [
    ...universalQuestions,
    adaptiveQuestions[v1][0], // one from top vertente
    adaptiveQuestions[v2][0], // one from second vertente
  ];
}
