import { Component, useEffect, useState, useCallback, type ReactNode } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GoalModal, { type Goal } from "./GoalModal";

interface SubTask {
  id: string;
  titulo: string;
  concluida: boolean;
  prioridade: string;
}

/* Error Boundary */
interface EBProps { children: ReactNode }
interface EBState { hasError: boolean }
class GoalsErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>Algo deu errado ao renderizar.</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, padding: "8px 16px", marginTop: 12 }}>Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const statusBadge = (s: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ativa: { bg: "rgba(0,180,216,0.1)", color: "#22D3EE", label: "Ativa" },
    concluida: { bg: "rgba(16,185,129,0.1)", color: "#34D399", label: "Concluida" },
    pausada: { bg: "rgba(148,163,184,0.1)", color: "#94A3B8", label: "Pausada" },
  };
  return map[s] ?? map.ativa;
};

const calcProgress = (tasks: SubTask[]) => {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.concluida).length / tasks.length) * 100);
};

const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const GoalsTabInner = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subTasks, setSubTasks] = useState<Record<string, SubTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true); setFetchError(false);
    try {
      const { data, error } = await supabase.from("goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      const goalsList = Array.isArray(data) ? (data as Goal[]) : [];
      setGoals(goalsList);
      if (goalsList.length > 0) {
        const goalIds = goalsList.map((g) => g.id);
        const { data: tasksData } = await supabase.from("tasks").select("id, titulo, concluida, prioridade, goal_id").eq("user_id", user.id).in("goal_id", goalIds);
        const grouped: Record<string, SubTask[]> = {};
        goalIds.forEach((id) => { grouped[id] = []; });
        (tasksData || []).forEach((t: any) => { if (t.goal_id && grouped[t.goal_id]) grouped[t.goal_id].push({ id: t.id, titulo: t.titulo, concluida: t.concluida, prioridade: t.prioridade }); });
        setSubTasks(grouped);
      }
    } catch { setFetchError(true); setGoals([]); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('goals-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') { const g = payload.new as Goal; setGoals((prev) => [g, ...prev]); setSubTasks((prev) => ({ ...prev, [g.id]: [] })); }
        else if (payload.eventType === 'UPDATE') { const g = payload.new as Goal; setGoals((prev) => prev.map((old) => old.id === g.id ? g : old)); }
        else if (payload.eventType === 'DELETE') { const old = payload.old as { id: string }; setGoals((prev) => prev.filter((g) => g.id !== old.id)); }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, (payload) => {
        const task = (payload.eventType === 'DELETE' ? payload.old : payload.new) as any;
        if (!task.goal_id) return;
        const goalId = task.goal_id;
        if (payload.eventType === 'INSERT') { const st: SubTask = { id: task.id, titulo: task.titulo, concluida: task.concluida, prioridade: task.prioridade }; setSubTasks((prev) => ({ ...prev, [goalId]: [...(prev[goalId] || []), st] })); }
        else if (payload.eventType === 'UPDATE') { setSubTasks((prev) => ({ ...prev, [goalId]: (prev[goalId] || []).map((t) => t.id === task.id ? { id: task.id, titulo: task.titulo, concluida: task.concluida, prioridade: task.prioridade } : t) })); }
        else if (payload.eventType === 'DELETE') { setSubTasks((prev) => ({ ...prev, [goalId]: (prev[goalId] || []).filter((t) => t.id !== task.id) })); }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const toggleSubTask = async (goalId: string, taskId: string, current: boolean) => {
    setSubTasks((prev) => { const u = { ...prev }; u[goalId] = (u[goalId] || []).map((t) => t.id === taskId ? { ...t, concluida: !current } : t); return u; });
    const { error } = await supabase.from("tasks").update({ concluida: !current }).eq("id", taskId);
    if (error) { setSubTasks((prev) => { const u = { ...prev }; u[goalId] = (u[goalId] || []).map((t) => t.id === taskId ? { ...t, concluida: current } : t); return u; }); toast.error("Algo deu errado."); return; }
    const tasks = (subTasks[goalId] || []).map((t) => t.id === taskId ? { ...t, concluida: !current } : t);
    const progress = calcProgress(tasks);
    if (progress === 100) { await supabase.from("goals").update({ status: "concluida", progresso: 100 }).eq("id", goalId); setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, status: "concluida", progresso: 100 } : g)); }
    else { await supabase.from("goals").update({ progresso: progress, status: "ativa" }).eq("id", goalId); setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, progresso: progress, status: progress === 100 ? "concluida" : g.status === "concluida" ? "ativa" : g.status } : g)); }
  };

  const deleteGoal = async (id: string) => {
    const backup = [...goals]; setGoals((prev) => prev.filter((g) => g.id !== id)); setConfirmDelete(null); toast.success("Removido");
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { setGoals(backup); toast.error("Algo deu errado."); }
  };

  const handleSaved = (saved: Goal, isEdit: boolean) => {
    if (isEdit) setGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
    else { setGoals((prev) => [saved, ...prev]); setSubTasks((prev) => ({ ...prev, [saved.id]: [] })); }
    setShowModal(false); setEditing(null);
  };

  const toggleExpand = (id: string) => { setExpanded((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }); };

  if (loading) return <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--dash-border-strong)", borderTopColor: "var(--dash-accent)" }} /></div>;
  if (fetchError) return <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}><p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>Erro ao carregar metas.</p><button onClick={fetchGoals} style={{ color: "var(--dash-accent)", fontSize: 13, padding: "8px 16px", marginTop: 12 }}>Tentar novamente</button></div>;

  if (goals.length === 0) return (
    <div className="relative pb-20">
      <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
        <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>Nenhuma meta criada ainda.</p>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="inline-flex items-center gap-1.5 mt-3" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}><Plus size={16} /> Nova meta</button>
      </div>
      <FloatingButton onClick={() => { setEditing(null); setShowModal(true); }} />
      {showModal && <GoalModal goal={null} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={handleSaved} />}
    </div>
  );

  return (
    <div className="relative pb-20">
      <div className="space-y-3" data-reveal>
        {goals.map((goal) => {
          const badge = statusBadge(goal.status);
          const tasks = subTasks[goal.id] || [];
          const progress = tasks.length > 0 ? calcProgress(tasks) : goal.progresso;
          const doneCount = tasks.filter((t) => t.concluida).length;
          const isExpanded = expanded.has(goal.id);

          return (
            <div key={goal.id} className="transition-all duration-200 rounded-2xl overflow-hidden" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "var(--dash-text)", fontSize: 15, fontWeight: 400 }}>{goal.titulo}</p>
                    {goal.descricao && <p className="mt-1" style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300 }}>{goal.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 400, background: badge.bg, color: badge.color }}>{badge.label}</span>
                    <button onClick={() => { setEditing(goal); setShowModal(true); }} className="p-1 transition-opacity" style={{ color: "var(--dash-text-muted)", opacity: 0.5 }}><Pencil size={13} /></button>
                    <button onClick={() => setConfirmDelete(goal.id)} className="p-1 transition-opacity" style={{ color: "var(--dash-text-muted)", opacity: 0.5 }}><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dash-surface-hover)" }}>
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #1E3A5F, #00B4D8)" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 400, color: "var(--dash-text-secondary)", minWidth: 52, textAlign: "right" }}>{progress}%</span>
                </div>

                {tasks.length > 0 && <p style={{ fontSize: 12, color: "var(--dash-text-muted)", fontWeight: 300 }}>{doneCount} de {tasks.length} tarefas concluidas</p>}
                {goal.data_limite && <p className="mt-1" style={{ fontSize: 12, color: "var(--dash-text-muted)", fontWeight: 300 }}>Prazo: {new Date(goal.data_limite + "T12:00:00").toLocaleDateString("pt-BR")}</p>}

                <button onClick={() => toggleExpand(goal.id)} className="inline-flex items-center gap-1 mt-3 transition-colors" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, opacity: 0.8 }}>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? "Ocultar" : `Tarefas (${tasks.length})`}
                </button>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-0">
                  <div style={{ borderTop: "1px solid var(--dash-border)" }} />
                  <div className="mt-3 space-y-1">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-3 py-2.5">
                        <button
                          onClick={() => toggleSubTask(goal.id, task.id, task.concluida)}
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{ border: task.concluida ? "none" : "1.5px solid var(--dash-border-strong)", background: task.concluida ? "var(--dash-accent)" : "transparent" }}
                        >
                          {task.concluida && <CheckIcon />}
                        </button>
                        <p style={{ color: task.concluida ? "var(--dash-text-muted)" : "var(--dash-text)", textDecoration: task.concluida ? "line-through" : "none", fontSize: 13, fontWeight: 400, flex: 1, opacity: task.concluida ? 0.5 : 1 }}>{task.titulo}</p>
                      </div>
                    ))}
                  </div>
                  <InlineAddTask goalId={goal.id} onAdded={(task) => {
                    setSubTasks((prev) => ({ ...prev, [goal.id]: [...(prev[goal.id] || []), task] }));
                    const updated = [...(subTasks[goal.id] || []), task];
                    const newProgress = calcProgress(updated);
                    supabase.from("goals").update({ progresso: newProgress }).eq("id", goal.id);
                    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, progresso: newProgress } : g));
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <FloatingButton onClick={() => { setEditing(null); setShowModal(true); }} />
      {showModal && <GoalModal goal={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={handleSaved} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "var(--dash-surface-elevated)", border: "1px solid var(--dash-border-strong)", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-2" style={{ color: "var(--dash-text)", fontSize: 16, fontWeight: 400 }}>Deletar meta</h3>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>Essa acao nao pode ser desfeita.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid var(--dash-border-strong)", color: "var(--dash-text-muted)" }}>Cancelar</button>
              <button onClick={() => deleteGoal(confirmDelete)} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid var(--dash-danger)", color: "var(--dash-danger)" }}>Deletar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Inline Add Task */
