import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Current time in UTC — we store lembrete_horario as time without timezone
    // The cron runs every minute; we check current UTC HH:MM
    const now = new Date();
    const currentTime = `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`;
    const todayStr = now.toISOString().slice(0, 10);

    let dispatched = 0;

    // ---- Tasks due today with reminder at current time ----
    const { data: tasks } = await admin
      .from("tasks")
      .select("id, user_id, titulo")
      .eq("lembrete_ativo", true)
      .eq("concluida", false)
      .eq("prazo", todayStr)
      .not("lembrete_horario", "is", null);

    if (tasks) {
      for (const task of tasks) {
        const reminderTime = (task.lembrete_horario as string).slice(0, 5);
        if (reminderTime !== currentTime) continue;

        // Check if already dispatched
        const { data: existing } = await admin
          .from("push_dispatch_log")
          .select("id")
          .eq("source_type", "task")
          .eq("source_id", task.id)
          .gte("scheduled_for", `${todayStr}T00:00:00Z`)
          .limit(1);

        if (existing && existing.length > 0) continue;

        // Send push via edge function
        await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            user_id: task.user_id,
            title: "Dailix — Tarefa",
            body: task.titulo,
            route: "/dashboard",
            source_type: "task",
            source_id: task.id,
          }),
        });

        dispatched++;
      }
    }

    // ---- Habits with reminder at current time ----
    const { data: habits } = await admin
      .from("habits")
      .select("id, user_id, titulo")
      .eq("lembrete_ativo", true)
      .eq("ativo", true)
      .not("lembrete_horario", "is", null);

    if (habits) {
      for (const habit of habits) {
        const reminderTime = (habit.lembrete_horario as string).slice(0, 5);
        if (reminderTime !== currentTime) continue;

        // Check if already dispatched today
        const { data: existing } = await admin
          .from("push_dispatch_log")
          .select("id")
          .eq("source_type", "habit")
          .eq("source_id", habit.id)
          .gte("scheduled_for", `${todayStr}T00:00:00Z`)
          .limit(1);

        if (existing && existing.length > 0) continue;

        await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            user_id: habit.user_id,
            title: "Dailix — Hábito",
            body: habit.titulo,
            route: "/dashboard",
            source_type: "habit",
            source_id: habit.id,
          }),
        });

        dispatched++;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, dispatched, checked_at: now.toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
