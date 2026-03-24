import { useEffect, useState, useCallback } from "react";
import { useSearchHighlight } from "@/hooks/useSearchHighlight";
import { Plus, Trash2, Flame, Pencil, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HabitModal from "./HabitModal";

interface HabitsTabProps {
  isActive?: boolean;
  onReadyChange?: (ready: boolean) => void;
  highlightId?: string | null;
  onHighlightConsumed?: () => void;
}

interface Habit {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  frequencia: string;
  streak: number;
  ativo: boolean;
}

const categoryColors: Record<string, { bg: string; color: string; label: string }> = {
  saude: { bg: "var(--dash-success-bg)", color: "var(--dash-success-text)", label: "Saúde" },
  mental: { bg: "var(--dash-purple-bg)", color: "var(--dash-purple-text)", label: "Mental" },
  sono: { bg: "var(--dash-blue-bg)", color: "var(--dash-blue-text)", label: "Sono" },
  alimentacao: { bg: "var(--dash-warning-bg)", color: "var(--dash-warning-text)", label: "Alimentação" },
  aprendizado: { bg: "var(--dash-accent-subtle)", color: "var(--dash-accent-muted)", label: "Aprendizado" },
};

const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const HabitsTab = ({ isActive = true, onReadyChange, highlightId = null, onHighlightConsumed }: HabitsTabProps) => {
  const { isHighlighted } = useSearchHighlight(highlightId);
  const { user, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from("habits").select("*").eq("user_id", user.id).eq("ativo", true).order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setHabits(data as Habit[]);
    } catch { toast.error("Algo deu errado."); }
  }, [user]);

  const fetchTodayLogs = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).eq("data", today).eq("concluido", true);
      if (data) setCompletedToday(new Set(data.map((l: any) => l.habit_id)));
    } catch { /* silent */ }
  }, [user, today]);

  const calcStreak = useCallback(async (habitId: string): Promise<number> => {
    if (!user) return 0;
    const { data } = await supabase.from("habit_logs").select("data").eq("habit_id", habitId).eq("user_id", user.id).eq("concluido", true).order("data", { ascending: false }).limit(365);
    if (!data || data.length === 0) return 0;
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split("T")[0];
      if (data.some((l: any) => l.data === dateStr)) { streak++; } else if (i > 0) { break; } else { d.setDate(d.getDate() - 1); continue; }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [user]);

  const refreshStreaks = useCallback(async () => {
    const updated = await Promise.all(habits.map(async (h) => {
      const streak = await calcStreak(h.id);
      if (streak !== h.streak) await supabase.from("habits").update({ streak }).eq("id", h.id);
      return { ...h, streak };
    }));
    setHabits(updated);
  }, [habits, calcStreak]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) return;
      setLoading(true);
      await Promise.all([fetchHabits(), fetchTodayLogs()]);
      if (!cancelled) setLoading(false);
    };

    if (authLoading || !user) return;
    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, fetchHabits, fetchTodayLogs]);

  useEffect(() => {
    if (isActive) onReadyChange?.(!authLoading && !loading);
  }, [isActive, authLoading, loading, onReadyChange]);

  useEffect(() => { if (habits.length > 0) refreshStreaks(); }, [habits.length]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('habits-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setHabits((prev) => [payload.new as Habit, ...prev]);
        else if (payload.eventType === 'UPDATE') { const h = payload.new as Habit; setHabits((prev) => prev.map((old) => old.id === h.id ? h : old)); }
        else if (payload.eventType === 'DELETE') { const old = payload.old as { id: string }; setHabits((prev) => prev.filter((h) => h.id !== old.id)); }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') { const log = payload.new as any; if (log.data === today && log.concluido) setCompletedToday((prev) => new Set(prev).add(log.habit_id)); }
        else if (payload.eventType === 'DELETE') { const log = payload.old as any; if (log.data === today) setCompletedToday((prev) => { const s = new Set(prev); s.delete(log.habit_id); return s; }); }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, today]);

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const isCompleted = completedToday.has(habitId);
    if (isCompleted) setCompletedToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
    else setCompletedToday((prev) => new Set(prev).add(habitId));
    try {
      if (isCompleted) { const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", user.id).eq("data", today); if (error) throw error; }
      else { const { error } = await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user.id, data: today, concluido: true }); if (error) throw error; }
    } catch {
      if (isCompleted) setCompletedToday((prev) => new Set(prev).add(habitId));
      else setCompletedToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
      toast.error("Algo deu errado.");
    }
  };

  const deleteHabit = async (id: string) => {
    const backup = habits;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setConfirmDelete(null);
    toast.success("Hábito removido");
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) { setHabits(backup); toast.error("Algo deu errado."); }
  };

  const handleSaved = () => { setShowModal(false); setEditingHabit(null); fetchHabits(); };
  const openCreate = () => { setEditingHabit(null); setShowModal(true); };
  const openEdit = (habit: Habit) => { setEditingHabit(habit); setShowModal(true); };

  const doneCount = habits.filter((h) => completedToday.has(h.id)).length;

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
            <div className="h-4 w-px" style={{ background: "var(--dash-border)" }} />
            <div className="h-5 w-16 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
          </div>
          <div className="h-9 w-24 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
        </div>
        <div className="space-y-3 rounded-2xl p-4" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl px-2 py-3" style={{ background: "var(--dash-muted-surface)" }}>
              <div className="h-[18px] w-[18px] rounded-md animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/5 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
                <div className="h-3 w-3/5 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
              </div>
              <div className="h-5 w-14 rounded-full animate-pulse" style={{ background: "var(--dash-muted-surface-hover)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        {habits.length > 0 && (
          <div className="flex items-center gap-4">
            <div>
              <span style={{ color: "var(--dash-text)", fontSize: 18, fontWeight: 500 }}>{habits.length}</span>
              <span className="ml-1" style={{ color: "var(--dash-text-muted)", fontSize: 12, fontWeight: 300 }}>hábitos</span>
            </div>
            <div style={{ width: 1, height: 16, background: "var(--dash-border)" }} />
            <div>
              <span style={{ color: "var(--dash-accent)", fontSize: 14, fontWeight: 500 }}>{doneCount}</span>
              <span className="ml-1" style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 300 }}>hoje</span>
            </div>
          </div>
        )}
        {habits.length > 0 && (
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-lg transition-colors" style={{ border: "1px solid var(--dash-primary)", color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400, padding: "7px 12px" }}>
            <Plus size={14} /> Novo
          </button>
        )}
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--dash-accent-subtle)" }}>
            <Heart size={20} style={{ color: "var(--dash-accent)" }} />
          </div>
          <p style={{ color: "var(--dash-text)", fontSize: 15, fontWeight: 400, marginBottom: 4 }}>Nenhum hábito configurado</p>
          <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, maxWidth: 260, textAlign: "center", lineHeight: 1.6 }}>
            Hábitos consistentes constroem resultados duradouros. Comece com algo simples.
          </p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 mt-6 rounded-lg transition-colors" style={{ background: "var(--dash-gradient-primary)", color: "var(--dash-text)", fontSize: 13, fontWeight: 400, padding: "10px 20px" }}>
            <Plus size={15} /> Criar primeiro hábito
          </button>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          {habits.map((habit, i) => {
            const cat = categoryColors[habit.categoria] || categoryColors.saude;
            const done = completedToday.has(habit.id);
            return (
              <div key={habit.id} data-search-id={habit.id} className={`flex items-center gap-3 px-5 py-4 group transition-all duration-500 ${isHighlighted(habit.id) ? "search-highlight" : ""}`} style={{ borderBottom: i < habits.length - 1 ? "1px solid var(--dash-border)" : "none" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-muted-surface)"; }}
                onMouseLeave={(e) => { if (!isHighlighted(habit.id)) e.currentTarget.style.background = "transparent"; }}
              >
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    border: done ? "none" : "1.5px solid var(--dash-border-strong)",
                    background: done ? "var(--dash-accent)" : "transparent",
                    color: "var(--dash-text)",
                    transform: done ? "scale(1)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => { if (!done) e.currentTarget.style.borderColor = "var(--dash-accent)"; }}
                  onMouseLeave={(e) => { if (!done) e.currentTarget.style.borderColor = "var(--dash-border-strong)"; }}
                >
                  {done && <CheckIcon />}
                </button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(habit)}>
                  <p style={{ color: done ? "var(--dash-text-muted)" : "var(--dash-text)", fontSize: 14, fontWeight: 400, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>{habit.titulo}</p>
                  {habit.descricao && <p className="truncate mt-0.5" style={{ color: "var(--dash-text-muted)", fontSize: 12, fontWeight: 300 }}>{habit.descricao}</p>}
                </div>
                <span className="px-2 py-0.5 rounded flex-shrink-0" style={{ fontSize: 10, fontWeight: 400, background: cat.bg, color: cat.color }}>{cat.label}</span>
                {habit.streak > 0 && (
                  <span className="flex items-center gap-1 flex-shrink-0" style={{ fontSize: 12, color: "var(--dash-warning-text)", fontWeight: 400 }}>
                    <Flame size={12} /> {habit.streak}
                  </span>
                )}
                <button onClick={() => openEdit(habit)} className="p-1 opacity-0 md:group-hover:opacity-60 transition-opacity" style={{ color: "var(--dash-text-muted)" }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => setConfirmDelete(habit.id)} className="p-1 md:opacity-0 md:group-hover:opacity-60 opacity-40 transition-opacity" style={{ color: "var(--dash-text-muted)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <HabitModal onClose={() => { setShowModal(false); setEditingHabit(null); }} onSaved={handleSaved} editingHabit={editingHabit} />}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "var(--dash-overlay)" }} onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-150" style={{ background: "var(--dash-surface-elevated)", border: "1px solid var(--dash-border-strong)", boxShadow: "var(--dash-shadow-modal)" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-2" style={{ color: "var(--dash-text)", fontSize: 16, fontWeight: 400 }}>Remover hábito</h3>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>Essa ação não pode ser desfeita. O histórico será mantido.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 text-sm rounded-lg active:scale-[0.98]" style={{ border: "1px solid var(--dash-border-strong)", color: "var(--dash-text-muted)" }}>Cancelar</button>
              <button onClick={() => deleteHabit(confirmDelete)} className="flex-1 py-2.5 text-sm rounded-lg active:scale-[0.98]" style={{ border: "1px solid var(--dash-danger-text)", color: "var(--dash-danger-text)" }}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsTab;
