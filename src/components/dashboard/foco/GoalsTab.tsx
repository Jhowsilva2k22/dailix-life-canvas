import { Component, useEffect, useState, useCallback, type ReactNode } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ---- Types ---- */
interface Goal {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  progresso: number;
  data_limite: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface SubTask {
  id: string;
  titulo: string;
  concluida: boolean;
  prioridade: string;
}

/* ---- Error Boundary ---- */
interface EBProps { children: ReactNode }
interface EBState { hasError: boolean }

class GoalsErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: "rgba(239,68,68,0.03)", border: "1px dashed rgba(239,68,68,0.2)", borderRadius: 14 }} className="flex flex-col items-center justify-center py-16">
          <p style={{ color: "#64748B", fontSize: 14, fontWeight: 300 }}>Algo deu errado ao renderizar.</p>
          <button onClick={() => this.setState({ hasError: false })} style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px", marginTop: 12 }}>Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---- Status Badge ---- */
const statusBadge = (s: string) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ativa: { bg: "rgba(0,180,216,0.1)", color: "#00B4D8", label: "Ativa" },
    concluida: { bg: "rgba(16,185,129,0.1)", color: "#10B981", label: "Concluida" },
    pausada: { bg: "rgba(148,163,184,0.1)", color: "#94A3B8", label: "Pausada" },
  };
  return map[s] ?? map.ativa;
};

/* ---- Calc progress ---- */
const calcProgress = (tasks: SubTask[]) => {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((t) => t.concluida).length / tasks.length) * 100);
};