const InlineAddTask = ({ goalId, onAdded }: { goalId: string; onAdded: (t: SubTask) => void }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("tasks").insert({ user_id: user.id, titulo: titulo.trim(), prioridade, goal_id: goalId }).select("id, titulo, concluida, prioridade").single();
      if (error) throw error;
      onAdded(data as SubTask);
      setTitulo(""); setPrioridade("media"); setOpen(false);
      toast.success("Tarefa criada");
    } catch { toast.error("Algo deu errado."); } finally { setSaving(false); }
  };

  if (!open) return <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 mt-2 transition-colors" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, opacity: 0.8 }}><Plus size={14} /> Adicionar tarefa</button>;

  return (
    <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--dash-border)" }}>
      <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Titulo da tarefa" autoFocus className="w-full px-3 py-2 text-sm rounded-lg outline-none mb-2" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border-strong)", color: "var(--dash-text)" }} onKeyDown={(e) => e.key === "Enter" && save()} />
      <div className="flex items-center gap-2">
        {["alta", "media", "baixa"].map((p) => (
          <button key={p} onClick={() => setPrioridade(p)} className="px-2 py-1 text-xs rounded transition-colors" style={{ border: `1px solid ${prioridade === p ? "var(--dash-accent)" : "var(--dash-border-strong)"}`, background: prioridade === p ? "var(--dash-accent-subtle)" : "transparent", color: prioridade === p ? "var(--dash-accent)" : "var(--dash-text-muted)" }}>{p}</button>
        ))}
        <div className="flex-1" />
        <button onClick={() => setOpen(false)} className="text-xs px-2 py-1" style={{ color: "var(--dash-text-muted)" }}>Cancelar</button>
        <button onClick={save} disabled={!titulo.trim() || saving} className="text-xs px-3 py-1 rounded-lg disabled:opacity-50" style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", color: "white" }}>{saving ? "..." : "Salvar"}</button>
      </div>
    </div>
  );
};

/* Floating Button */
const FloatingButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="fixed bottom-20 md:bottom-8 right-5 md:right-8 flex items-center gap-2 transition-transform hover:-translate-y-0.5 z-40" style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", color: "white", borderRadius: 50, padding: "12px 20px", fontSize: 13, fontWeight: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
    <Plus size={16} /> Nova meta
  </button>
);

const GoalsTab = () => (<GoalsErrorBoundary><GoalsTabInner /></GoalsErrorBoundary>);
export default GoalsTab;
