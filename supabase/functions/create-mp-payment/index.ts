import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { token, payment_method_id, installments, payer, issuer_id } = body;

    // Create payment via MP API
    const paymentBody: Record<string, unknown> = {
      transaction_amount: 9.9,
      description: "Dailix — Plano Fundador (mensal)",
      payment_method_id,
      payer: {
        email: payer?.email || user.email,
        ...(payer?.identification && { identification: payer.identification }),
      },
      metadata: {
        user_id: user.id,
        plan: "fundador",
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
        "X-Idempotency-Key": `${user.id}-${Date.now()}`,
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

    // If approved immediately (common for Pix QR or test cards)
    if (mpData.status === "approved") {
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      await adminClient
        .from("profiles")
        .update({ plano: "fundador" })
        .eq("user_id", user.id);
    }

    // Build response based on payment type
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
