// supabase/functions/send-push/index.ts
import webpush from "npm:web-push@3.6.7";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { listing_id } = await req.json();
    if (!listing_id) return json({ error: "listing_id fehlt" }, 400);

    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@kommit.app";
    if (!vapidPublic || !vapidPrivate) {
      return json({ error: "VAPID-Schluessel nicht konfiguriert." }, 500);
    }
    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Passende Gegen-Eintraege finden
    const { data: matches, error: matchErr } = await supabase.rpc(
      "find_matches",
      { p_listing_id: listing_id },
    );
    if (matchErr || !matches || matches.length === 0) {
      return json({ sent: 0 }, 200);
    }

    const { data: listing } = await supabase
      .from("listings")
      .select("origin_label, destination_label, type")
      .eq("id", listing_id)
      .single();

    const userIds = [
      ...new Set(matches.map((m: { user_id: string }) => m.user_id)),
    ];

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .in("user_id", userIds);

    if (!subs || subs.length === 0) return json({ sent: 0 }, 200);

    const typeLabel = listing?.type === "angebot" ? "Angebot" : "Anfrage";
    const payload = JSON.stringify({
      title: `Neues passendes ${typeLabel}`,
      body: `${listing?.origin_label} → ${listing?.destination_label}`,
      tag: `match-${listing_id}`,
      url: `/listing/${listing_id}`,
    });

    let sent = 0;
    for (const s of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh_key, auth: s.auth_key },
          },
          payload,
        );
        sent++;
      } catch (err) {
        // Abgelaufene/ungueltige Subscriptions aufraeumen
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    }

    return json({ sent, total: subs.length }, 200);
  } catch (error) {
    return json({ error: (error as Error).message }, 500);
  }
});
