-- =====================================================
-- Kommit — otp_requests-Rechte + RLS-Haertung
-- =====================================================

-- OTP-Anfragen: haelt pro Telefonnummer die aktuelle Telegram request_id,
-- bis der Code verifiziert wurde. Nur die Edge Functions (Service-Role)
-- greifen darauf zu. (Tabelle wurde urspruenglich manuell angelegt, ohne
-- die noetigen Grants — daher schlugen send-otp/verify-otp mit 42501 fehl.)
CREATE TABLE IF NOT EXISTS public.otp_requests (
  phone       TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- service_role (Edge Functions send-otp/verify-otp) braucht vollen Zugriff
GRANT SELECT, INSERT, UPDATE, DELETE ON public.otp_requests TO service_role;

-- anon/authenticated duerfen NICHT auf otp_requests zugreifen
REVOKE ALL ON public.otp_requests FROM anon, authenticated;

-- Defense-in-depth: RLS an (service_role umgeht RLS ohnehin, anon/authenticated
-- sind ohne Grant + ohne Policy komplett ausgesperrt)
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;

-- listings_archive: Cron befuellt per Service-Role; im Frontend liest nur der
-- Admin-Bereich daraus -> RLS an + SELECT-Policy fuer Admins.
ALTER TABLE public.listings_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS archive_select_admin ON public.listings_archive;
CREATE POLICY archive_select_admin ON public.listings_archive
  FOR SELECT TO authenticated USING (public.is_admin());
