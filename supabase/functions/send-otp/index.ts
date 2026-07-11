// supabase/functions/send-otp/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || !/^\+\d{8,15}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Ungueltige Telefonnummer" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Telegram Gateway aufrufen
    const tgResponse = await fetch(
      "https://gatewayapi.telegram.org/sendVerificationMessage",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("TELEGRAM_GATEWAY_TOKEN")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phone,
          code_length: 6,
          ttl: 300, // 5 Min gueltig
        }),
      },
    );

    const tgData = await tgResponse.json();

    if (!tgData.ok) {
      return new Response(
        JSON.stringify({ error: tgData.error || "Telegram-Fehler" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // request_id temporaer speichern (mit Service-Role-Key, umgeht RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase.from("otp_requests").upsert(
      {
        phone,
        request_id: tgData.result.request_id,
        created_at: new Date().toISOString(),
      },
      { onConflict: "phone" },
    );

    // request_id auch zurueckgeben (verify-otp schlaegt sie sonst selbst nach)
    return new Response(
      JSON.stringify({ ok: true, request_id: tgData.result.request_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
