import { Target, Users, Briefcase, Heart, LucideIcon } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ModuleConfig {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  emptyText: string;
  actionLabel: string;
}

const modules: Record<string, ModuleConfig> = {
  foco: {
    title: "Foco",
    subtitle: "Suas tarefas, metas e produtividade em um só lugar.",
    icon: Target,
    emptyText: "Nenhuma tarefa criada ainda.",
    actionLabel: "Criar primeira tarefa",
  },
  familia: {
    title: "Família",
    subtitle: "Rotinas, compromissos e organização do lar.",
    icon: Users,
    emptyText: "Nenhuma rotina criada ainda.",
    actionLabel: "Criar primeira rotina",
  },
  negocios: {
    title: "Negócios",
    subtitle: "Contatos, projetos e ideias organizados.",
    icon: Briefcase,
    emptyText: "Nenhum projeto criado ainda.",
    actionLabel: "Criar primeiro projeto",
  },
  "bem-estar": {
    title: "Bem-estar",
    subtitle: "Hábitos, saúde e aprendizado contínuo.",
    icon: Heart,
    emptyText: "Nenhum hábito criado ainda.",
    actionLabel: "Criar primeiro hábito",
  },
};

interface ModulePageProps {
  moduleKey: string;
}

const ModulePage = ({ moduleKey }: ModulePageProps) => {
  const config = modules[moduleKey];
  const revealRef = useScrollReveal();
  if (!config) return null;
  const Icon = config.icon;

  return (
    <div ref={revealRef} className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F1F5F9" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        <div className="mb-2" data-reveal style={{ transitionDelay: "0ms" }}>
          <h1 className="font-display" style={{ color: "#0F172A", fontSize: 24, fontWeight: 400, letterSpacing: "0.01em" }}>
            {config.title}
          </h1>
          <p className="mt-1" style={{ color: "#64748B", fontSize: 15, fontWeight: 300 }}>
            {config.subtitle}
          </p>
        </div>

        <div
          data-reveal
          style={{ transitionDelay: "80ms", background: "rgba(0,180,216,0.03)", border: "1px dashed rgba(0,180,216,0.2)", borderRadius: 14 }}
          className="flex flex-col items-center justify-center py-20 mt-8"
        >
          <Icon size={48} style={{ color: "#00B4D8", opacity: 0.25 }} className="mb-4" />
          <p className="font-display text-center mb-1" style={{ color: "#0F172A", fontSize: 17, fontWeight: 400 }}>
            {config.emptyText}
          </p>
          <p className="text-center mb-6" style={{ color: "#64748B", fontSize: 14, fontWeight: 300 }}>
            Comece agora e organize essa área da sua vida.
          </p>
          <button
            className="inline-flex items-center gap-1.5 transition-colors"
            style={{
              background: "transparent",
              border: "1px solid #1E3A5F",
              color: "#1E3A5F",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: "0.03em",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(30,58,95,0.04)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {config.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
