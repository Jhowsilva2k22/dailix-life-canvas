import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HabitModal from "./HabitModal";

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
  saude: { bg: "rgba(16,185,129,0.12)", color: "#34D399", label: "Saude" },
  mental: { bg: "rgba(139,92,246,0.12)", color: "#A78BFA", label: "Mental" },
  sono: { bg: "rgba(30,58,95,0.15)", color: "#60A5FA", label: "Sono" },
  alimentacao: { bg: "rgba(245,158,11,0.12)", color: "#FBBF24", label: "Alimentacao" },
  aprendizado: { bg: "rgba(0,180,216,0.12)", color: "#22D3EE", label: "Aprendizado" },
};

const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const HabitsTab = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => { fetchHabits(); fetchTodayLogs(); }, [fetchHabits, fetchTodayLogs]);
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
    const backup = habits; setHabits((prev) => prev.filter((h) => h.id !== id)); toast.success("Removido");
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) { setHabits(backup); toast.error("Algo deu errado."); }
  };

  const handleHabitSaved = () => { setShowModal(false); fetchHabits(); toast.success("Habito criado"); };

  return (
    <div>
      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
          <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>Nenhum habito criado ainda.</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 mt-3 transition-colors" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}>
            <Plus size={16} /> Criar habito
          </button>
        </div>
      ) : (
        <div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
            {habits.map((habit, i) => {
              const cat = categoryColors[habit.categoria] || categoryColors.saude;
              const done = completedToday.has(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-3 px-5 py-4 group" style={{ borderBottom: i < habits.length - 1 ? "1px solid var(--dash-border)" : "none" }}>
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ border: done ? "none" : "1.5px solid var(--dash-border-strong)", background: done ? "var(--dash-accent)" : "transparent" }}
                  >
                    {done && <CheckIcon />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: "var(--dash-text)", fontSize: 14, fontWeight: 400 }}>{habit.titulo}</p>
                    {habit.descricao && <p className="truncate mt-0.5" style={{ color: "var(--dash-text-muted)", fontSize: 12, fontWeight: 300 }}>{habit.descricao}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 400, background: cat.bg, color: cat.color }}>{cat.label}</span>
                  {habit.streak > 0 && (
                    <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--dash-warning)", fontWeight: 400 }}>
                      <Flame size={12} /> {habit.streak}
                    </span>
                  )}
                  <button onClick={() => deleteHabit(habit.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1" style={{ color: "var(--dash-text-muted)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 mt-3 transition-colors" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, padding: "8px 16px", opacity: 0.8 }}>
            <Plus size={16} /> Novo habito
          </button>
        </div>
      )}
      {showModal && <HabitModal onClose={() => setShowModal(false)} onSaved={handleHabitSaved} />}
    </div>
  );
};

export default HabitsTab;
