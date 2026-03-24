import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  saude: { bg: "rgba(16,185,129,0.1)", color: "#10B981", label: "Saude" },
  mental: { bg: "rgba(139,92,246,0.1)", color: "#8B5CF6", label: "Mental" },
  sono: { bg: "rgba(30,58,95,0.1)", color: "#1E3A5F", label: "Sono" },
  alimentacao: { bg: "rgba(245,158,11,0.1)", color: "#F59E0B", label: "Alimentacao" },
  aprendizado: { bg: "rgba(0,180,216,0.1)", color: "#00B4D8", label: "Aprendizado" },
};

const HabitsTab = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchHabits = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .eq("ativo", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setHabits(data as Habit[]);
    } catch {
      toast.error("Algo deu errado. Tente novamente.");
    }
  }, [user]);

  const fetchTodayLogs = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("habit_logs")
        .select("habit_id")
        .eq("user_id", user.id)
        .eq("data", today)
        .eq("concluido", true);
      if (data) setCompletedToday(new Set(data.map((l: any) => l.habit_id)));
    } catch { /* silent */ }
  }, [user, today]);

  const calcStreak = useCallback(async (habitId: string): Promise<number> => {
    if (!user) return 0;
    const { data } = await supabase
      .from("habit_logs")
      .select("data")
      .eq("habit_id", habitId)
      .eq("user_id", user.id)
      .eq("concluido", true)
      .order("data", { ascending: false })
      .limit(365);
    if (!data || data.length === 0) return 0;

    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split("T")[0];
      if (data.some((l: any) => l.data === dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      } else {
        d.setDate(d.getDate() - 1);
        continue;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [user]);

  useEffect(() => { fetchHabits(); fetchTodayLogs(); }, [fetchHabits, fetchTodayLogs]);

  // Refresh streaks once after initial load
  useEffect(() => {
    if (habits.length > 0) {
      let mounted = true;
      const doRefresh = async () => {
        const updated = await Promise.all(
          habits.map(async (h) => {
            const streak = await calcStreak(h.id);
            if (streak !== h.streak) {
              await supabase.from("habits").update({ streak }).eq("id", h.id);
            }
            return { ...h, streak };
          })
        );
        if (mounted) setHabits(updated);
      };
      doRefresh();
      return () => { mounted = false; };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('habits-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habits',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setHabits((prev) => [payload.new as Habit, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const h = payload.new as Habit;
          setHabits((prev) => prev.map((old) => old.id === h.id ? h : old));
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as { id: string };
          setHabits((prev) => prev.filter((h) => h.id !== old.id));
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habit_logs',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const log = payload.new as any;
          if (log.data === today && log.concluido) {
            setCompletedToday((prev) => new Set(prev).add(log.habit_id));
          }
        } else if (payload.eventType === 'DELETE') {
          const log = payload.old as any;
          if (log.data === today) {
            setCompletedToday((prev) => { const s = new Set(prev); s.delete(log.habit_id); return s; });
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, today]);

  const toggleHabit = async (habitId: string) => {
    if (!user) return;
    const isCompleted = completedToday.has(habitId);

    // Optimistic
    if (isCompleted) {
      setCompletedToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
    } else {
      setCompletedToday((prev) => new Set(prev).add(habitId));
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
        setCompletedToday((prev) => new Set(prev).add(habitId));
      } else {
        setCompletedToday((prev) => { const s = new Set(prev); s.delete(habitId); return s; });
      }
      toast.error("Algo deu errado. Tente novamente.");
    }
  };

  const deleteHabit = async (id: string) => {
    const backup = habits;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    toast.success("Removido");
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) {
      setHabits(backup);
      toast.error("Algo deu errado. Tente novamente.");
    }
  };

  const handleHabitSaved = () => {
    setShowModal(false);
    fetchHabits();
    toast.success("Habito criado");
  };

  return (
    <div>
      {habits.length === 0 ? (
        <div
          data-reveal
          style={{ transitionDelay: "160ms", background: "rgba(0,180,216,0.03)", border: "1px dashed rgba(0,180,216,0.2)", borderRadius: 14 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <p style={{ color: "#94A3B8", fontSize: 14, fontWeight: 300 }}>Nenhum habito criado ainda.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 mt-3 transition-colors"
            style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}
          >
            <Plus size={16} />
            Criar habito
          </button>
        </div>
      ) : (
        <div className="space-y-2" data-reveal style={{ transitionDelay: "160ms" }}>
          {habits.map((habit) => {
            const cat = categoryColors[habit.categoria] || categoryColors.saude;
            const done = completedToday.has(habit.id);
            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-4 group transition-all duration-200"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12 }}
              >
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ borderColor: done ? "#00B4D8" : "#CBD5E1", background: done ? "#00B4D8" : "transparent" }}
                >
                  {done && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#0F172A", fontSize: 14, fontWeight: 400 }}>{habit.titulo}</p>
                  {habit.descricao && <p className="truncate mt-0.5" style={{ color: "#94A3B8", fontSize: 12, fontWeight: 300 }}>{habit.descricao}</p>}
                </div>
                <span className="px-2 py-0.5 rounded-md" style={{ fontSize: 10, fontWeight: 400, background: cat.bg, color: cat.color }}>
                  {cat.label}
                </span>
                {habit.streak > 0 && (
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#F59E0B", fontWeight: 400 }}>
                    <Flame size={12} />
                    {habit.streak}
                  </span>
                )}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  style={{ color: "#94A3B8" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 mt-2 transition-colors"
            style={{ color: "#00B4D8", fontSize: 13, fontWeight: 400, padding: "8px 16px" }}
          >
            <Plus size={16} />
            Novo habito
          </button>
        </div>
      )}

      {showModal && (
        <HabitModal
          onClose={() => setShowModal(false)}
          onSaved={handleHabitSaved}
        />
      )}
    </div>
  );
};

/* ---------- Habit Modal ---------- */
interface HabitModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const HabitModal = ({ onClose, onSaved }: HabitModalProps) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("saude");
  const [frequencia, setFrequencia] = useState("diario");
  const [saving, setSaving] = useState(false);

  const categorias = [
    { value: "saude", label: "Saude" },
    { value: "mental", label: "Mental" },
    { value: "sono", label: "Sono" },
    { value: "alimentacao", label: "Alimentacao" },
    { value: "aprendizado", label: "Aprendizado" },
  ];

  const handleSave = async () => {
    if (!titulo.trim() || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("habits").insert({
        user_id: user.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        frequencia,
      });
      if (error) throw error;
      onSaved();
    } catch {
      toast.error("Algo deu errado. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#FFFFFF", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }} onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg mb-6" style={{ color: "#0F172A", fontWeight: 400 }}>Novo habito</h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Titulo</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Meditar 10 minutos" className="w-full px-3 py-2.5 text-sm rounded-lg outline-none" style={{ border: "1px solid #E2E8F0", color: "#0F172A" }} />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Descricao (opcional)</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm rounded-lg outline-none resize-none" style={{ border: "1px solid #E2E8F0", color: "#0F172A" }} />
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => {
                const cat = categoryColors[c.value];
                return (
                  <button
                    key={c.value}
                    onClick={() => setCategoria(c.value)}
                    className="px-3 py-1.5 text-sm rounded-lg transition-colors"
                    style={{
                      border: `1.5px solid ${categoria === c.value ? cat.color : "#E2E8F0"}`,
                      background: categoria === c.value ? cat.bg : "transparent",
                      color: categoria === c.value ? cat.color : "#64748B",
                      fontWeight: 400,
                      fontSize: 12,
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: 13, fontWeight: 400 }}>Frequencia</label>
            <div className="flex gap-2">
              {[{ value: "diario", label: "Diario" }, { value: "semanal", label: "Semanal" }].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFrequencia(f.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    border: `1.5px solid ${frequencia === f.value ? "#00B4D8" : "#E2E8F0"}`,
                    background: frequencia === f.value ? "rgba(0,180,216,0.08)" : "transparent",
                    color: frequencia === f.value ? "#00B4D8" : "#64748B",
                    fontWeight: 400,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm rounded-lg" style={{ border: "1px solid #E2E8F0", color: "#64748B", fontWeight: 400 }}>Cancelar</button>
          <button onClick={handleSave} disabled={!titulo.trim() || saving} className="flex-1 py-2.5 text-sm text-white rounded-lg transition-opacity disabled:opacity-50" style={{ background: "linear-gradient(135deg, #1E3A5F, #00B4D8)", fontWeight: 400, letterSpacing: "0.02em" }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitsTab;
