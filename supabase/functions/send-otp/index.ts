import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const TELEGRAM_API_URL = "https://gatewayapi.telegram.org/sendVerificationMessage";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return new Response(
        JSON.stringify({ error: "Telefonnummer ist erforderlich." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const telegramToken = Deno.env.get("TELEGRAM_GATEWAY_TOKEN");
    if (!telegramToken) {
      return new Response(
        JSON.stringify({ error: "Server-Konfigurationsfehler." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const response = await fetch(TELEGRAM_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${telegramToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phone,
        code_length: 6,
        ttl: 300,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return new Response(
        JSON.stringify({ error: data.error || "Code konnte nicht gesendet werden." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ request_id: data.result.request_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
