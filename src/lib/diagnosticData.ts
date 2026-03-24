export type Vertente =
  | "dispersao"
  | "ritmo"
  | "direcao"
  | "saturacao"
  | "reatividade";

export interface ScoreEntry {
  vertente: Vertente;
  pontos: number;
}

export interface QuestionOption {
  label: string;
  scores: ScoreEntry[];
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  options: QuestionOption[];
}

// ── Universal questions (1-6) ──────────────────────────────────────

export const universalQuestions: DiagnosticQuestion[] = [
  {
    id: "u1",
    question: "Quando o seu dia começa, o que mais acontece com frequência?",
    options: [
      { label: "Já sei exatamente o que precisa ser feito", scores: [] },
      {
        label: "Sei por onde começar, mas me perco no meio",
        scores: [
          { vertente: "ritmo", pontos: 1 },
          { vertente: "direcao", pontos: 1 },
        ],
      },
      {
        label: "Tenho muitas frentes e pouca clareza de prioridade",
        scores: [
          { vertente: "dispersao", pontos: 2 },
          { vertente: "direcao", pontos: 1 },
        ],
      },
      {
        label: "Começo reagindo ao que aparece",
        scores: [
          { vertente: "reatividade", pontos: 2 },
          { vertente: "direcao", pontos: 1 },
        ],
      },
    ],
  },
  {
    id: "u2",
    question:
      "Hoje, onde ficam suas tarefas, ideias, metas e lembretes?",
    options: [
      { label: "Em um único lugar", scores: [] },
      {
        label: "Em poucos lugares, mas de forma administrável",
        scores: [{ vertente: "dispersao", pontos: 1 }],
      },
      {
        label: "Espalhados em vários lugares",
        scores: [
          { vertente: "dispersao", pontos: 2 },
          { vertente: "saturacao", pontos: 1 },
        ],
      },
      {
        label: "Nem consigo dizer com clareza",
        scores: [
          { vertente: "saturacao", pontos: 2 },
          { vertente: "dispersao", pontos: 1 },
        ],
      },
    ],
  },
  {
    id: "u3",
    question: "O que mais se repete na sua rotina?",
    options: [
      {
        label: "Começo bem, mas perco consistência",
        scores: [{ vertente: "ritmo", pontos: 2 }],
      },
      {
        label: "Faço muita coisa, mas sem avanço claro",
        scores: [
          { vertente: "direcao", pontos: 2 },
          { vertente: "reatividade", pontos: 1 },
        ],
      },
      {
        label: "Vivo resolvendo urgências",
        scores: [
          { vertente: "reatividade", pontos: 2 },
          { vertente: "direcao", pontos: 1 },
        ],
      },
      {
        label: "Tenho boas ideias, mas elas somem",
        scores: [
          { vertente: "saturacao", pontos: 2 },
          { vertente: "dispersao", pontos: 1 },
        ],
      },
    ],
  },
  {
    id: "u4",
    question: "Como você se sente no fim de uma semana comum?",
    options: [
      { label: "Avancei no que realmente importava", scores: [] },
      {
        label: "Produzi, mas sem muita clareza",
        scores: [{ vertente: "direcao", pontos: 2 }],
      },
      {
        label: "Apaguei incêndios",
        scores: [{ vertente: "reatividade", pontos: 2 }],
      },
      {
        label: "Fiquei devendo para mim mesmo",
        scores: [
          { vertente: "ritmo", pontos: 2 },
          { vertente: "saturacao", pontos: 1 },
        ],
      },
    ],
  },
  {
    id: "u5",
    question:
      "Quando você tenta se organizar melhor, o que mais trava?",
    options: [
      {
        label: "Manter constância",
        scores: [{ vertente: "ritmo", pontos: 2 }],
      },
      {
        label: "Decidir prioridades",
        scores: [
          { vertente: "direcao", pontos: 2 },
          { vertente: "reatividade", pontos: 1 },
        ],
      },
      {
        label: "Reduzir o ruído mental",
        scores: [{ vertente: "saturacao", pontos: 2 }],
      },
      {
        label: "Centralizar tudo em um sistema",
        scores: [{ vertente: "dispersao", pontos: 2 }],
      },
    ],
  },
  {
    id: "u6",
    question: "Qual dessas frases mais te representa hoje?",
    options: [
      {
        label: "Preciso de mais estrutura",
        scores: [
          { vertente: "dispersao", pontos: 1 },
          { vertente: "reatividade", pontos: 1 },
        ],
      },
      {
        label: "Preciso de mais consistência",
        scores: [{ vertente: "ritmo", pontos: 2 }],
      },
      {
        label: "Preciso de mais direção",
        scores: [{ vertente: "direcao", pontos: 2 }],
      },
      {
        label: "Preciso de mais clareza mental",
        scores: [{ vertente: "saturacao", pontos: 2 }],
      },
    ],
  },
];

