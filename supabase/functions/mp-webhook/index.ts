import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    if (!MP_ACCESS_TOKEN) throw new Error("MP_ACCESS_TOKEN not configured");

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    // MP sends different notification formats
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
      {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      }
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
    console.log(
      `Payment ${paymentId}: status=${payment.status}, user_id=${payment.metadata?.user_id}`
    );

    const userId = payment.metadata?.user_id;
    if (!userId) {
      console.log("No user_id in metadata, skipping");
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only activate on approved status
    if (payment.status === "approved") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      // Idempotent: update only if not already fundador
      const { data: profile } = await adminClient
        .from("profiles")
        .select("plano")
        .eq("user_id", userId)
        .single();

      if (profile && profile.plano !== "fundador") {
        await adminClient
          .from("profiles")
          .update({ plano: "fundador" })
          .eq("user_id", userId);
        console.log(`User ${userId} upgraded to fundador`);
      } else {
        console.log(`User ${userId} already fundador, skipping`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    // Always return 200 to MP to avoid retries on our errors
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
