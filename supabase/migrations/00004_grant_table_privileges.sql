-- =====================================================
-- Kommit — fehlende Tabellen-Grants fuer alle App-Tabellen
-- =====================================================
-- Die Tabellen wurden urspruenglich angelegt, ohne die Supabase-Standard-
-- Grants an die PostgREST-Rollen zu vergeben. Postgres prueft Tabellen-
-- Privilegien VOR den RLS-Policies -> trotz vorhandener Policies scheiterten
-- Zugriffe mit 42501 "permission denied" (zuerst otp_requests, dann profiles,
-- als naechstes waeren listings/push_subscriptions drangewesen).
--
-- Loesung: table-level Grants setzen. Die RLS-Policies schraenken die
-- tatsaechlich sichtbaren/aenderbaren Zeilen weiterhin ein.

-- authenticated: darf auf die App-Tabellen zugreifen (RLS regelt die Zeilen)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT                          ON public.listings_archive   TO authenticated;

-- service_role: voller Zugriff (Edge Functions + Cron), umgeht RLS ohnehin
GRANT ALL ON public.otp_requests       TO service_role;
GRANT ALL ON public.profiles           TO service_role;
GRANT ALL ON public.listings           TO service_role;
GRANT ALL ON public.listings_archive   TO service_role;
GRANT ALL ON public.push_subscriptions TO service_role;

-- otp_requests bleibt fuer anon/authenticated gesperrt (nur Edge Functions)
REVOKE ALL ON public.otp_requests FROM anon, authenticated;

-- Kuenftig angelegte Tabellen automatisch mit denselben Grants versehen
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
