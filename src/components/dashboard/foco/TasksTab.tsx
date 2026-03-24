import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import RefreshButton from "../RefreshButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddTaskModal from "../AddTaskModal";

interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  prioridade: string;
  concluida: boolean;
}

const filters = [
  { key: "hoje", label: "Hoje" },
  { key: "semana", label: "Esta semana" },
  { key: "todas", label: "Todas" },
];

const priorityBadge = (p: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    alta: { bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
    media: { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
    baixa: { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
  };
  return map[p] || map.media;
};

const priorityOrder: Record<string, number> = { alta: 0, media: 1, baixa: 2 };

const sortTasks = (list: Task[], mode: string) => {
  return [...list].sort((a, b) => {
    if (mode === "todas") {
      if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
    }
    if (!a.prazo && b.prazo) return -1;
    if (a.prazo && !b.prazo) return 1;
    return (priorityOrder[a.prioridade] ?? 1) - (priorityOrder[b.prioridade] ?? 1);
  });
};

const TasksTab = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("hoje");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(false);
    try {
      const today = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id);

      if (filter === "hoje") {
        query = query.or(`prazo.eq.${today},prazo.is.null`);
      } else if (filter === "semana") {
        const end = new Date();
        end.setDate(end.getDate() + 7);
        const endStr = end.toISOString().split("T")[0];
        query = query
          .eq("concluida", false)
          .or(`and(prazo.gte.${today},prazo.lte.${endStr}),prazo.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks(sortTasks(Array.isArray(data) ? (data as Task[]) : [], filter));
    } catch {
      setFetchError(true);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [user, filter]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const { eventType } = payload;
        if (eventType === 'INSERT') {
          const newTask = payload.new as Task;
          setTasks((prev) => sortTasks([newTask, ...prev], filter));
        } else if (eventType === 'UPDATE') {
          const updated = payload.new as Task;
          setTasks((prev) => sortTasks(prev.map((t) => t.id === updated.id ? updated : t), filter));
        } else if (eventType === 'DELETE') {
          const old = payload.old as { id: string };
          setTasks((prev) => prev.filter((t) => t.id !== old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, filter]);

  const toggleTask = async (id: string, concluida: boolean) => {
    setTasks((prev) => sortTasks(prev.map((t) => (t.id === id ? { ...t, concluida: !concluida } : t)), filter));
    const { error } = await supabase.from("tasks").update({ concluida: !concluida }).eq("id", id);
    if (error) {
      setTasks((prev) => sortTasks(prev.map((t) => (t.id === id ? { ...t, concluida } : t)), filter));
      toast.error("Algo deu errado. Tente novamente.");
    }
  };

  const deleteTask = async (id: string) => {
    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Removido");
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      setTasks(backup);
      toast.error("Algo deu errado. Tente novamente.");
    }
  };

  const handleTaskSaved = () => {
    setShowModal(false);
    fetchTasks();
    toast.success("Tarefa criada");
  };

  const pending = tasks.filter((t) => !t.concluida);
  const done = tasks.filter((t) => t.concluida);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#E2E8F0", borderTopColor: "#00B4D8" }} />
      </div>
    );
  }

  // Error
  if (fetchError) {
    return (
      <div style={{ background: "rgba(239,68,68,0.03)", border: "1px dashed rgba(239,68,68,0.2)", borderRadius: 14 }} className="flex flex-col items-center justify-center py-16">
        <p style={{ color: "#64748B", fontSize: 14, fontWeight: 300 }}>Erro ao carregar tarefas.</p>
        <button onClick={fetchTasks} style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px", marginTop: 12 }}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-2 overflow-x-auto" data-reveal style={{ transitionDelay: "160ms" }}>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              style={{
                fontSize: 13,
                fontWeight: 400,
                background: filter === f.key ? "rgba(0,180,216,0.1)" : "transparent",
                color: filter === f.key ? "#00B4D8" : "#94A3B8",
                border: filter === f.key ? "1px solid rgba(0,180,216,0.3)" : "1px solid transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {/* Counters */}
      <div className="mb-4" data-reveal style={{ transitionDelay: "200ms", fontSize: 12, color: "#94A3B8", fontWeight: 300 }}>
        <span>{pending.length} pendentes</span>
        <span className="mx-1.5">·</span>
        <span>{done.length} concluidas</span>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div
          data-reveal
          style={{ transitionDelay: "240ms", background: "rgba(0,180,216,0.03)", border: "1px dashed rgba(0,180,216,0.2)", borderRadius: 14 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <p style={{ color: "#94A3B8", fontSize: 14, fontWeight: 300 }}>Nenhuma tarefa encontrada.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 mt-3 transition-colors"
            style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}
          >
            <Plus size={16} />
            Adicionar tarefa
          </button>
        </div>
      ) : (
        <div className="space-y-2" data-reveal style={{ transitionDelay: "240ms" }}>
          {/* Pending tasks */}
          {pending.map((task) => {
            const badge = priorityBadge(task.prioridade);
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 group transition-all duration-200"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 }}
              >
                <button
                  onClick={() => toggleTask(task.id, task.concluida)}
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ borderColor: "#CBD5E1", background: "transparent" }}
                >
                </button>
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#0F172A", fontSize: 14, fontWeight: 400 }}>{task.titulo}</p>
                  {task.descricao && <p className="truncate mt-0.5" style={{ color: "#94A3B8", fontSize: 12, fontWeight: 300 }}>{task.descricao}</p>}
                </div>
                {task.prazo && (
                  <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 300 }}>{new Date(task.prazo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                )}
                <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 400, background: badge.bg, color: badge.color }}>
                  {task.prioridade}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  style={{ color: "#94A3B8" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}

          {/* Completed tasks separator */}
          {done.length > 0 && (
            <>
              <div className="my-3" style={{ borderTop: "1px solid #E2E8F0" }} />
              <p style={{ fontSize: 12, color: "#94A3B8", fontWeight: 300 }}>{done.length} concluída{done.length > 1 ? "s" : ""}</p>
              {done.map((task) => {
                const badge = priorityBadge(task.prioridade);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 group transition-all duration-200"
                    style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, opacity: 0.5 }}
                  >
                    <button
                      onClick={() => toggleTask(task.id, task.concluida)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ borderColor: "#00B4D8", background: "#00B4D8" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "#94A3B8", textDecoration: "line-through", fontSize: 14, fontWeight: 400 }}>{task.titulo}</p>
                      {task.descricao && <p className="truncate mt-0.5" style={{ color: "#94A3B8", fontSize: 12, fontWeight: 300 }}>{task.descricao}</p>}
                    </div>
                    {task.prazo && (
                      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 300 }}>{new Date(task.prazo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                    )}
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 400, background: badge.bg, color: badge.color }}>
                      {task.prioridade}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      style={{ color: "#94A3B8" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 mt-2 transition-colors"
            style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}
          >
            <Plus size={16} />
            Nova tarefa
          </button>
        </div>
      )}

      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onSaved={handleTaskSaved}
        />
      )}
    </div>
  );
};

export default TasksTab;
