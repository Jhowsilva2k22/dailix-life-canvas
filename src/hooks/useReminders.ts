import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPermissionState, showNotification } from "@/services/notifications";

/**
 * Polls every 60s for due reminders (tasks & habits) and fires
 * browser notifications. Only active while the tab is open and
 * permission is granted.
 */
export function useReminders() {
  const { user } = useAuth();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    if (getPermissionState() !== "granted") return;

    const check = async () => {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM

      // Tasks with reminder today at or before current time
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, titulo, prazo, lembrete_horario")
        .eq("user_id", user.id)
        .eq("lembrete_ativo", true)
        .eq("concluida", false)
        .not("lembrete_horario", "is", null);

      if (tasks) {
        for (const t of tasks) {
          const key = `task-${t.id}-${todayStr}`;
          if (firedRef.current.has(key)) continue;
          const taskDate = t.prazo || todayStr;
          if (taskDate !== todayStr) continue;
          const reminderTime = (t.lembrete_horario as string).slice(0, 5);
          if (reminderTime <= currentTime) {
            showNotification("Dailix — Tarefa", t.titulo);
            firedRef.current.add(key);
          }
        }
      }

      // Habits with reminder at or before current time (daily check)
      const { data: habits } = await supabase
        .from("habits")
        .select("id, titulo, lembrete_horario")
        .eq("user_id", user.id)
        .eq("lembrete_ativo", true)
        .eq("ativo", true)
        .not("lembrete_horario", "is", null);

      if (habits) {
        for (const h of habits) {
          const key = `habit-${h.id}-${todayStr}`;
          if (firedRef.current.has(key)) continue;
          const reminderTime = (h.lembrete_horario as string).slice(0, 5);
          if (reminderTime <= currentTime) {
            showNotification("Dailix — Hábito", h.titulo);
            firedRef.current.add(key);
          }
        }
      }
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [user]);
}
