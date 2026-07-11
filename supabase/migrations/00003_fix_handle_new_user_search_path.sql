-- =====================================================
-- Kommit — handle_new_user() robust gegen search_path machen
-- =====================================================
-- Der Trigger laeuft beim Anlegen eines auth-Users als Rolle
-- supabase_auth_admin, deren search_path public NICHT enthaelt. Die
-- unqualifizierte Referenz auf "profiles" schlug daher mit 42P01
-- ("relation profiles does not exist") fehl.
--
-- Fix: Tabelle voll qualifizieren (public.profiles) UND search_path der
-- Funktion fest auf '' setzen (pg_catalog bleibt implizit verfuegbar,
-- alle uebrigen Referenzen sind qualifiziert). Behebt zugleich die
-- function_search_path_mutable-Sicherheitswarnung fuer diese Funktion.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.phone,
    '#' || lpad(to_hex(abs(hashtext(NEW.id::text)) % 16777215), 6, '0')
  );
  RETURN NEW;
END;
$$;
