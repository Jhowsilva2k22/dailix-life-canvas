import { useEffect, useState } from "react";
import { CheckSquare, Flame, Target, TrendingUp, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AddTaskModal from "./AddTaskModal";

interface Profile {
  display_name: string | null;
  first_goal: string | null;
  modules: string[] | null;
}

interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  prioridade: string;
  concluida: boolean;
}

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Bom dia, ${name}.`;
  if (hour >= 12 && hour < 18) return `Boa tarde, ${name}.`;
  return `Boa noite, ${name}.`;
};

const DashboardContent = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ display_name: null, first_goal: null, modules: null });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, first_goal, modules")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
  };

  const toggleTask = async (id: string, concluida: boolean) => {
    await supabase.from("tasks").update({ concluida: !concluida }).eq("id", id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, concluida: !concluida } : t)));
  };

  const todayStr = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const todayTasks = tasks.filter((t) => {
    if (!t.prazo) return true;
    return t.prazo === new Date().toISOString().split("T")[0];
  });

  const pendingToday = todayTasks.filter((t) => !t.concluida).length;
  const goalText = profile.first_goal
    ? profile.first_goal.length > 28
      ? profile.first_goal.slice(0, 28) + "…"
      : profile.first_goal
    : "Nenhuma";
  const modulesCount = profile.modules?.length || 0;

  const summaryCards = [
    {
      icon: CheckSquare,
      iconColor: "#00B4D8",
      label: "TAREFAS HOJE",
      value: String(pendingToday),
      sub: "pendentes",
    },
    {
      icon: Flame,
      iconColor: "#F59E0B",
      label: "SEQUÊNCIA",
      value: "0",
      sub: "dias seguidos",
    },
    {
      icon: Target,
      iconColor: "#00B4D8",
      label: "META DO MÊS",
      value: goalText,
      isText: true,
      sub: "definida por você",
    },
    {
      icon: TrendingUp,
      iconColor: "#10B981",
      label: "MÓDULOS ATIVOS",
      value: String(modulesCount),
      sub: "áreas organizadas",
    },
  ];

  const gettingStartedCards = [
    {
      num: "01",
      title: "Defina sua primeira tarefa",
      desc: "Pequenos passos constroem grandes resultados.",
      cta: "Criar tarefa",
      action: () => setShowTaskModal(true),
    },
    {
      num: "02",
      title: "Crie um hábito",
      desc: "Consistência supera intensidade.",
      cta: "Criar hábito",
      action: () => {},
    },
    {
      num: "03",
      title: "Explore seu conteúdo",
      desc: "Vídeos selecionados para cada área da sua vida.",
      cta: "Ver conteúdo",
      action: () => {},
    },
  ];

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F1F5F9" }}>
      <div style={{ maxWidth: 1200 }} className="mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-[28px]" style={{ color: "#0F172A", fontWeight: 500 }}>
            {getGreeting(profile.display_name || "Usuário")}
          </h1>
          <p className="mt-1 capitalize" style={{ color: "#94A3B8", fontSize: 13, fontWeight: 300, letterSpacing: "0.03em" }}>
            {todayStr}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="p-5 transition-all duration-200 cursor-default"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
              }}
            >
              <card.icon size={20} style={{ color: card.iconColor }} className="mb-3" />
              <p
                className="mb-1"
                style={{ color: "#94A3B8", fontSize: 11, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" as const }}
              >
                {card.label}
              </p>
              <p
                className={`truncate leading-tight ${
                  card.isText ? "text-base" : ""
                }`}
                style={{ color: "#0F172A", fontSize: card.isText ? 16 : 32, fontWeight: 300 }}
              >
                {card.value}
              </p>
              <p className="mt-0.5" style={{ color: "#94A3B8", fontSize: 12, fontWeight: 300 }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Por onde começar */}
        {todayTasks.length === 0 && (
          <section className="mb-10">
            <h2 className="font-display mb-4" style={{ color: "#0F172A", fontSize: 16, fontWeight: 500, letterSpacing: "0.01em" }}>
              Por onde começar
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {gettingStartedCards.map((card) => (
                <div
                  key={card.num}
                  className="p-6 transition-all duration-200 cursor-pointer"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={card.action}
                >
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "#00B4D8",
                      fontWeight: 500,
                    }}
                  >
                    {card.num}
                  </span>
                  <h3 className="font-display mt-2 mb-1" style={{ color: "#0F172A", fontSize: 15, fontWeight: 500 }}>
                    {card.title}
                  </h3>
                  <p className="mb-4" style={{ color: "#64748B", fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>
                    {card.desc}
                  </p>
                  <span style={{ color: "#1E3A5F", fontSize: 13, fontWeight: 400, letterSpacing: "0.02em" }}>
                    {card.cta}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hoje */}
        <section className="mb-10">
          <h2 className="font-display mb-4" style={{ color: "#0F172A", fontSize: 16, fontWeight: 500, letterSpacing: "0.01em" }}>
            Hoje
          </h2>

          {todayTasks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-8"
              style={{
                background: "rgba(0,180,216,0.03)",
                border: "1px dashed rgba(0,180,216,0.2)",
                borderRadius: 12,
              }}
            >
              <p className="text-sm" style={{ color: "#94A3B8" }}>
                Nenhuma tarefa para hoje ainda.
              </p>
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors mt-3"
                style={{ color: "#00B4D8" }}
              >
                <Plus size={16} />
                Adicionar tarefa
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                  }}
                >
                  <button
                    onClick={() => toggleTask(task.id, task.concluida)}
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      borderColor: task.concluida ? "#00B4D8" : "#CBD5E1",
                      background: task.concluida ? "#00B4D8" : "transparent",
                    }}
                  >
                    {task.concluida && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: task.concluida ? "#94A3B8" : "#0F172A",
                        textDecoration: task.concluida ? "line-through" : "none",
                      }}
                    >
                      {task.titulo}
                    </p>
                    {task.descricao && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "#94A3B8" }}>
                        {task.descricao}
                      </p>
                    )}
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        task.prioridade === "alta"
                          ? "rgba(239,68,68,0.1)"
                          : task.prioridade === "baixa"
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(245,158,11,0.1)",
                      color:
                        task.prioridade === "alta"
                          ? "#EF4444"
                          : task.prioridade === "baixa"
                          ? "#22C55E"
                          : "#F59E0B",
                    }}
                  >
                    {task.prioridade}
                  </span>
                </div>
              ))}
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors mt-2"
                style={{ color: "#00B4D8" }}
              >
                <Plus size={16} />
                Adicionar tarefa
              </button>
            </div>
          )}
        </section>

        {/* Hábitos */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "#0F172A" }}>
            Hábitos de hoje
          </h2>
          <div
            className="flex flex-col items-center justify-center py-8"
            style={{
              background: "rgba(0,180,216,0.03)",
              border: "1px dashed rgba(0,180,216,0.2)",
              borderRadius: 12,
            }}
          >
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Nenhum hábito configurado.
            </p>
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors mt-3"
              style={{ color: "#00B4D8" }}
            >
              <Plus size={16} />
              Criar hábito
            </button>
          </div>
        </section>
      </div>

      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          onSaved={() => {
            setShowTaskModal(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default DashboardContent;
