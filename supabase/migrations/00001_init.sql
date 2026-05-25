-- =====================================================
-- Kommit — Datenbankschema (Supabase / Postgres)
-- =====================================================

CREATE TYPE listing_type AS ENUM ('angebot', 'anfrage');
CREATE TYPE user_role    AS ENUM ('user', 'admin');

-- -----------------------------------------------------
-- profiles
-- -----------------------------------------------------
CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name        TEXT NOT NULL,
  last_name         TEXT NOT NULL,
  phone             TEXT NOT NULL UNIQUE,
  show_phone        BOOLEAN NOT NULL DEFAULT true,
  telegram_chat_id  BIGINT,
  role              user_role NOT NULL DEFAULT 'user',
  avatar_color      TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name, phone, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.phone,
    '#' || lpad(to_hex(abs(hashtext(NEW.id::text)) % 16777215), 6, '0')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------------
-- listings
-- -----------------------------------------------------
CREATE TABLE listings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type               listing_type NOT NULL,

  origin_label       TEXT NOT NULL,
  origin_city        TEXT NOT NULL,
  origin_lat         DOUBLE PRECISION NOT NULL,
  origin_lng         DOUBLE PRECISION NOT NULL,

  destination_label  TEXT NOT NULL,
  destination_city   TEXT NOT NULL,
  destination_lat    DOUBLE PRECISION NOT NULL,
  destination_lng    DOUBLE PRECISION NOT NULL,

  departure_at       TIMESTAMPTZ NOT NULL,
  seats              SMALLINT NOT NULL CHECK (seats > 0 AND seats <= 10),
  notes              TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_departure_at ON listings(departure_at);
CREATE INDEX idx_listings_origin_city  ON listings(origin_city);
CREATE INDEX idx_listings_type_dep     ON listings(type, departure_at);
CREATE INDEX idx_listings_user_id      ON listings(user_id);

CREATE TABLE listings_archive (LIKE listings INCLUDING ALL);

-- -----------------------------------------------------
-- push_subscriptions
-- -----------------------------------------------------
CREATE TABLE push_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint      TEXT NOT NULL,
  p256dh_key    TEXT NOT NULL,
  auth_key      TEXT NOT NULL,
  device_label  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- -----------------------------------------------------
-- updated_at-Trigger
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------
-- Realtime
-- -----------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE listings;

-- -----------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE POLICY profiles_select_all ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_update_self_or_admin ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR is_admin());

CREATE POLICY listings_select_all ON listings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY listings_insert_self ON listings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY listings_update_owner_or_admin ON listings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR is_admin());
CREATE POLICY listings_delete_owner_or_admin ON listings
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR is_admin());

CREATE POLICY push_subs_owner ON push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- Distanz + Matching
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION haversine_km(
  lat1 DOUBLE PRECISION, lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION, lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  r CONSTANT DOUBLE PRECISION := 6371;
  dlat DOUBLE PRECISION; dlng DOUBLE PRECISION; a DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;
  RETURN r * 2 * atan2(sqrt(a), sqrt(1-a));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION find_matches(p_listing_id UUID)
RETURNS TABLE (
  listing_id UUID, user_id UUID,
  origin_label TEXT, destination_label TEXT,
  departure_at TIMESTAMPTZ, seats SMALLINT,
  distance_origin_km DOUBLE PRECISION,
  distance_destination_km DOUBLE PRECISION
) AS $$
DECLARE
  src listings%ROWTYPE;
  counter_type listing_type;
BEGIN
  SELECT * INTO src FROM listings WHERE id = p_listing_id;
  counter_type := CASE src.type WHEN 'angebot' THEN 'anfrage' ELSE 'angebot' END;

  RETURN QUERY
  SELECT
    l.id, l.user_id, l.origin_label, l.destination_label,
    l.departure_at, l.seats,
    haversine_km(src.origin_lat, src.origin_lng, l.origin_lat, l.origin_lng),
    haversine_km(src.destination_lat, src.destination_lng,
                 l.destination_lat, l.destination_lng)
  FROM listings l
  WHERE l.type = counter_type
    AND l.user_id != src.user_id
    AND haversine_km(src.origin_lat, src.origin_lng,
                     l.origin_lat, l.origin_lng) <= 15
    AND haversine_km(src.destination_lat, src.destination_lng,
                     l.destination_lat, l.destination_lng) <= 15
    AND ABS(EXTRACT(EPOCH FROM (l.departure_at - src.departure_at))) <= 7200
    AND (
      (src.type = 'anfrage' AND l.seats >= src.seats) OR
      (src.type = 'angebot' AND l.seats <= src.seats)
    )
  ORDER BY l.departure_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- -----------------------------------------------------
-- Archivierungs-Cron
-- -----------------------------------------------------
SELECT cron.schedule('archive-expired-listings', '0 3 * * *', $$
  WITH moved AS (
    DELETE FROM listings
    WHERE departure_at < now() - INTERVAL '24 hours'
    RETURNING *
  )
  INSERT INTO listings_archive SELECT * FROM moved;
$$);