// ── Adaptive refinement questions (2 per vertente) ─────────────────

export const adaptiveQuestions: Record<Vertente, DiagnosticQuestion[]> = {
  dispersao: [
    {
      id: "r-dispersao-1",
      question:
        "Quantos lugares você usa hoje para organizar sua vida e trabalho?",
      options: [
        { label: "1 ou 2", scores: [] },
        { label: "3 ou 4", scores: [{ vertente: "dispersao", pontos: 2 }] },
        {
          label: "5 ou mais",
          scores: [
            { vertente: "dispersao", pontos: 2 },
            { vertente: "saturacao", pontos: 1 },
          ],
        },
        {
          label: "Varia tanto que nem sei",
          scores: [
            { vertente: "dispersao", pontos: 2 },
            { vertente: "saturacao", pontos: 1 },
          ],
        },
      ],
    },
    {
      id: "r-dispersao-2",
      question:
        "Com que frequência você esquece algo que já tinha anotado?",
      options: [
        { label: "Raramente", scores: [] },
        { label: "Às vezes", scores: [{ vertente: "dispersao", pontos: 1 }] },
        {
          label: "Com frequência",
          scores: [{ vertente: "dispersao", pontos: 2 }],
        },
        {
          label: "O tempo todo",
          scores: [
            { vertente: "dispersao", pontos: 2 },
            { vertente: "saturacao", pontos: 1 },
          ],
        },
      ],
    },
  ],
  ritmo: [
    {
      id: "r-ritmo-1",
      question:
        "O que mais acontece quando você começa um novo hábito ou rotina?",
      options: [
        { label: "Mantenho por bastante tempo", scores: [] },
        {
          label: "Consigo por alguns dias",
          scores: [{ vertente: "ritmo", pontos: 1 }],
        },
        {
          label: "Perco o ritmo rápido",
          scores: [{ vertente: "ritmo", pontos: 2 }],
        },
        {
          label: "Recomeço várias vezes",
          scores: [{ vertente: "ritmo", pontos: 2 }],
        },
      ],
    },
    {
      id: "r-ritmo-2",
      question: "Como você descreveria sua constância hoje?",
      options: [
        { label: "Sólida", scores: [] },
        { label: "Irregular", scores: [{ vertente: "ritmo", pontos: 1 }] },
        { label: "Frágil", scores: [{ vertente: "ritmo", pontos: 2 }] },
        {
          label: "Quase inexistente",
          scores: [{ vertente: "ritmo", pontos: 2 }],
        },
      ],
    },
  ],
  direcao: [
    {
      id: "r-direcao-1",
      question:
        "Você sente que suas tarefas do dia estão conectadas ao que quer construir?",
      options: [
        { label: "Quase sempre", scores: [] },
        { label: "Às vezes", scores: [{ vertente: "direcao", pontos: 1 }] },
        { label: "Raramente", scores: [{ vertente: "direcao", pontos: 2 }] },
        {
          label: "Quase nunca",
          scores: [{ vertente: "direcao", pontos: 2 }],
        },
      ],
    },
    {
      id: "r-direcao-2",
      question: "O que mais pesa hoje?",
      options: [
        {
          label: "Falta de prioridade clara",
          scores: [{ vertente: "direcao", pontos: 2 }],
        },
        {
          label: "Metas que perdem força",
          scores: [{ vertente: "direcao", pontos: 2 }],
        },
        {
          label: "Muito esforço sem avanço real",
          scores: [
            { vertente: "direcao", pontos: 2 },
            { vertente: "reatividade", pontos: 1 },
          ],
        },
        {
          label: "Dificuldade de enxergar progresso",
          scores: [{ vertente: "direcao", pontos: 2 }],
        },
      ],
    },
  ],
  saturacao: [
    {
      id: "r-saturacao-1",
      question:
        "O que acontece com ideias importantes que surgem no seu dia?",
      options: [
        {
          label: "Consigo registrar e recuperar bem",
          scores: [],
        },
        {
          label: "Anoto, mas nem sempre revisito",
          scores: [{ vertente: "saturacao", pontos: 1 }],
        },
        {
          label: "Anoto e perco",
          scores: [{ vertente: "saturacao", pontos: 2 }],
        },
        {
          label: "Muitas nem chegam a ser registradas",
          scores: [{ vertente: "saturacao", pontos: 2 }],
        },
      ],
    },
    {
      id: "r-saturacao-2",
      question:
        "Como sua mente costuma estar na maior parte do tempo?",
      options: [
        { label: "Clara", scores: [] },
        { label: "Ocupada", scores: [{ vertente: "saturacao", pontos: 1 }] },
        {
          label: "Sobrecarregada",
          scores: [{ vertente: "saturacao", pontos: 2 }],
        },
        { label: "Confusa", scores: [{ vertente: "saturacao", pontos: 2 }] },
      ],
    },
  ],
  reatividade: [
    {
      id: "r-reatividade-1",
      question: "Como você começa a maior parte dos seus dias?",
      options: [
        { label: "Com plano claro", scores: [] },
        {
          label: "Com uma noção geral",
          scores: [{ vertente: "reatividade", pontos: 1 }],
        },
        {
          label: "Correndo atrás do que apareceu",
          scores: [{ vertente: "reatividade", pontos: 2 }],
        },
        {
          label: "Respondendo demanda antes de pensar",
          scores: [{ vertente: "reatividade", pontos: 2 }],
        },
      ],
    },
    {
      id: "r-reatividade-2",
      question: "O que melhor descreve sua rotina hoje?",
      options: [
        { label: "Conduzida por mim", scores: [] },
        {
          label: "Parcialmente conduzida por mim",
          scores: [{ vertente: "reatividade", pontos: 1 }],
        },
        {
          label: "Muito influenciada pelo que surge",
          scores: [{ vertente: "reatividade", pontos: 2 }],
        },
        {
          label: "Quase totalmente dominada por urgências",
          scores: [{ vertente: "reatividade", pontos: 2 }],
        },
      ],
    },
  ],
};

