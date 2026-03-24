import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── VAPID Web Push ──
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ ok: boolean; status: number }> {
  const webpush = await import("npm:web-push@3.6.7");
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  try {
    const result = await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      payload
    );
    return { ok: true, status: result.statusCode };
  } catch (e: any) {
    return { ok: false, status: e?.statusCode || 500 };
  }
}

// ── FCM HTTP v1 ──
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(serviceAccount: any): Promise<string> {
  if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt - 60000) {
    return cachedAccessToken.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: any) => {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerB64 = encode(header);
  const claimB64 = encode(claim);
  const unsignedToken = `${headerB64}.${claimB64}`;

  // Import the private key
  const pemContents = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${sigB64}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const data = await resp.json();
  if (!data.access_token) throw new Error("Failed to get FCM access token");

  cachedAccessToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function sendFCM(
  fcmToken: string,
  title: string,
  body: string,
  route: string,
  serviceAccount: any
): Promise<{ ok: boolean; status: number }> {
  try {
    const accessToken = await getAccessToken(serviceAccount);
    const resp = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            data: { route },
            webpush: {
              fcm_options: { link: route },
            },
          },
        }),
      }
    );
    const text = await resp.text();
    if (!resp.ok) console.error("[FCM] Send error:", text);
    return { ok: resp.ok, status: resp.status };
  } catch (e: any) {
    console.error("[FCM] Send exception:", e);
    return { ok: false, status: 500 };
  }
}

// ── Main handler ──
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { user_id, title, body: msgBody, route, source_type, source_id } = body;

    if (!user_id || !title) {
      return new Response(JSON.stringify({ error: "Missing user_id or title" }), { status: 400, headers: corsHeaders });
    }

    // Get all active subscriptions
    const { data: subs, error: subsErr } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", user_id)
      .eq("is_active", true);

    if (subsErr || !subs?.length) {
      return new Response(JSON.stringify({ ok: false, sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Parse service account for FCM
    let serviceAccount: any = null;
    try {
      const saJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
      if (saJson) serviceAccount = JSON.parse(saJson);
    } catch { /* no FCM */ }

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
      const isFCM = sub.endpoint.startsWith("fcm::");

      if (isFCM) {
        // FCM token
        if (!serviceAccount) { errors++; continue; }
        const fcmToken = sub.endpoint.replace("fcm::", "");
        const result = await sendFCM(fcmToken, title, msgBody || "", route || "/dashboard", serviceAccount);
        if (result.ok) {
          sent++;
        } else {
          errors++;
          // 404 = token invalid/expired
          if (result.status === 404 || result.status === 400) {
            await admin
              .from("push_subscriptions")
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq("endpoint", sub.endpoint)
              .eq("user_id", user_id);
          }
        }
      } else {
        // VAPID Web Push
        const result = await sendWebPush(
          sub, payload, vapidPublicKey, vapidPrivateKey, "mailto:noreply@dailix.app"
        );
        if (result.ok) {
          sent++;
        } else {
          errors++;
          if (result.status === 410) {
            await admin
              .from("push_subscriptions")
              .update({ is_active: false, updated_at: new Date().toISOString() })
              .eq("endpoint", sub.endpoint)
              .eq("user_id", user_id);
          }
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
