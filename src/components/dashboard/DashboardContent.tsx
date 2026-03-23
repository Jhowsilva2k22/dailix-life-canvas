import { useEffect, useState } from "react";
import { CheckSquare, Flame, TrendingUp, BookOpen, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AddTaskModal from "./AddTaskModal";

interface Profile {
  display_name: string | null;
  first_goal: string | null;
}

interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  prioridade: string;
  concluida: boolean;
}

const DashboardContent = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ display_name: null, first_goal: null });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, first_goal")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });

    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
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

  const completedToday = todayTasks.filter((t) => t.concluida).length;

  const summaryCards = [
    {
      icon: CheckSquare,
      label: "Tarefas hoje",
      value: String(todayTasks.length),
    },
    {
      icon: Flame,
      label: "Sequência",
      value: "0 dias",
    },
    {
      icon: TrendingUp,
      label: "Meta do mês",
      value: profile.first_goal || "Nenhuma definida",
    },
    {
      icon: BookOpen,
      label: "Último conteúdo",
      value: "Nenhum ainda",
    },
  ];

  return (
    <div className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F8FAFC" }}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-20 md:pt-10 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl md:text-[28px] font-bold" style={{ color: "#0F172A" }}>
            Olá, {profile.display_name || "Usuário"}.
          </h1>
          <p className="text-sm mt-1 capitalize" style={{ color: "#64748B" }}>
            {todayStr}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-xl"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <card.icon size={20} style={{ color: "#00B4D8" }} className="mb-3" />
              <p className="text-xs font-medium mb-1" style={{ color: "#64748B" }}>
                {card.label}
              </p>
              <p className="font-display text-lg font-bold truncate" style={{ color: "#0F172A" }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tarefas de hoje */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "#0F172A" }}>
            Tarefas de hoje
          </h2>

          {todayTasks.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 rounded-xl"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
              }}
            >
              <CheckSquare size={40} style={{ color: "rgba(0,0,0,0.15)" }} className="mb-3" />
              <p className="text-sm font-medium" style={{ color: "#0F172A" }}>
                Nenhuma tarefa para hoje.
              </p>
              <p className="text-xs mt-1 mb-4" style={{ color: "#64748B" }}>
                Adicione sua primeira tarefa.
              </p>
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                style={{ background: "#00B4D8" }}
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
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
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

        {/* Hábitos de hoje */}
        <section>
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "#0F172A" }}>
            Hábitos de hoje
          </h2>
          <div
            className="flex flex-col items-center justify-center py-12 rounded-xl"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <p className="text-sm font-medium" style={{ color: "#0F172A" }}>
              Nenhum hábito configurado.
            </p>
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors mt-4"
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
