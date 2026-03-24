import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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

const priorityOrder: Record<string, number> = { alta: 0, media: 1, baixa: 2 };

const priorityStyles: Record<string, { color: string; bg: string }> = {
  alta: { color: "var(--dash-danger-text)", bg: "var(--dash-danger-bg)" },
  media: { color: "var(--dash-warning-text)", bg: "var(--dash-warning-bg)" },
  baixa: { color: "var(--dash-success-text)", bg: "var(--dash-success-bg)" },
};

const sortTasks = (list: Task[], mode: string) => {
  return [...list].sort((a, b) => {
    if (mode === "todas") { if (a.concluida !== b.concluida) return a.concluida ? 1 : -1; }
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

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      let query = supabase.from("tasks").select("*").eq("user_id", user.id);
      if (filter === "hoje") query = query.or(`prazo.eq.${today},prazo.is.null`);
      else if (filter === "semana") {
        const end = new Date(); end.setDate(end.getDate() + 7); const endStr = end.toISOString().split("T")[0];
        query = query.eq("concluida", false).or(`and(prazo.gte.${today},prazo.lte.${endStr}),prazo.is.null`);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data) setTasks(sortTasks(data as Task[], filter));
    } catch { toast.error("Algo deu errado."); }
  };

  useEffect(() => { fetchTasks(); }, [user, filter]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setTasks((prev) => sortTasks([payload.new as Task, ...prev], filter));
        else if (payload.eventType === 'UPDATE') setTasks((prev) => sortTasks(prev.map((t) => t.id === (payload.new as Task).id ? payload.new as Task : t), filter));
        else if (payload.eventType === 'DELETE') setTasks((prev) => prev.filter((t) => t.id !== (payload.old as { id: string }).id));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, filter]);

  const toggleTask = async (id: string, concluida: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, concluida: !concluida } : t)));
    const { error } = await supabase.from("tasks").update({ concluida: !concluida }).eq("id", id);
    if (error) { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, concluida } : t))); toast.error("Algo deu errado."); }
  };

  const deleteTask = async (id: string) => {
    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Removido");
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { setTasks(backup); toast.error("Algo deu errado."); }
  };

  const handleTaskSaved = () => { setShowModal(false); fetchTasks(); toast.success("Tarefa criada"); };

  const pending = tasks.filter((t) => !t.concluida).length;
  const done = tasks.filter((t) => t.concluida).length;

  const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

  return (
    <div>
      {/* Filters */}
      <div className="mb-3 overflow-x-auto" data-reveal>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              style={{
                fontSize: 13, fontWeight: 400,
                background: filter === f.key ? "var(--dash-accent-subtle)" : "transparent",
                color: filter === f.key ? "var(--dash-accent)" : "var(--dash-text-muted)",
                border: filter === f.key ? "1px solid var(--dash-accent-subtle)" : "1px solid transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5" style={{ fontSize: 12, color: "var(--dash-text-muted)", fontWeight: 300 }}>
        <span>{pending} pendentes</span><span className="mx-1.5">·</span><span>{done} concluidas</span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>Nenhuma tarefa encontrada.</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 mt-3 transition-colors" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}>
            <Plus size={16} /> Adicionar tarefa
          </button>
        </div>
      ) : (
        <div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
            {tasks.map((task, i) => {
              const ps = priorityStyles[task.prioridade] || priorityStyles.media;
              return (
                <div key={task.id} className="flex items-center gap-3 px-5 py-4 group" style={{ borderBottom: i < tasks.length - 1 ? "1px solid var(--dash-border)" : "none", opacity: task.concluida ? 0.4 : 1 }}>
                  <button
                    onClick={() => toggleTask(task.id, task.concluida)}
                    className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ border: task.concluida ? "none" : "1.5px solid var(--dash-border-strong)", background: task.concluida ? "var(--dash-accent)" : "transparent", color: "var(--dash-text)" }}
                  >
                    {task.concluida && <CheckIcon />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: task.concluida ? "var(--dash-text-muted)" : "var(--dash-text)", textDecoration: task.concluida ? "line-through" : "none", fontSize: 14, fontWeight: 400 }}>{task.titulo}</p>
                    {task.descricao && <p className="truncate mt-0.5" style={{ color: "var(--dash-text-muted)", fontSize: 12, fontWeight: 300 }}>{task.descricao}</p>}
                  </div>
                  {task.prazo && <span style={{ fontSize: 12, color: "var(--dash-text-muted)", fontWeight: 300 }}>{new Date(task.prazo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>}
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 400, background: ps.bg, color: ps.color }}>{task.prioridade}</span>
                  <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1" style={{ color: "var(--dash-text-muted)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 mt-3 transition-colors" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, padding: "8px 16px", opacity: 0.8 }}>
            <Plus size={16} /> Nova tarefa
          </button>
        </div>
      )}

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} onSaved={handleTaskSaved} />}
    </div>
  );
};

export default TasksTab;
