import { useEffect, useState, useCallback } from "react";
import { Plus, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { toast } from "sonner";
import AddTaskModal from "./AddTaskModal";

interface Profile {
  display_name: string | null;
  first_goal: string | null;
  modules: string[] | null;
}

interface GoalWithProgress {
  id: string;
  titulo: string;
  progresso: number;
  status: string;
  hasLinkedTasks: boolean;
}

interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  prioridade: string;
  concluida: boolean;
}

interface Habit {
  id: string;
  titulo: string;
  categoria: string;
  streak: number;
}

const capitalize = (s: string) =>
  s.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

const getGreeting = (name: string) => {
  const formatted = capitalize(name);
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Bom dia, ${formatted}`;
  if (hour >= 12 && hour < 18) return `Boa tarde, ${formatted}`;
  return `Boa noite, ${formatted}`;
};

const categoryColors: Record<string, { bg: string; color: string; label: string }> = {
  saude: { bg: "var(--dash-success-bg)", color: "var(--dash-success-text)", label: "Saude" },
  mental: { bg: "var(--dash-purple-bg)", color: "var(--dash-purple-text)", label: "Mental" },
  sono: { bg: "var(--dash-blue-bg)", color: "var(--dash-blue-text)", label: "Sono" },
  alimentacao: { bg: "var(--dash-warning-bg)", color: "var(--dash-warning-text)", label: "Alimentacao" },
  aprendizado: { bg: "var(--dash-accent-subtle)", color: "var(--dash-accent-muted)", label: "Aprendizado" },
};

const priorityStyles: Record<string, { color: string; bg: string }> = {
  alta: { color: "var(--dash-danger-text)", bg: "var(--dash-danger-bg)" },
  media: { color: "var(--dash-warning-text)", bg: "var(--dash-warning-bg)" },
  baixa: { color: "var(--dash-success-text)", bg: "var(--dash-success-bg)" },
};

const DashboardContent = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ display_name: null, first_goal: null, modules: null });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabitsToday, setCompletedHabitsToday] = useState<Set<string>>(new Set());
  const [maxStreak, setMaxStreak] = useState(0);
  const [activeGoal, setActiveGoal] = useState<GoalWithProgress | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const revealRef = useScrollReveal();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, first_goal, modules").eq("user_id", user.id).single().then(({ data }) => { if (data) setProfile(data); });
    fetchTasks();
    fetchHabits();
    fetchActiveGoal();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setTasks((prev) => [payload.new as Task, ...prev]);
        else if (payload.eventType === 'UPDATE') { const t = payload.new as Task; setTasks((prev) => prev.map((old) => old.id === t.id ? t : old)); }
        else if (payload.eventType === 'DELETE') { const old = payload.old as { id: string }; setTasks((prev) => prev.filter((t) => t.id !== old.id)); }
        fetchActiveGoal();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${user.id}` }, (payload) => {
        const todayDate = new Date().toISOString().split("T")[0];
        if (payload.eventType === 'INSERT') { const log = payload.new as any; if (log.data === todayDate && log.concluido) setCompletedHabitsToday((prev) => new Set(prev).add(log.habit_id)); }
        else if (payload.eventType === 'DELETE') { const log = payload.old as any; if (log.data === todayDate) setCompletedHabitsToday((prev) => { const s = new Set(prev); s.delete(log.habit_id); return s; }); }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setHabits((prev) => [payload.new as Habit, ...prev]);
        else if (payload.eventType === 'UPDATE') { const h = payload.new as Habit; setHabits((prev) => prev.map((old) => old.id === h.id ? h : old)); }
        else if (payload.eventType === 'DELETE') { const old = payload.old as { id: string }; setHabits((prev) => prev.filter((h) => h.id !== old.id)); }
        setHabits((prev) => { setMaxStreak(prev.reduce((max, h) => Math.max(max, h.streak || 0), 0)); return prev; });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, () => { fetchActiveGoal(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchActiveGoal = async () => {
    if (!user) return;
    const { data: goalsData } = await supabase.from("goals").select("id, titulo, progresso, status").eq("user_id", user.id).eq("status", "ativa").order("created_at", { ascending: false }).limit(1);
    if (goalsData && goalsData.length > 0) {
      const goal = goalsData[0];
      const { data: linkedTasks } = await supabase.from("tasks").select("concluida").eq("user_id", user.id).eq("goal_id", goal.id);
      if (linkedTasks && linkedTasks.length > 0) {
        const done = linkedTasks.filter((t: any) => t.concluida).length;
        const progress = Math.round((done / linkedTasks.length) * 100);
        setActiveGoal({ ...goal, progresso: progress, hasLinkedTasks: true } as GoalWithProgress);
      } else {
        setActiveGoal({ ...goal, progresso: 0, hasLinkedTasks: false } as GoalWithProgress);
      }
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
  };

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("habits").select("id, titulo, categoria, streak").eq("user_id", user.id).eq("ativo", true);
    if (data) { setHabits(data as Habit[]); setMaxStreak(data.reduce((max: number, h: any) => Math.max(max, h.streak || 0), 0)); }
    const { data: logs } = await supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).eq("data", new Date().toISOString().split("T")[0]).eq("concluido", true);
    if (logs) setCompletedHabitsToday(new Set(logs.map((l: any) => l.habit_id)));
  }, [user]);

  const toggleTask = async (id: string, concluida: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, concluida: !concluida } : t)));
    const { error } = await supabase.from("tasks").update({ concluida: !concluida }).eq("id", id);
    if (error) { setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, concluida } : t))); toast.error("Algo deu errado."); }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const isCompleted = completedHabitsToday.has(habitId);
    if (isCompleted) setCompletedHabitsToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
    else setCompletedHabitsToday((prev) => new Set(prev).add(habitId));
    try {
      if (isCompleted) { const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", user.id).eq("data", today); if (error) throw error; }
      else { const { error } = await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user.id, data: today, concluido: true }); if (error) throw error; }
    } catch {
      if (isCompleted) setCompletedHabitsToday((prev) => new Set(prev).add(habitId));
      else setCompletedHabitsToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
      toast.error("Algo deu errado.");
    }
  };

  const handleTaskSaved = () => { setShowTaskModal(false); fetchTasks(); toast.success("Tarefa criada"); };

  const todayStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const todayTasks = tasks.filter((t) => !t.prazo || t.prazo === today);
  const pendingToday = todayTasks.filter((t) => !t.concluida).length;
  const pendingTasks = todayTasks.filter((t) => !t.concluida);
  const doneTasks = todayTasks.filter((t) => t.concluida);

  const goalTitle = activeGoal ? (activeGoal.titulo.length > 24 ? activeGoal.titulo.slice(0, 24) + "…" : activeGoal.titulo) : profile.first_goal ? (profile.first_goal.length > 24 ? profile.first_goal.slice(0, 24) + "…" : profile.first_goal) : "—";
  const goalProgress = activeGoal?.progresso ?? 0;
  const goalHasLinkedTasks = activeGoal?.hasLinkedTasks ?? false;

  const hasNoContent = todayTasks.length === 0 && habits.length === 0;

  const CheckIcon = () => <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

  return (
    <div ref={revealRef} className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "var(--dash-bg)" }}>
      <div style={{ maxWidth: 960 }} className="mx-auto px-5 md:px-10 pt-20 md:pt-10 pb-24 md:pb-12">

        {/* Greeting */}
        <div className="mb-10" data-reveal>
          <h1 className="font-display" style={{ color: "var(--dash-text)", fontSize: 28, fontWeight: 400 }}>
            {getGreeting(profile.display_name || "Usuario")}
          </h1>
          <p className="mt-1.5 capitalize" style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, letterSpacing: "0.03em" }}>
            {todayStr}
          </p>
        </div>

        {/* Metrics strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 mb-12 rounded-2xl overflow-hidden" data-reveal style={{ border: "1px solid var(--dash-border)", background: "var(--dash-surface)" }}>
          <div className="p-6" style={{ borderBottom: "1px solid var(--dash-border)", borderRight: "none" }}>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Tarefas pendentes</p>
            <p className="mt-1" style={{ color: "var(--dash-text)", fontSize: 28, fontWeight: 300 }}>{pendingToday}</p>
            <p style={{ color: "var(--dash-text-secondary)", fontSize: 12, fontWeight: 300 }}>para hoje</p>
          </div>
          <div className="p-6" style={{ borderBottom: "1px solid var(--dash-border)", borderLeft: "none", borderRight: "none" }}>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Sequência</p>
            <p className="mt-1" style={{ color: "var(--dash-text)", fontSize: 28, fontWeight: 300 }}>{maxStreak}</p>
            <p style={{ color: "var(--dash-text-secondary)", fontSize: 12, fontWeight: 300 }}>dias seguidos</p>
          </div>
          <div className="p-6" style={{ borderBottom: "none" }}>
            <p style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Meta ativa</p>
            <p className="mt-1 truncate" style={{ color: "var(--dash-text)", fontSize: 15, fontWeight: 400 }}>{goalTitle}</p>
            {goalHasLinkedTasks ? (
              <>
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--dash-surface-hover)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${goalProgress}%`, background: "var(--dash-gradient-bar)" }} />
                </div>
                <p className="mt-1" style={{ color: "var(--dash-text-secondary)", fontSize: 12, fontWeight: 300 }}>{goalProgress}% concluido</p>
              </>
            ) : (
              <p style={{ color: "var(--dash-text-muted)", fontSize: 12, fontWeight: 300 }}>Sem tarefas vinculadas</p>
            )}
          </div>
        </div>

        {/* CSS for md+ borders */}
        <style>{`
          @media (min-width: 768px) {
            .dashboard-shell .grid.grid-cols-1.md\\:grid-cols-3 > div { border-bottom: none !important; }
            .dashboard-shell .grid.grid-cols-1.md\\:grid-cols-3 > div:not(:last-child) { border-right: 1px solid var(--dash-border) !important; }
          }
        `}</style>

        {/* Getting Started */}
        {hasNoContent && (
          <section className="mb-12" data-reveal>
            <p className="mb-4" style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
              Por onde começar
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { num: "01", title: "Defina sua primeira tarefa", desc: "Pequenos passos constroem grandes resultados.", action: () => setShowTaskModal(true) },
                { num: "02", title: "Crie um habito", desc: "Consistencia supera intensidade.", action: () => {} },
                { num: "03", title: "Explore seus modulos", desc: "Organize cada area da sua vida.", action: () => {} },
              ].map((card) => (
                <div
                  key={card.num}
                  className="p-5 cursor-pointer transition-colors"
                  style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: 14 }}
                  onClick={card.action}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-surface-elevated)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--dash-surface)"; }}
                >
                  <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "var(--dash-accent)", fontWeight: 400, opacity: 0.7 }}>{card.num}</span>
                  <h3 className="font-display mt-2 mb-1" style={{ color: "var(--dash-text)", fontSize: 14, fontWeight: 400 }}>{card.title}</h3>
                  <p style={{ color: "var(--dash-text-muted)", fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today - Tasks */}
        <section className="mb-12" data-reveal>
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Hoje</span>
            <button onClick={() => setShowTaskModal(true)} className="transition-colors" style={{ color: "var(--dash-accent)", fontSize: 13, fontWeight: 400, opacity: 0.8 }}>
              <Plus size={14} className="inline mr-1" style={{ verticalAlign: "-2px" }} />Adicionar
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
              <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>Nenhuma tarefa para hoje.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
              {pendingTasks.map((task, i) => {
                const ps = priorityStyles[task.prioridade] || priorityStyles.media;
                return (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: i < pendingTasks.length - 1 || doneTasks.length > 0 ? "1px solid var(--dash-border)" : "none" }}>
                    <button
                      onClick={() => toggleTask(task.id, task.concluida)}
                      className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ border: "1.5px solid var(--dash-border-strong)", background: "transparent" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "var(--dash-text)", fontSize: 14, fontWeight: 400 }}>{task.titulo}</p>
                      {task.descricao && <p className="truncate mt-0.5" style={{ color: "var(--dash-text-muted)", fontSize: 12, fontWeight: 300 }}>{task.descricao}</p>}
                    </div>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 400, background: ps.bg, color: ps.color }}>
                      {task.prioridade}
                    </span>
                  </div>
                );
              })}
              {doneTasks.length > 0 && (
                <>
                  <div className="px-5 py-2" style={{ background: "var(--dash-muted-surface)" }}>
                    <p style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 400 }}>{doneTasks.length} concluída{doneTasks.length > 1 ? "s" : ""}</p>
                  </div>
                  {doneTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-5 py-3" style={{ opacity: 0.4 }}>
                      <button
                        onClick={() => toggleTask(task.id, task.concluida)}
                        className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--dash-accent)", color: "var(--dash-text)" }}
                      >
                        <CheckIcon />
                      </button>
                      <p style={{ color: "var(--dash-text-secondary)", fontSize: 13, fontWeight: 400, textDecoration: "line-through" }}>{task.titulo}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </section>

        {/* Habits */}
        <section className="mb-12" data-reveal>
          <div className="flex items-center justify-between mb-4">
            <span style={{ color: "var(--dash-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>Habitos</span>
          </div>
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
              <p style={{ color: "var(--dash-text-muted)", fontSize: 14, fontWeight: 300 }}>Nenhum habito configurado.</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>
              {habits.map((habit, i) => {
                const cat = categoryColors[habit.categoria] || categoryColors.saude;
                const done = completedHabitsToday.has(habit.id);
                return (
                  <div key={habit.id} className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: i < habits.length - 1 ? "1px solid var(--dash-border)" : "none" }}>
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ border: done ? "none" : "1.5px solid var(--dash-border-strong)", background: done ? "var(--dash-accent)" : "transparent", color: "var(--dash-text)" }}
                    >
                      {done && <CheckIcon />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "var(--dash-text)", fontSize: 14, fontWeight: 400 }}>{habit.titulo}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: 10, fontWeight: 400, background: cat.bg, color: cat.color }}>{cat.label}</span>
                    {habit.streak > 0 && (
                      <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--dash-warning-text)", fontWeight: 400 }}>
                        <Flame size={12} /> {habit.streak}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} onSaved={handleTaskSaved} />}
    </div>
  );
};

export default DashboardContent;