/* ---- Main ---- */
const GoalsTabInner = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subTasks, setSubTasks] = useState<Record<string, SubTask[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setFetchError(false);
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const goalsList = Array.isArray(data) ? (data as Goal[]) : [];
      setGoals(goalsList);

      // Fetch sub-tasks for all goals
      if (goalsList.length > 0) {
        const goalIds = goalsList.map((g) => g.id);
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("id, titulo, concluida, prioridade, goal_id")
          .eq("user_id", user.id)
          .in("goal_id", goalIds);
        const grouped: Record<string, SubTask[]> = {};
        goalIds.forEach((id) => { grouped[id] = []; });
        (tasksData || []).forEach((t: any) => {
          if (t.goal_id && grouped[t.goal_id]) {
            grouped[t.goal_id].push({ id: t.id, titulo: t.titulo, concluida: t.concluida, prioridade: t.prioridade });
          }
        });
        setSubTasks(grouped);
      }
    } catch {
      setFetchError(true);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  // Realtime: goals
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('goals-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'goals',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const g = payload.new as Goal;
          setGoals((prev) => [g, ...prev]);
          setSubTasks((prev) => ({ ...prev, [g.id]: [] }));
        } else if (payload.eventType === 'UPDATE') {
          const g = payload.new as Goal;
          setGoals((prev) => prev.map((old) => old.id === g.id ? g : old));
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as { id: string };
          setGoals((prev) => prev.filter((g) => g.id !== old.id));
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        // Update sub-tasks when tasks with goal_id change
        const task = (payload.eventType === 'DELETE' ? payload.old : payload.new) as any;
        if (!task.goal_id) return;
        const goalId = task.goal_id;
        if (payload.eventType === 'INSERT') {
          const st: SubTask = { id: task.id, titulo: task.titulo, concluida: task.concluida, prioridade: task.prioridade };
          setSubTasks((prev) => ({ ...prev, [goalId]: [...(prev[goalId] || []), st] }));
        } else if (payload.eventType === 'UPDATE') {
          setSubTasks((prev) => ({
            ...prev,
            [goalId]: (prev[goalId] || []).map((t) => t.id === task.id ? { id: task.id, titulo: task.titulo, concluida: task.concluida, prioridade: task.prioridade } : t),
          }));
        } else if (payload.eventType === 'DELETE') {
          setSubTasks((prev) => ({
            ...prev,
            [goalId]: (prev[goalId] || []).filter((t) => t.id !== task.id),
          }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const toggleSubTask = async (goalId: string, taskId: string, current: boolean) => {
    // Optimistic
    setSubTasks((prev) => {
      const updated = { ...prev };
      updated[goalId] = (updated[goalId] || []).map((t) =>
        t.id === taskId ? { ...t, concluida: !current } : t
      );
      return updated;
    });

    const { error } = await supabase.from("tasks").update({ concluida: !current }).eq("id", taskId);
    if (error) {
      setSubTasks((prev) => {
        const updated = { ...prev };
        updated[goalId] = (updated[goalId] || []).map((t) =>
          t.id === taskId ? { ...t, concluida: current } : t
        );
        return updated;
      });
      toast.error("Algo deu errado. Tente novamente.");
      return;
    }

    // Auto-complete goal if 100%
    const tasks = (subTasks[goalId] || []).map((t) =>
      t.id === taskId ? { ...t, concluida: !current } : t
    );
    const progress = calcProgress(tasks);
    if (progress === 100) {
      await supabase.from("goals").update({ status: "concluida", progresso: 100 }).eq("id", goalId);
      setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, status: "concluida", progresso: 100 } : g));
    } else {
      await supabase.from("goals").update({ progresso: progress, status: "ativa" }).eq("id", goalId);
      setGoals((prev) => prev.map((g) => g.id === goalId ? { ...g, progresso: progress, status: progress === 100 ? "concluida" : g.status === "concluida" ? "ativa" : g.status } : g));
    }
  };

  const deleteGoal = async (id: string) => {
    const backup = [...goals];
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setConfirmDelete(null);
    toast.success("Removido");
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { setGoals(backup); toast.error("Algo deu errado. Tente novamente."); }
  };

  const handleSaved = (saved: Goal, isEdit: boolean) => {
    if (isEdit) {
      setGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
    } else {
      setGoals((prev) => [saved, ...prev]);
      setSubTasks((prev) => ({ ...prev, [saved.id]: [] }));
    }
    setShowModal(false);
    setEditing(null);
  };


  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "#E2E8F0", borderTopColor: "#00B4D8" }} />
      </div>
    );
  }

  /* ---- Error ---- */
  if (fetchError) {
    return (
      <div style={{ background: "rgba(239,68,68,0.03)", border: "1px dashed rgba(239,68,68,0.2)", borderRadius: 14 }} className="flex flex-col items-center justify-center py-16">
        <p style={{ color: "#64748B", fontSize: 14, fontWeight: 300 }}>Erro ao carregar metas.</p>
        <button onClick={fetchGoals} style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px", marginTop: 12 }}>Tentar novamente</button>
      </div>
    );
  }

  /* ---- Header with inline button ---- */
  const headerRow = (
    <div className="flex items-center justify-between mb-4">
      <h2 style={{ color: "#0F172A", fontSize: 16, fontWeight: 500 }}>Metas</h2>
      <button
        onClick={() => { setEditing(null); setShowModal(true); }}
        className="inline-flex items-center gap-1 transition-colors hover:opacity-80"
        style={{ border: "1px solid #1E3A5F", color: "#1E3A5F", background: "transparent", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 400 }}
      >
        <Plus size={14} /> Nova meta
      </button>
    </div>
  );

  /* ---- Empty ---- */
  if (goals.length === 0) {
    return (
      <div>
        {headerRow}
        <div data-reveal style={{ background: "rgba(0,180,216,0.03)", border: "1px dashed rgba(0,180,216,0.2)", borderRadius: 14 }} className="flex flex-col items-center justify-center py-16">
          <p style={{ color: "#94A3B8", fontSize: 14, fontWeight: 300 }}>Nenhuma meta criada ainda.</p>
        </div>
        {showModal && <GoalModal goal={null} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={handleSaved} />}
      </div>
    );
  }

  /* ---- Priority badge helper ---- */
  const prioBadge = (p: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      alta: { bg: "rgba(239,68,68,0.1)", color: "#EF4444", label: "Alta" },
      media: { bg: "rgba(245,158,11,0.1)", color: "#F59E0B", label: "Média" },
      baixa: { bg: "rgba(16,185,129,0.1)", color: "#10B981", label: "Baixa" },
    };
    return map[p] ?? map.media;
  };

  /* ---- List ---- */
  return (
    <div>
      {headerRow}
      <div className="space-y-4" data-reveal>
        {goals.map((goal) => {
          const badge = statusBadge(goal.status);
          const tasks = subTasks[goal.id] || [];
          const progress = tasks.length > 0 ? calcProgress(tasks) : goal.progresso;
          const doneCount = tasks.filter((t) => t.concluida).length;

          return (
            <div key={goal.id} className="transition-all duration-200" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "#0F172A", fontSize: 15, fontWeight: 400 }}>{goal.titulo}</p>
                    {goal.descricao && <p className="mt-1" style={{ color: "#64748B", fontSize: 13, fontWeight: 300 }}>{goal.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontWeight: 400, background: badge.bg, color: badge.color }}>{badge.label}</span>
                    <button onClick={() => { setEditing(goal); setShowModal(true); }} className="p-1" style={{ color: "#94A3B8" }}><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(goal.id)} className="p-1" style={{ color: "#94A3B8" }}><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #1E3A5F, #00B4D8)" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#0F172A", minWidth: 52, textAlign: "right" }}>{progress}% concluido</span>
                </div>

                {tasks.length > 0 && (
                  <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 300 }}>
                    {doneCount} de {tasks.length} tarefas concluidas
                  </p>
                )}

                {goal.data_limite && (
                  <p className="mt-1" style={{ fontSize: 12, color: "#94A3B8", fontWeight: 300 }}>
                    Prazo: {new Date(goal.data_limite + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              {/* Sub-tasks — always visible */}
              <div className="px-5 pb-5 pt-0">
                <div className="border-t" style={{ borderColor: "#E2E8F0" }} />
                <div className="mt-3 space-y-2">
                  {tasks.length === 0 ? (
                    <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 300, fontStyle: "italic" }}>
                      Adicione tarefas para acompanhar o progresso desta meta.
                    </p>
                  ) : (
                    tasks.map((task) => {
                      const pb = prioBadge(task.prioridade);
                      return (
                        <div key={task.id} className="flex items-center gap-3 py-2">
                          <button
                            onClick={() => toggleSubTask(goal.id, task.id, task.concluida)}
                            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{ borderColor: task.concluida ? "#00B4D8" : "#CBD5E1", background: task.concluida ? "#00B4D8" : "transparent" }}
                          >
                            {task.concluida && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </button>
                          <p style={{ color: task.concluida ? "#94A3B8" : "#0F172A", textDecoration: task.concluida ? "line-through" : "none", fontSize: 13, fontWeight: 400, flex: 1 }}>{task.titulo}</p>
                          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 400, background: pb.bg, color: pb.color }}>{pb.label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                <InlineAddTask goalId={goal.id} onAdded={(task) => {
                  setSubTasks((prev) => ({ ...prev, [goal.id]: [...(prev[goal.id] || []), task] }));
                  const updated = [...(subTasks[goal.id] || []), task];
                  const newProgress = calcProgress(updated);
                  supabase.from("goals").update({ progresso: newProgress }).eq("id", goal.id);
                  setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, progresso: newProgress } : g));
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <GoalModal goal={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={handleSaved} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#FFFFFF", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-2" style={{ color: "#0F172A", fontSize: 16, fontWeight: 400 }}>Deletar meta</h3>
            <p style={{ color: "#64748B", fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>Essa acao nao pode ser desfeita. As tarefas vinculadas serao desvinculadas.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 400 }}>Cancelar</button>
              <button onClick={() => deleteGoal(confirmDelete)} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid #EF4444", color: "#EF4444", fontWeight: 400 }}>Deletar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---- Inline Add Task ---- */
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
      const { data, error } = await supabase
        .from("tasks")
        .insert({ user_id: user.id, titulo: titulo.trim(), prioridade, goal_id: goalId })
        .select("id, titulo, concluida, prioridade")
        .single();
      if (error) throw error;
      onAdded(data as SubTask);
      setTitulo("");
      setPrioridade("media");
      setOpen(false);
      toast.success("Tarefa criada");
    } catch {
      toast.error("Algo deu errado. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 mt-2 transition-colors" style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400 }}>
        <Plus size={14} /> Adicionar tarefa a esta meta
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(0,180,216,0.03)", border: "1px solid rgba(0,180,216,0.1)" }}>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Titulo da tarefa"
        autoFocus
        className="w-full px-3 py-2 text-sm rounded-lg outline-none mb-2"
        style={{ border: "1px solid #E2E8F0", color: "#0F172A" }}
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
      <div className="flex items-center gap-2">
        {["alta", "media", "baixa"].map((p) => (
          <button key={p} onClick={() => setPrioridade(p)} className="px-2 py-1 text-xs rounded transition-colors" style={{
            border: `1px solid ${prioridade === p ? "#00B4D8" : "#E2E8F0"}`,
            background: prioridade === p ? "rgba(0,180,216,0.08)" : "transparent",
            color: prioridade === p ? "#00B4D8" : "#94A3B8",
          }}>{p}</button>
        ))}
        <div className="flex-1" />
        <button onClick={() => setOpen(false)} className="text-xs px-2 py-1" style={{ color: "#94A3B8" }}>Cancelar</button>
        <button onClick={save} disabled={!titulo.trim() || saving} className="text-xs px-3 py-1 text-white rounded-lg disabled:opacity-50" style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)" }}>
          {saving ? "..." : "Salvar"}
        </button>
      </div>
    </div>
  );
};

/* ---- Floating Button ---- */
const FloatingButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="fixed bottom-6 right-6 md:absolute md:bottom-0 md:right-0 flex items-center gap-2 text-white transition-transform hover:-translate-y-0.5 z-40" style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", borderRadius: 50, padding: "12px 20px", fontSize: 13, fontWeight: 400, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
    <Plus size={16} /> Nova meta
  </button>
);

/* ---- Goal Modal (no progress slider) ---- */
const GoalModal = ({ goal, onClose, onSaved }: { goal: Goal | null; onClose: () => void; onSaved: (g: Goal, isEdit: boolean) => void }) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState(goal?.titulo ?? "");
  const [descricao, setDescricao] = useState(goal?.descricao ?? "");
  const [dataLimite, setDataLimite] = useState(goal?.data_limite ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    try {
      const payload = { titulo: titulo.trim(), descricao: descricao.trim() || null, data_limite: dataLimite || null };
      if (goal) {
        const { error } = await supabase.from("goals").update(payload).eq("id", goal.id);
        if (error) throw error;
        toast.success("Meta salva");
        onSaved({ ...goal, ...payload } as Goal, true);
      } else {
        const { data, error } = await supabase.from("goals").insert({ ...payload, user_id: user.id, status: "ativa", progresso: 0 }).select().single();
        if (error) throw error;
        toast.success("Meta criada");
        onSaved(data as Goal, false);
      }
    } catch {
      toast.error("Algo deu errado. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#FFFFFF", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-6" style={{ color: "#0F172A", fontWeight: 400 }}>{goal ? "Editar meta" : "Nova meta"}</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Titulo</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Ler 12 livros este ano" className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ border: "1px solid #E2E8F0", color: "#0F172A" }} />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Descricao (opcional)</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none" style={{ border: "1px solid #E2E8F0", color: "#0F172A" }} />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Data limite (opcional)</label>
            <input type="date" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ border: "1px solid #E2E8F0", color: "#0F172A" }} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 400 }}>Cancelar</button>
          <button onClick={save} disabled={!titulo.trim() || saving} className="flex-1 py-2.5 text-sm text-white rounded-lg transition-opacity disabled:opacity-50" style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", fontWeight: 400, letterSpacing: "0.02em" }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---- Export ---- */
const GoalsTab = () => (
  <GoalsErrorBoundary>
    <GoalsTabInner />
  </GoalsErrorBoundary>
);

export default GoalsTab;
