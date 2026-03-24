import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web Push requires signing with VAPID. We use the web-push npm package via esm.sh
// For Deno edge functions, we implement the signing manually using Web Crypto API.

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ ok: boolean; status: number }> {
  // Use the web-push library via npm: specifier
  const webpush = await import("npm:web-push@3.6.7");
  
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  try {
    const result = await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      payload
    );
    return { ok: true, status: result.statusCode };
  } catch (e: any) {
    return { ok: false, status: e?.statusCode || 500 };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Validate it's a service-role or valid user call
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { user_id, title, body: msgBody, route, source_type, source_id } = body;

    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: "Missing user_id or title" }), { status: 400, headers: corsHeaders });
    }

    // Get active subscriptions for this user
    const { data: subs, error: subsErr } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (subsErr || !subs?.length) {
      return new Response(JSON.stringify({ ok: false, sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const vapidPublicKey = "BFGmLaE_bjGguvgRdghUUkSEjuBUgrJADGJ-jSwQMEdzpgzxQrgYZ-OnR8QNjJmCOxROAeCb47XrNHt61SJ9f8w";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

    const payload = JSON.stringify({
      title,
      body: msgBody || "",
      route: route || "/dashboard",
      sourceType: source_type,
      sourceId: source_id,
    });

    let sent = 0;
    let errors = 0;

    for (const sub of subs) {
      const result = await sendWebPush(
        sub,
        payload,
        vapidPublicKey,
        vapidPrivateKey,
        "mailto:noreply@dailix.app"
      );

      if (result.ok) {
        sent++;
      } else {
        errors++;
        // If 410 Gone, mark subscription inactive
        if (result.status === 410) {
          await admin
            .from("push_subscriptions")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("endpoint", sub.endpoint)
            .eq("user_id", user_id);
        }
      }
    }

    // Log dispatch
    if (source_type && source_id) {
      await admin.from("push_dispatch_log").insert({
        user_id,
        source_type,
        source_id,
        scheduled_for: new Date().toISOString(),
        sent_at: sent > 0 ? new Date().toISOString() : null,
        status: sent > 0 ? "sent" : "failed",
        error_message: errors > 0 ? `${errors} delivery failures` : null,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, sent, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: corsHeaders });
  }
});
