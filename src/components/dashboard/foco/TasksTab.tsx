import { useEffect, useState } from "react";
import { useSearchHighlight } from "@/hooks/useSearchHighlight";
import { Plus, Trash2, Pencil, CheckSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddTaskModal from "../AddTaskModal";
import UpgradeBanner from "../UpgradeBanner";
import { usePlanLimits, canCreate } from "@/hooks/usePlanLimits";

interface TasksTabProps {
  isActive?: boolean;
  onReadyChange?: (ready: boolean) => void;
  highlightId?: string | null;
  onHighlightConsumed?: () => void;
}

interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  prioridade: string;
  concluida: boolean;
  goal_id?: string | null;
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

const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const TasksTab = ({ isActive = true, onReadyChange, highlightId = null, onHighlightConsumed }: TasksTabProps) => {
  const { isHighlighted } = useSearchHighlight(highlightId);
  const { user, loading: authLoading } = useAuth();
  const limits = usePlanLimits();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("hoje");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
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
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchTasks();
  }, [authLoading, user, filter]);

  useEffect(() => {
    if (isActive) onReadyChange?.(!authLoading && !loading);
  }, [isActive, authLoading, loading, onReadyChange]);

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

  const handleTaskSaved = () => { setShowModal(false); setEditingTask(null); fetchTasks(); };

  const openEdit = (task: Task) => { setEditingTask(task); setShowModal(true); };
  const totalTasks = tasks.length;
  const atLimit = !canCreate(totalTasks, limits.maxTasks);
  const openCreate = () => {
    if (atLimit) { toast.error(`Limite de ${limits.maxTasks} tarefas atingido. Ative o Plano Fundador para continuar.`); return; }
    setEditingTask(null); setShowModal(true);
  };

  const pending = tasks.filter((t) => !t.concluida);
  const done = tasks.filter((t) => t.concluida);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-9 rounded-full animate-pulse" style={{ width: 84, background: "var(--dash-muted-surface-hover)" }} />
            ))}
          </div>
          <div className="h-9 w-24 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
        </div>
        <div className="h-3 w-40 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
        <div className="space-y-3 rounded-2xl p-4" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl px-2 py-3" style={{ background: "var(--dash-muted-surface)" }}>
              <div className="h-[18px] w-[18px] rounded-md animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/5 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
                <div className="h-3 w-4/5 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
              </div>
              <div className="h-5 w-12 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center justify-between mb-4" data-reveal>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-lg transition-all duration-150 whitespace-nowrap"
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
        <button
          onClick={openCreate}
          disabled={atLimit}
          className="inline-flex items-center gap-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{ border: "1px solid var(--dash-primary)", color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400, padding: "7px 12px" }}
        >
          <Plus size={14} /> Nova
        </button>
      </div>

      {atLimit && <div className="mb-4"><UpgradeBanner message={`Você atingiu o limite de ${limits.maxTasks} tarefas no plano gratuito. Ative o Plano Fundador para criar sem limites.`} compact /></div>}

      <div className="mb-5" style={{ fontSize: 12, color: "var(--dash-text-muted)", fontWeight: 300 }}>
        <span>{pending.length} pendentes</span><span className="mx-1.5">·</span><span>{done.length} concluídas</span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--dash-accent-subtle)" }}>
            <CheckSquare size={20} style={{ color: "var(--dash-accent)" }} />
          </div>
          <p style={{ color: "var(--dash-text)", fontSize: 15, fontWeight: 400, marginBottom: 4 }}>Nenhuma tarefa encontrada</p>
          <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, maxWidth: 240, textAlign: "center", lineHeight: 1.6 }}>
            {filter === "hoje" ? "Seu dia está livre. Adicione tarefas para organizar sua rotina." : "Nenhuma tarefa neste filtro."}
          </p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 mt-6 rounded-lg transition-colors" style={{ background: "var(--dash-gradient-primary)", color: "var(--dash-text)", fontSize: 13, fontWeight: 400, padding: "10px 20px" }}>
            <Plus size={15} /> Criar tarefa
          </button>
        </div>
      ) : (
        <div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
            {/* Pending tasks */}
            {pending.map((task, i) => {
              const ps = priorityStyles[task.prioridade] || priorityStyles.media;
              return (
                <div key={task.id} data-search-id={task.id} className={`flex items-center gap-3 px-5 py-4 group transition-all duration-500 ${isHighlighted(task.id) ? "search-highlight" : ""}`} style={{ borderBottom: i < pending.length - 1 || done.length > 0 ? "1px solid var(--dash-border)" : "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-muted-surface)"; }}
                  onMouseLeave={(e) => { if (!isHighlighted(task.id)) e.currentTarget.style.background = "transparent"; }}
                >
                  <button
                    onClick={() => toggleTask(task.id, task.concluida)}
                    className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all duration-150"
                    style={{ border: "1.5px solid var(--dash-border-strong)", background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--dash-accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--dash-border-strong)"; }}
                  />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(task)}>
                    <p style={{ color: "var(--dash-text)", fontSize: 14, fontWeight: 400 }}>{task.titulo}</p>
                    {task.descricao && <p className="truncate mt-0.5" style={{ color: "var(--dash-text-muted)", fontSize: 12, fontWeight: 300 }}>{task.descricao}</p>}
                  </div>
                  {task.prazo && <span className="hidden md:inline" style={{ fontSize: 11, color: "var(--dash-text-muted)", fontWeight: 300 }}>{new Date(task.prazo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>}
                  <span className="px-2 py-0.5 rounded flex-shrink-0" style={{ fontSize: 10, fontWeight: 400, background: ps.bg, color: ps.color }}>{task.prioridade}</span>
                  <button onClick={() => openEdit(task)} className="p-1 opacity-0 md:group-hover:opacity-60 transition-opacity" style={{ color: "var(--dash-text-muted)" }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-1 md:opacity-0 md:group-hover:opacity-60 opacity-40 transition-opacity" style={{ color: "var(--dash-text-muted)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {/* Done tasks */}
            {done.length > 0 && (
              <>
                <div className="px-5 py-2" style={{ background: "var(--dash-muted-surface)" }}>
                  <p style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 400 }}>{done.length} concluída{done.length > 1 ? "s" : ""}</p>
                </div>
                {done.map((task) => (
                  <div key={task.id} data-search-id={task.id} className={`flex items-center gap-3 px-5 py-3 group ${isHighlighted(task.id) ? "search-highlight" : ""}`} style={{ opacity: 0.4 }}>
                    <button
                      onClick={() => toggleTask(task.id, task.concluida)}
                      className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ background: "var(--dash-accent)", color: "var(--dash-text)" }}
                    >
                      <CheckIcon />
                    </button>
                    <p className="flex-1" style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400, textDecoration: "line-through" }}>{task.titulo}</p>
                    <button onClick={() => deleteTask(task.id)} className="p-1 md:opacity-0 md:group-hover:opacity-100 opacity-60 transition-opacity" style={{ color: "var(--dash-text-muted)" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {showModal && <AddTaskModal onClose={() => { setShowModal(false); setEditingTask(null); }} onSaved={handleTaskSaved} editingTask={editingTask} />}
    </div>
  );
};

export default TasksTab;
