// supabase/functions/verify-otp/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_VERIFY_URL =
  "https://gatewayapi.telegram.org/checkVerificationStatus";
const EMAIL_DOMAIN = "phone.kommit.app";

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function emailForPhone(phone: string): string {
  return `${phone.replace(/\D/g, "")}@${EMAIL_DOMAIN}`;
}

// deno-lint-ignore no-explicit-any
async function findUserByEmail(supabase: any, email: string) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) throw error;
    // deno-lint-ignore no-explicit-any
    const found = data.users.find((u: any) => u.email === email);
    if (found) return found;
    if (data.users.length < perPage) return null;
    page++;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const phone: string | undefined = body.phone;
    const code: string | undefined = body.code;
    let requestId: string | undefined = body.request_id;

    if (!phone || !code) {
      return json({ error: "Telefonnummer und Code sind erforderlich." }, 400);
    }

    const telegramToken = Deno.env.get("TELEGRAM_GATEWAY_TOKEN");
    if (!telegramToken) {
      return json(
        { error: "Server-Konfigurationsfehler (Telegram-Token fehlt)." },
        500,
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // request_id ggf. aus otp_requests nachschlagen (Frontend uebergibt sie nicht)
    if (!requestId) {
      const { data: otp } = await supabase
        .from("otp_requests")
        .select("request_id")
        .eq("phone", phone)
        .maybeSingle();
      requestId = otp?.request_id;
    }
    if (!requestId) {
      return json(
        { error: "Kein Code angefordert. Bitte fordere einen neuen Code an." },
        400,
      );
    }

    // Code bei Telegram Gateway pruefen
    const verifyResponse = await fetch(TELEGRAM_VERIFY_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${telegramToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ request_id: requestId, code }),
    });
    const verifyData = await verifyResponse.json();

    if (
      !verifyData.ok ||
      verifyData.result?.verification_status?.status !== "code_valid"
    ) {
      return json({ error: "Hm, der Code passt nicht. Nochmal?" }, 401);
    }

    const email = emailForPhone(phone);

    // Bestehenden User finden, sonst neu anlegen
    const existingUser = await findUserByEmail(supabase, email);
    let isNewUser = false;

    if (!existingUser) {
      isNewUser = true;
      const { error: createErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        phone,
        phone_confirm: true,
        user_metadata: { first_name: "", last_name: "" },
      });
      if (createErr) throw createErr;
    }

    // Session per Magiclink-Token minten
    const { data: linkData, error: linkErr } = await supabase.auth.admin
      .generateLink({ type: "magiclink", email });
    if (linkErr) throw linkErr;

    const tokenHash = linkData.properties?.hashed_token;
    if (!tokenHash) throw new Error("Session-Token konnte nicht erzeugt werden.");

    const { data: sessionData, error: verifyErr } = await supabase.auth
      .verifyOtp({ type: "email", token_hash: tokenHash });
    if (verifyErr) throw verifyErr;

    // Verbrauchte OTP-Anfrage entfernen
    await supabase.from("otp_requests").delete().eq("phone", phone);

    return json(
      { session: sessionData.session, is_new_user: isNewUser },
      200,
    );
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
