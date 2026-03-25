import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ── Centralized Config ──────────────────────────────────────────── */
const FOUNDER_AMOUNT = 9.90;
const FOUNDER_PLAN = "fundador";
const PAYMENT_DESCRIPTION = "Dailix — Plano Fundador (ativação)";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN not configured");

    // Verify user auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const rawBody = await req.json();
    console.log("create-mp-payment raw body:", JSON.stringify(rawBody));

    // Defensive normalization
    const normalized = rawBody?.formData ?? rawBody?.form_data ?? rawBody?.data ?? rawBody;
    console.log("create-mp-payment normalized body:", JSON.stringify(normalized));

    const { token, payment_method_id, installments, payer, issuer_id, idempotency_key } = normalized;

    if (!payment_method_id) {
      return new Response(
        JSON.stringify({ success: false, error: "payment_method_id ausente no payload normalizado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create payment via MP API
    const paymentBody: Record<string, unknown> = {
      transaction_amount: FOUNDER_AMOUNT,
      description: PAYMENT_DESCRIPTION,
      payment_method_id,
      payer: {
        email: payer?.email || user.email,
        ...(payer?.identification && { identification: payer.identification }),
      },
      metadata: {
        user_id: user.id,
        plan: FOUNDER_PLAN,
      },
    };

    // Card payment
    if (token) {
      paymentBody.token = token;
      paymentBody.installments = installments || 1;
      if (issuer_id) paymentBody.issuer_id = issuer_id;
    }

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotency_key || crypto.randomUUID(),
      },
      body: JSON.stringify(paymentBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error("MP API error:", JSON.stringify(mpData));
      return new Response(
        JSON.stringify({
          success: false,
          error: mpData.message || "Payment creation failed",
          cause: mpData.cause,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Record payment in audit trail ────────────────────────────
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    await adminClient.from("payments").upsert(
      {
        user_id: user.id,
        provider: "mercadopago",
        payment_id: String(mpData.id),
        status: mpData.status,
        amount: FOUNDER_AMOUNT,
        plan: FOUNDER_PLAN,
        metadata: {
          status_detail: mpData.status_detail,
          payment_method_id: mpData.payment_method_id,
        },
        approved_at: mpData.status === "approved" ? new Date().toISOString() : null,
      },
      { onConflict: "provider,payment_id" }
    );

    // Founder promotion handled exclusively by webhook — not here

    // Build response
    const result: Record<string, unknown> = {
      success: true,
      status: mpData.status,
      status_detail: mpData.status_detail,
      payment_id: mpData.id,
    };

    // Pix: include QR code data
    if (
      mpData.payment_method_id === "pix" &&
      mpData.point_of_interaction?.transaction_data
    ) {
      result.pix_qr_code =
        mpData.point_of_interaction.transaction_data.qr_code;
      result.pix_qr_code_base64 =
        mpData.point_of_interaction.transaction_data.qr_code_base64;
      result.pix_ticket_url =
        mpData.point_of_interaction.transaction_data.ticket_url;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
