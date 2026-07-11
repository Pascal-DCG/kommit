-- =====================================================
-- Kommit — otp_requests-Tabelle + RLS-Haertung
-- =====================================================

-- OTP-Anfragen: haelt pro Telefonnummer die aktuelle Telegram request_id,
-- bis der Code verifiziert wurde. Nur die Edge Functions (Service-Role)
-- greifen darauf zu.
CREATE TABLE IF NOT EXISTS public.otp_requests (
  phone       TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- otp_requests wird ausschliesslich von den Edge Functions
-- (send-otp / verify-otp) mit dem Service-Role-Key beschrieben/gelesen.
-- RLS ohne Policies blockiert anon/authenticated, Service-Role umgeht RLS.
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;

-- listings_archive: Cron befuellt per Service-Role; im Frontend liest nur der
-- Admin-Bereich daraus -> RLS an + SELECT-Policy fuer Admins.
ALTER TABLE public.listings_archive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS archive_select_admin ON public.listings_archive;
CREATE POLICY archive_select_admin ON public.listings_archive
  FOR SELECT TO authenticated USING (public.is_admin());
