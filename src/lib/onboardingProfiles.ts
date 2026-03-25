import type { Vertente } from "./diagnosticData";

export interface ProfileSeed {
  mensagemCentral: string;
  modulosPrioritarios: string[];
  direcaoTexto: string;
  tarefas: { titulo: string; prioridade: string }[];
  habitos?: { titulo: string; categoria: string; frequencia: string }[];
  metas?: { titulo: string; descricao: string }[];
  ctaPaywall: string;
  previewLabel: string;
}

export const profileSeeds: Record<Vertente, ProfileSeed> = {
  dispersao: {
    mensagemCentral: "centralizar",
    modulosPrioritarios: ["foco", "bem-estar"],
    direcaoTexto:
      "Hoje, seu maior desafio não é capacidade — é fragmentação. Suas tarefas, ideias e prioridades não convivem no mesmo sistema. Vamos centralizar tudo.",
    tarefas: [
      { titulo: "Revisar e centralizar tarefas pendentes", prioridade: "alta" },
      { titulo: "Definir as 3 prioridades da semana", prioridade: "alta" },
      { titulo: "Eliminar uma fonte de dispersão", prioridade: "media" },
    ],
    ctaPaywall: "Quero organizar minha execução",
    previewLabel: "Centralização ativa",
  },
  ritmo: {
    mensagemCentral: "constância",
    modulosPrioritarios: ["bem-estar", "foco"],
    direcaoTexto:
      "Hoje, seu maior desafio não é começar. É sustentar ritmo com clareza suficiente para transformar intenção em continuidade.",
    tarefas: [
      { titulo: "Definir rotina mínima do dia", prioridade: "alta" },
      { titulo: "Escolher 1 hábito para manter esta semana", prioridade: "alta" },
      { titulo: "Revisar o que funcionou ontem", prioridade: "media" },
    ],
    habitos: [
      { titulo: "Revisar o dia por 5 minutos", categoria: "produtividade", frequencia: "diario" },
    ],
    ctaPaywall: "Quero recuperar minha constância",
    previewLabel: "Ritmo em construção",
  },
  direcao: {
    mensagemCentral: "alinhar ação com direção",
    modulosPrioritarios: ["foco"],
    direcaoTexto:
      "Hoje, seu maior desafio não é produzir — é garantir que sua produção esteja alinhada com o que realmente importa. Vamos conectar ação com direção.",
    tarefas: [
      { titulo: "Definir a meta principal do mês", prioridade: "alta" },
      { titulo: "Conectar 3 tarefas à meta principal", prioridade: "alta" },
      { titulo: "Eliminar 1 tarefa sem contribuição real", prioridade: "media" },
    ],
    metas: [
      {
        titulo: "Meta principal dos próximos 30 dias",
        descricao: "Defina o que você quer ter alcançado no fim do mês",
      },
    ],
    ctaPaywall: "Quero executar com direção",
    previewLabel: "Direção definida",
  },
  saturacao: {
    mensagemCentral: "reduzir ruído",
    modulosPrioritarios: ["bem-estar", "foco"],
    direcaoTexto:
      "Hoje, seu maior desafio não é pensar mais — é aliviar a mente. Ideias e preocupações circulam sem um sistema confiável. Vamos externalizar com inteligência.",
    tarefas: [
      { titulo: "Registrar as 3 maiores preocupações atuais", prioridade: "alta" },
      { titulo: "Separar o que é ação do que é ruído", prioridade: "alta" },
      { titulo: "Definir 1 prioridade clara para hoje", prioridade: "media" },
    ],
    ctaPaywall: "Quero clareza mental para executar",
    previewLabel: "Clareza em construção",
  },
  reatividade: {
    mensagemCentral: "recuperar controle",
    modulosPrioritarios: ["foco"],
    direcaoTexto:
      "Hoje, seu maior desafio não é velocidade — é recuperar o comando da sua rotina. Suas decisões estão sendo tomadas pela urgência, não pela prioridade.",
    tarefas: [
      { titulo: "Definir as 3 prioridades antes de abrir mensagens", prioridade: "alta" },
      { titulo: "Bloquear 1 hora para trabalho focado", prioridade: "alta" },
      { titulo: "Identificar 1 urgência recorrente prevenível", prioridade: "media" },
    ],
    ctaPaywall: "Quero retomar o controle da minha execução",
    previewLabel: "Controle restaurado",
  },
};