// ── Result content per vertente ────────────────────────────────────

export interface DiagnosticResult {
  titulo: string;
  revela: string;
  custo: string;
  mudanca: string;
  resolve: string;
  entrada: string;
  cta: string;
}

export const resultContent: Record<Vertente, DiagnosticResult> = {
  dispersao: {
    titulo: "Dispersão Operacional",
    revela:
      "Sua execução hoje não sofre por falta de capacidade. Sofre por excesso de fragmentação. Tarefas, ideias, intenções e prioridades não convivem no mesmo sistema.",
    custo:
      "Quando tudo fica espalhado, você perde energia tentando lembrar, recuperar, reorganizar e decidir. Isso reduz controle, desgasta a mente e enfraquece a continuidade.",
    mudanca:
      "Você não precisa de mais ferramentas. Precisa de um centro operacional único.",
    resolve:
      "O Dailix reúne tarefas, metas, hábitos e insights em um ambiente claro, contínuo e premium, criado para reduzir ruído e devolver estrutura real à sua execução.",
    entrada:
      "Comece por Tarefas + Insights para transformar fragmentação em clareza prática.",
    cta: "Quero organizar minha execução",
  },
  ritmo: {
    titulo: "Ritmo Instável",
    revela:
      "Você consegue começar, mas ainda não conseguiu sustentar um ritmo confiável. Sua intenção existe, mas sua continuidade ainda depende demais de motivação, energia ou impulso.",
    custo:
      "Cada recomeço cobra energia, reduz confiança e enfraquece a percepção de progresso. Com o tempo, isso desgasta até boas metas.",
    mudanca:
      "Você não precisa se cobrar mais. Precisa de uma estrutura que sustente repetição com clareza.",
    resolve:
      "Com hábitos, visão de hoje e organização simples do que realmente precisa continuar, o Dailix ajuda a transformar boa intenção em constância prática.",
    entrada:
      "Comece por Hábitos + Hoje para estabilizar ritmo e recuperar sequência.",
    cta: "Quero recuperar minha constância",
  },
  direcao: {
    titulo: "Direção Difusa",
    revela:
      "Sua rotina tem movimento, mas nem sempre esse movimento está conectado ao que realmente importa. Há esforço, mas parte dele está desconectada de direção estratégica.",
    custo:
      "Você pode terminar dias e semanas com sensação de produção, sem sentir avanço concreto. Isso gera desgaste e frustração silenciosa.",
    mudanca:
      "Você não precisa fazer mais. Precisa alinhar melhor o que faz com o que quer construir.",
    resolve:
      "O Dailix conecta metas, tarefas e execução diária em um sistema único, facilitando a visão do que merece prioridade real.",
    entrada:
      "Comece por Metas + Tarefas para conectar ação diária com direção.",
    cta: "Quero executar com direção",
  },
  saturacao: {
    titulo: "Saturação Mental",
    revela:
      "Sua mente está carregando mais do que deveria. Ideias, preocupações, lembretes e intenções estão circulando sem um sistema confiável de captura e revisão.",
    custo:
      "Quando a mente vira armazenamento, o foco cai, a clareza diminui e até decisões simples parecem mais pesadas do que deveriam.",
    mudanca:
      "Você não precisa pensar mais. Precisa aliviar a mente e externalizar com inteligência.",
    resolve:
      "Com um ambiente claro para registrar, organizar e revisitar insights junto da sua execução, o Dailix reduz ruído e devolve espaço mental.",
    entrada:
      "Comece por Insights + Organização diária para transformar excesso mental em clareza utilizável.",
    cta: "Quero clareza mental para executar",
  },
  reatividade: {
    titulo: "Reatividade Crônica",
    revela:
      "Hoje sua rotina está mais orientada pelo que aparece do que pelo que foi conscientemente conduzido. Sua execução acontece em modo resposta, não em modo direção.",
    custo:
      "Quando urgência domina demais, o dia fica cheio, mas você perde comando sobre o que realmente deveria avançar.",
    mudanca:
      "Você não precisa de mais velocidade. Precisa recuperar prioridade, antecipação e controle.",
    resolve:
      "Com uma estrutura clara para organizar o dia, visualizar prioridades e reduzir o improviso, o Dailix ajuda você a sair da reação e voltar para condução.",
    entrada:
      "Comece por Hoje + Tarefas para recuperar controle prático da rotina.",
    cta: "Quero retomar o controle da minha execução",
  },
};

export const secondaryPatternTexts: Record<Vertente, string> = {
  dispersao:
    "A fragmentação das suas ferramentas e informações amplifica o padrão principal, dificultando ainda mais a manutenção de foco e continuidade.",
  ritmo:
    "A dificuldade em manter constância agrava o diagnóstico principal, tornando cada tentativa de organização mais curta e menos eficaz.",
  direcao:
    "A falta de direção clara faz com que mesmo períodos produtivos não gerem a sensação de avanço real, reforçando o padrão principal.",
  saturacao:
    "O excesso de carga mental dificulta a clareza necessária para lidar com o padrão principal, criando um ciclo de sobrecarga e ineficiência.",
  reatividade:
    "O modo reativo constante impede a construção de estrutura, amplificando os efeitos do padrão principal na sua rotina.",
};

export const vertenteLabelMap: Record<Vertente, string> = {
  dispersao: "Dispersão Operacional",
  ritmo: "Ritmo Instável",
  direcao: "Direção Difusa",
  saturacao: "Saturação Mental",
  reatividade: "Reatividade Crônica",
};
