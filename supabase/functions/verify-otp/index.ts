import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

const TELEGRAM_VERIFY_URL = "https://gatewayapi.telegram.org/checkVerificationStatus";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, code, request_id } = await req.json();

    if (!phone || !code || !request_id) {
      return new Response(
        JSON.stringify({ error: "Telefonnummer, Code und Request-ID sind erforderlich." }),
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

    const verifyResponse = await fetch(TELEGRAM_VERIFY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${telegramToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id,
        code,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.ok || verifyData.result?.verification_status?.status !== "code_valid") {
      return new Response(
        JSON.stringify({ error: "Hm, der Code passt nicht. Nochmal?" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.phone === phone);

    let session;
    let isNewUser = false;

    if (existingUser) {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `${phone.replace(/\+/g, "")}@phone.kommit.app`,
      });
      if (error) throw error;

      const tokenHash = new URL(data.properties.action_link).searchParams.get("token");
      const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: "email",
      });
      if (verifyError) throw verifyError;
      session = sessionData.session;
    } else {
      isNewUser = true;
      const { data, error } = await supabase.auth.admin.createUser({
        phone,
        phone_confirm: true,
        user_metadata: { first_name: "", last_name: "" },
      });
      if (error) throw error;

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: `${phone.replace(/\+/g, "")}@phone.kommit.app`,
      });
      if (linkError) throw linkError;

      const tokenHash = new URL(linkData.properties.action_link).searchParams.get("token");
      const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: "email",
      });
      if (verifyError) throw verifyError;
      session = sessionData.session;

      void data;
    }

    return new Response(
      JSON.stringify({ session, is_new_user: isNewUser }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
