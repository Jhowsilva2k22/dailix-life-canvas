import { Target, Users, Briefcase, Heart, LucideIcon } from "lucide-react";

interface ModuleConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  description: string;
  actionLabel: string;
}

const modules: Record<string, ModuleConfig> = {
  foco: {
    title: "Foco",
    subtitle: "Tarefas e produtividade",
    icon: Target,
    description: "Organize suas tarefas, defina prioridades e acompanhe seu progresso diário.",
    actionLabel: "Criar primeira tarefa",
  },
  familia: {
    title: "Família",
    subtitle: "Rotinas e organização familiar",
    icon: Users,
    description: "Gerencie rotinas, compromissos e atividades da família em um só lugar.",
    actionLabel: "Criar rotina",
  },
  negocios: {
    title: "Negócios",
    subtitle: "Projetos e contatos profissionais",
    icon: Briefcase,
    description: "Acompanhe projetos, gerencie contatos e organize suas metas profissionais.",
    actionLabel: "Criar projeto",
  },
  "bem-estar": {
    title: "Bem-estar",
    subtitle: "Hábitos e saúde",
    icon: Heart,
    description: "Monitore seus hábitos, cuide da saúde e mantenha o equilíbrio na rotina.",
    actionLabel: "Criar hábito",
  },
};

interface ModulePageProps {
  moduleKey: string;
}

const ModulePage = ({ moduleKey }: ModulePageProps) => {
  const config = modules[moduleKey];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F8FAFC" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        <div className="mb-2">
          <h1 className="font-display text-2xl md:text-[28px] font-bold" style={{ color: "#0F172A" }}>
            {config.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            {config.subtitle}
          </p>
        </div>

        <div
          className="flex flex-col items-center justify-center py-20 mt-8 rounded-xl"
          style={{
            background: "rgba(0,180,216,0.03)",
            border: "1px dashed rgba(0,180,216,0.2)",
          }}
        >
          <Icon size={56} style={{ color: "#00B4D8", opacity: 0.3 }} className="mb-4" />
          <p className="text-sm font-medium text-center max-w-xs" style={{ color: "#0F172A" }}>
            {config.description}
          </p>
          <button
            className="inline-flex items-center gap-1.5 mt-6 px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-opacity"
            style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)" }}
          >
            {config.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
