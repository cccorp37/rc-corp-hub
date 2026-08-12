import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await anonClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, reference, description } = await req.json();

    // Service-role client: the active gateway is never exposed to the client
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: settings } = await admin
      .from("payment_settings")
      .select("active_gateway_id")
      .maybeSingle();

    if (!settings?.active_gateway_id) {
      return new Response(
        JSON.stringify({ error: "Aucun moyen de paiement disponible pour le moment." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: gateway } = await admin
      .from("payment_gateways")
      .select("code, is_enabled, config")
      .eq("id", settings.active_gateway_id)
      .maybeSingle();

    if (!gateway || !gateway.is_enabled) {
      return new Response(
        JSON.stringify({ error: "Aucun moyen de paiement disponible pour le moment." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const config = (gateway.config ?? {}) as Record<string, string>;
    const base = config.checkout_url || "";

    // Build the checkout redirection for the gateway selected by the admin.
    // The gateway identity is intentionally not returned to the client.
    let redirectUrl: string | null = null;
    if (base) {
      const url = new URL(base);
      if (amount) url.searchParams.set("amount", String(amount));
      if (reference) url.searchParams.set("reference", String(reference));
      if (description) url.searchParams.set("description", String(description));
      redirectUrl = url.toString();
    }

    return new Response(JSON.stringify({ success: true, redirect_url: redirectUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("initiate-payment error", e);
    return new Response(JSON.stringify({ error: "Erreur de paiement" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
