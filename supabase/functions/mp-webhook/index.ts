import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ── Centralized Config ──────────────────────────────────────────── */
const FOUNDER_AMOUNT = 9.90;
const FOUNDER_PLAN = "fundador";
const PAYMENT_DESCRIPTION_PREFIX = "Dailix";
const AMOUNT_TOLERANCE = 0.05;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ── Signature Verification (MP x-signature) ─────────────────────── */
async function verifyWebhookSignature(
  req: Request,
  body: Record<string, unknown>
): Promise<boolean> {
  const secret = Deno.env.get("MP_WEBHOOK_SECRET");
  if (!secret) {
    console.warn("MP_WEBHOOK_SECRET not configured — skipping signature check");
    return true; // graceful degradation for test env
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    console.error("Missing x-signature or x-request-id headers");
    return false;
  }

  // Parse ts and v1 from x-signature header: "ts=...,v1=..."
  const parts = xSignature.split(",");
  let ts: string | null = null;
  let hash: string | null = null;

  for (const part of parts) {
    const [key, value] = part.trim().split("=", 2);
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  }

  if (!ts || !hash) {
    console.error("Invalid x-signature format");
    return false;
  }

  // Build manifest: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
  const dataId = (body.data as Record<string, unknown>)?.id;
  let manifest = "";
  if (dataId) manifest += `id:${dataId};`;
  manifest += `request-id:${xRequestId};ts:${ts};`;

  // HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const computedHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedHash !== hash) {
    console.error(`Signature mismatch: computed=${computedHash}, received=${hash}`);
    return false;
  }

  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN not configured");

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // ── Verify signature ────────────────────────────────────────
    const signatureValid = await verifyWebhookSignature(req, body);
    if (!signatureValid) {
      console.error("Webhook signature verification failed — rejecting");
      return new Response(JSON.stringify({ error: "invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId =
      body.data?.id || body.id || (body.type === "payment" && body.data?.id);

    if (!paymentId) {
      console.log("No payment ID found, ignoring notification");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only process payment events
    if (body.type && body.type !== "payment") {
      console.log(`Ignoring event type: ${body.type}`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch real payment status from MP API
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
    );

    if (!mpResponse.ok) {
      const errText = await mpResponse.text();
      console.error(`MP fetch failed [${mpResponse.status}]: ${errText}`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = await mpResponse.json();
    const userId = payment.metadata?.user_id;
    const paymentPlan = payment.metadata?.plan;
    const paymentAmount = payment.transaction_amount;

    console.log(
      `Payment ${paymentId}: status=${payment.status}, amount=${paymentAmount}, plan=${paymentPlan}, user_id=${userId}`
    );

    // ── Record payment in audit trail ────────────────────────────
    await adminClient.from("payments").upsert(
      {
        user_id: userId || "00000000-0000-0000-0000-000000000000",
        provider: "mercadopago",
        payment_id: String(paymentId),
        status: payment.status,
        amount: paymentAmount,
        plan: paymentPlan || "unknown",
        metadata: {
          status_detail: payment.status_detail,
          payment_method_id: payment.payment_method_id,
          description: payment.description,
          payer_email: payment.payer?.email,
        },
        approved_at: payment.status === "approved" ? new Date().toISOString() : null,
      },
      { onConflict: "provider,payment_id" }
    );

    if (!userId) {
      console.log("No user_id in metadata, skipping promotion");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Strict validation before promoting ───────────────────────
    if (payment.status === "approved") {
      const validations: string[] = [];

      if (Math.abs(paymentAmount - FOUNDER_AMOUNT) > AMOUNT_TOLERANCE) {
        validations.push(`amount_mismatch: expected=${FOUNDER_AMOUNT}, got=${paymentAmount}`);
      }

      if (paymentPlan !== FOUNDER_PLAN) {
        validations.push(`plan_mismatch: expected=${FOUNDER_PLAN}, got=${paymentPlan}`);
      }

      if (!payment.description?.startsWith(PAYMENT_DESCRIPTION_PREFIX)) {
        validations.push(`description_mismatch: got="${payment.description}"`);
      }

      const { data: existingPayment } = await adminClient
        .from("payments")
        .select("status, approved_at")
        .eq("provider", "mercadopago")
        .eq("payment_id", String(paymentId))
        .single();

      if (existingPayment?.approved_at && existingPayment.status === "approved") {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("plano")
          .eq("user_id", userId)
          .single();

        if (profile?.plano === FOUNDER_PLAN) {
          console.log(`Payment ${paymentId} already processed, user ${userId} already founder`);
          return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (validations.length > 0) {
        console.error(`Promotion blocked for payment ${paymentId}: ${validations.join("; ")}`);
        await adminClient.from("payments").update({
          metadata: {
            ...((existingPayment as any)?.metadata || {}),
            validation_errors: validations,
          },
        }).eq("provider", "mercadopago").eq("payment_id", String(paymentId));

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── All validations passed → promote ─────────────────────
      await adminClient
        .from("profiles")
        .update({ plano: FOUNDER_PLAN })
        .eq("user_id", userId);

      await adminClient.from("payments").update({
        status: "approved",
        approved_at: new Date().toISOString(),
      }).eq("provider", "mercadopago").eq("payment_id", String(paymentId));

      console.log(`User ${userId} upgraded to ${FOUNDER_PLAN}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
