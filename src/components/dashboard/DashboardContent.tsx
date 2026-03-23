import { useEffect, useState, useCallback } from "react";
import { CheckSquare, Flame, Target, TrendingUp, Plus } from "lucide-react";
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

const getGreeting = (name: string) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Bom dia, ${name}.`;
  if (hour >= 12 && hour < 18) return `Boa tarde, ${name}.`;
  return `Boa noite, ${name}.`;
};

const categoryColors: Record<string, { bg: string; color: string; label: string }> = {
  saude: { bg: "rgba(16,185,129,0.1)", color: "#10B981", label: "Saude" },
  mental: { bg: "rgba(139,92,246,0.1)", color: "#8B5CF6", label: "Mental" },
  sono: { bg: "rgba(30,58,95,0.1)", color: "#1E3A5F", label: "Sono" },
  alimentacao: { bg: "rgba(245,158,11,0.1)", color: "#F59E0B", label: "Alimentacao" },
  aprendizado: { bg: "rgba(0,180,216,0.1)", color: "#00B4D8", label: "Aprendizado" },
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
    supabase
      .from("profiles")
      .select("display_name, first_goal, modules")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
    fetchTasks();
    fetchHabits();
    fetchActiveGoal();
  }, [user]);

  const fetchActiveGoal = async () => {
    if (!user) return;
    const { data: goalsData } = await supabase
      .from("goals")
      .select("id, titulo, progresso, status")
      .eq("user_id", user.id)
      .eq("status", "ativa")
      .order("created_at", { ascending: false })
      .limit(1);
    if (goalsData && goalsData.length > 0) {
      const goal = goalsData[0];
      // Calculate real progress from linked tasks
      const { data: linkedTasks } = await supabase
        .from("tasks")
        .select("concluida")
        .eq("user_id", user.id)
        .eq("goal_id", goal.id);
      if (linkedTasks && linkedTasks.length > 0) {
        const done = linkedTasks.filter((t: any) => t.concluida).length;
        const progress = Math.round((done / linkedTasks.length) * 100);
        setActiveGoal({ ...goal, progresso: progress } as GoalWithProgress);
      } else {
        setActiveGoal(goal as GoalWithProgress);
      }
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
  };

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("habits")
      .select("id, titulo, categoria, streak")
      .eq("user_id", user.id)
      .eq("ativo", true);
    if (data) {
      setHabits(data as Habit[]);
      const best = data.reduce((max: number, h: any) => Math.max(max, h.streak || 0), 0);
      setMaxStreak(best);
    }

    const { data: logs } = await supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("user_id", user.id)
      .eq("data", new Date().toISOString().split("T")[0])
      .eq("concluido", true);
    if (logs) setCompletedHabitsToday(new Set(logs.map((l: any) => l.habit_id)));
  }, [user]);

  const toggleTask = async (id: string, concluida: boolean) => {
    // Optimistic
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, concluida: !concluida } : t)));
    const { error } = await supabase.from("tasks").update({ concluida: !concluida }).eq("id", id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, concluida } : t)));
      toast.error("Algo deu errado. Tente novamente.");
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const isCompleted = completedHabitsToday.has(habitId);

    // Optimistic
    if (isCompleted) {
      setCompletedHabitsToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
    } else {
      setCompletedHabitsToday((prev) => new Set(prev).add(habitId));
    }

    try {
      if (isCompleted) {
        const { error } = await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", user.id).eq("data", today);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user.id, data: today, concluido: true });
        if (error) throw error;
      }
    } catch {
      // Revert
      if (isCompleted) {
        setCompletedHabitsToday((prev) => new Set(prev).add(habitId));
      } else {
        setCompletedHabitsToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
      }
      toast.error("Algo deu errado. Tente novamente.");
    }
  };

  const handleTaskSaved = () => {
    setShowTaskModal(false);
    fetchTasks();
    toast.success("Tarefa criada");
  };

  const todayStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const todayTasks = tasks.filter((t) => {
    if (!t.prazo) return true;
    return t.prazo === today;
  });

  const pendingToday = todayTasks.filter((t) => !t.concluida).length;
  const goalText = profile.first_goal
    ? profile.first_goal.length > 28 ? profile.first_goal.slice(0, 28) + "..." : profile.first_goal
    : "Nenhuma";
  const modulesCount = profile.modules?.length || 0;

  const summaryCards = [
    { icon: CheckSquare, iconColor: "#00B4D8", label: "TAREFAS HOJE", value: String(pendingToday), sub: "pendentes" },
    { icon: Flame, iconColor: "#F59E0B", label: "SEQUENCIA", value: String(maxStreak), sub: "dias seguidos" },
    { icon: Target, iconColor: "#00B4D8", label: "META DO MES", value: goalText, isText: true, sub: "definida por voce" },
    { icon: TrendingUp, iconColor: "#10B981", label: "MODULOS ATIVOS", value: String(modulesCount), sub: "areas organizadas" },
  ];

  const hasNoContent = todayTasks.length === 0 && habits.length === 0;

  const gettingStartedCards = [
    { num: "01", title: "Defina sua primeira tarefa", desc: "Pequenos passos constroem grandes resultados.", cta: "Criar tarefa", action: () => setShowTaskModal(true) },
    { num: "02", title: "Crie um habito", desc: "Consistencia supera intensidade.", cta: "Criar habito", action: () => {} },
    { num: "03", title: "Explore seu conteudo", desc: "Videos selecionados para cada area da sua vida.", cta: "Ver conteudo", action: () => {} },
  ];

  return (
    <div ref={revealRef} className="flex-1 min-h-screen md:ml-[240px]" style={{ background: "#F1F5F9" }}>
      <div style={{ maxWidth: 1200 }} className="mx-auto px-4 md:px-8 pt-20 md:pt-8 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-8" data-reveal style={{ transitionDelay: "0ms" }}>
          <h1 className="font-display" style={{ color: "#0F172A", fontSize: 28, fontWeight: 400 }}>
            {getGreeting(profile.display_name || "Usuario")}
          </h1>
          <p className="mt-1 capitalize" style={{ color: "#94A3B8", fontSize: 13, fontWeight: 300, letterSpacing: "0.03em" }}>
            {todayStr}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {summaryCards.map((card, i) => (
            <div
              key={card.label}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms`, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              className="p-5 transition-all duration-200 cursor-default"
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
            >
              <card.icon size={20} style={{ color: card.iconColor }} className="mb-3" />
              <p className="mb-1" style={{ color: "#94A3B8", fontSize: 11, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                {card.label}
              </p>
              <p className={`truncate leading-tight ${card.isText ? "text-base" : ""}`} style={{ color: "#0F172A", fontSize: card.isText ? 16 : 32, fontWeight: 300 }}>
                {card.value}
              </p>
              <p className="mt-0.5" style={{ color: "#94A3B8", fontSize: 12, fontWeight: 300 }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Por onde comecar */}
        {hasNoContent && (
          <section className="mb-10" data-reveal style={{ transitionDelay: "100ms" }}>
            <h2 className="font-display mb-4" style={{ color: "#0F172A", fontSize: 16, fontWeight: 400, letterSpacing: "0.01em" }}>
              Por onde comecar
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {gettingStartedCards.map((card, i) => (
                <div
                  key={card.num}
                  data-reveal
                  style={{ transitionDelay: `${(i + 1) * 80}ms`, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 }}
                  className="p-6 transition-all duration-200 cursor-pointer"
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  onClick={card.action}
                >
                  <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "#00B4D8", fontWeight: 400 }}>{card.num}</span>
                  <h3 className="font-display mt-2 mb-1" style={{ color: "#0F172A", fontSize: 15, fontWeight: 400 }}>{card.title}</h3>
                  <p className="mb-4" style={{ color: "#64748B", fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>{card.desc}</p>
                  <span style={{ color: "#1E3A5F", fontSize: 13, fontWeight: 400, letterSpacing: "0.02em" }}>{card.cta}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hoje - Tarefas */}
        <section className="mb-10" data-reveal style={{ transitionDelay: "160ms" }}>
          <h2 className="font-display mb-4" style={{ color: "#0F172A", fontSize: 16, fontWeight: 400, letterSpacing: "0.01em" }}>
            Hoje
          </h2>
          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8" style={{ background: "rgba(0,180,216,0.03)", border: "1px dashed rgba(0,180,216,0.2)", borderRadius: 12 }}>
              <p style={{ color: "#94A3B8", fontSize: 14, fontWeight: 300 }}>Nenhuma tarefa para hoje ainda.</p>
              <button onClick={() => setShowTaskModal(true)} className="inline-flex items-center gap-1.5 rounded-lg transition-colors mt-3" style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}>
                <Plus size={16} /> Adicionar tarefa
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 }}>
                  <button
                    onClick={() => toggleTask(task.id, task.concluida)}
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{ borderColor: task.concluida ? "#00B4D8" : "#CBD5E1", background: task.concluida ? "#00B4D8" : "transparent" }}
                  >
                    {task.concluida && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: task.concluida ? "#94A3B8" : "#0F172A", textDecoration: task.concluida ? "line-through" : "none", fontSize: 14, fontWeight: 400 }}>{task.titulo}</p>
                    {task.descricao && <p className="truncate mt-0.5" style={{ color: "#94A3B8", fontSize: 12, fontWeight: 300 }}>{task.descricao}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded-full" style={{
                    fontSize: 10, fontWeight: 400,
                    background: task.prioridade === "alta" ? "rgba(239,68,68,0.1)" : task.prioridade === "baixa" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                    color: task.prioridade === "alta" ? "#EF4444" : task.prioridade === "baixa" ? "#22C55E" : "#F59E0B",
                  }}>
                    {task.prioridade}
                  </span>
                </div>
              ))}
              <button onClick={() => setShowTaskModal(true)} className="inline-flex items-center gap-1.5 rounded-lg transition-colors mt-2" style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}>
                <Plus size={16} /> Adicionar tarefa
              </button>
            </div>
          )}
        </section>

        {/* Habitos de hoje */}
        <section className="mb-10" data-reveal style={{ transitionDelay: "240ms" }}>
          <h2 className="font-display mb-4" style={{ color: "#0F172A", fontSize: 16, fontWeight: 400, letterSpacing: "0.01em" }}>
            Habitos de hoje
          </h2>
          {habits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8" style={{ background: "rgba(0,180,216,0.03)", border: "1px dashed rgba(0,180,216,0.2)", borderRadius: 12 }}>
              <p style={{ color: "#94A3B8", fontSize: 14, fontWeight: 300 }}>Nenhum habito configurado.</p>
              <button className="inline-flex items-center gap-1.5 rounded-lg transition-colors mt-3" style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}>
                <Plus size={16} /> Criar habito
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => {
                const cat = categoryColors[habit.categoria] || categoryColors.saude;
                const done = completedHabitsToday.has(habit.id);
                return (
                  <div key={habit.id} className="flex items-center gap-3 p-4" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 }}>
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{ borderColor: done ? "#00B4D8" : "#CBD5E1", background: done ? "#00B4D8" : "transparent" }}
                    >
                      {done && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: "#0F172A", fontSize: 14, fontWeight: 400 }}>{habit.titulo}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontWeight: 400, background: cat.bg, color: cat.color }}>{cat.label}</span>
                    {habit.streak > 0 && (
                      <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#F59E0B", fontWeight: 400 }}>
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

      {showTaskModal && (
        <AddTaskModal
          onClose={() => setShowTaskModal(false)}
          onSaved={handleTaskSaved}
        />
      )}
    </div>
  );
};

export default DashboardContent;
