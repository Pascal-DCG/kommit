# Kommit — Projektplan

**Mitfahr-PWA für die Community**
Version 1.0 — Planungsstand

---

## Inhaltsverzeichnis

1. [Überblick & Vision](#1-überblick--vision)
2. [Funktionsumfang V1](#2-funktionsumfang-v1)
3. [Tech-Stack](#3-tech-stack)
4. [Authentifizierung](#4-authentifizierung)
5. [Datenmodell](#5-datenmodell)
6. [Echtzeit-Synchronisation](#6-echtzeit-synchronisation)
7. [Geolocation & Geocoding](#7-geolocation--geocoding)
8. [Matching-Logik](#8-matching-logik)
9. [Push Notifications](#9-push-notifications)
10. [Screens im Detail](#10-screens-im-detail)
11. [Design-System](#11-design-system)
12. [App-Name & Logo](#12-app-name--logo)
13. [Onboarding](#13-onboarding)
14. [Datenschutz & Rechtliches](#14-datenschutz--rechtliches)
15. [Admin-Bereich](#15-admin-bereich)
16. [Phasen-/Sprint-Plan](#16-phasen-sprint-plan)
17. [Kostenübersicht](#17-kostenübersicht)
18. [Offene Punkte & nächste Schritte](#18-offene-punkte--nächste-schritte)

---

## 1. Überblick & Vision

**Kommit** ist eine progressive Web-App (PWA), mit der eine Community Mitfahrgelegenheiten organisieren kann. Nutzer können entweder Fahrten **anbieten** oder Mitfahrgelegenheiten **anfragen**. Alle Einträge sind für alle Mitglieder sichtbar, werden in Echtzeit synchronisiert und automatisch nach Abfahrtsort gruppiert.

**Kernwerte:**
- **Einfach**: nur das Nötigste, keine Feature-Überfrachtung
- **Echtzeit**: was du siehst, ist gerade aktuell
- **Direkt**: Kontakt per Telegram oder Anruf, kein eingebauter Chat
- **Günstig**: kostengünstig zu betreiben (<30 €/Jahr Fixkosten)
- **Verspielt-modern**: macht Spaß zu nutzen, ohne kindisch zu wirken

**Zielgruppe:** junges Publikum in Deutschland.
**Geltungsbereich V1:** nur Deutschland, deutschsprachig.

---

## 2. Funktionsumfang V1

| Feature | V1 | Notiz |
|---|---|---|
| Telefonnummer-Login via Telegram OTP | ✅ | |
| BCC Login als Alternative | ❌ | für V1.1 oder später |
| Einträge anlegen (Angebot / Anfrage) | ✅ | |
| Liste mit Gruppierung nach Abfahrtsort | ✅ | |
| Detail-Ansicht mit Kontaktbuttons | ✅ | Telegram, Anruf |
| Eigene Einträge bearbeiten/löschen | ✅ | |
| Echtzeit-Sync zwischen Clients | ✅ | |
| Automatisches Matching als Vorschlag | ✅ | beim Erstellen |
| GPS-basierter Ortsvorschlag | ✅ | überschreibbar |
| Push Notifications bei Match | ✅ | Web Push + optional Telegram-Bot |
| Profil + Einstellungen | ✅ | |
| Admin-View (Listings) | ✅ | |
| Volltextsuche | ❌ | bewusst weggelassen |
| Wiederkehrende Einträge | ❌ | nur feste Zeiten in V1 |
| In-App-Chat | ❌ | Kontakt via Telegram/Anruf |

---

## 3. Tech-Stack

| Bereich | Wahl | Begründung |
|---|---|---|
| **Frontend** | React + Vite + TypeScript | bewährt, schnell, gute DX |
| **PWA** | `vite-plugin-pwa` | Service Worker + Manifest out-of-the-box |
| **Styling** | Tailwind CSS + shadcn/ui | konsistent, mobile-first, schöne Defaults |
| **Icons** | Lucide React | passt zu shadcn, sauber, 1000+ Icons |
| **Animation** | Framer Motion | Mikroanimationen ohne Schmerzen |
| **Karten** | Leaflet + OpenStreetMap Tiles | kostenlos, leichtgewichtig |
| **Backend** | Supabase | Postgres + Auth + Realtime + Storage + Edge Functions in einem |
| **Hosting** | Vercel oder Cloudflare Pages | großzügiger Free-Tier |
| **OTP** | Telegram Gateway API | ~1 ct pro Code, 50× günstiger als SMS |
| **Geocoding** | Photon (Autocomplete) + Nominatim (Reverse) | beides OSM-basiert, kostenlos |
| **Push** | Web Push (VAPID) + optional Telegram-Bot | nativer Standard + Fallback für iOS-Nutzer ohne Homescreen |

---

## 4. Authentifizierung

### Hauptweg: Telegram Gateway OTP

Telegram bietet seit 2024 einen offiziellen Verifikationsdienst, der OTPs direkt in den Telegram-Chat des Nutzers liefert. Pro zugestelltem Code etwa 1 US-Cent; unzugestellte Codes werden automatisch refundet.

**Flow:**

```
PWA ─[1. Phone eingeben]──> Supabase Edge Function
                                  │
                                  │ sendVerificationMessage
                                  ▼
                         Telegram Gateway API
                                  │
                                  │ OTP in Telegram-Chat
                                  ▼
                              Nutzer
PWA <─[2. Code zurück]──── Edge Function ──[3. validieren]──> Telegram
PWA <─[4. Session-Token]── Supabase Auth
```

**Komponenten:**
- **Supabase Edge Function** `send-otp`: ruft `sendVerificationMessage` der Telegram Gateway API auf, speichert `request_id` mit der Telefonnummer in einer temporären Tabelle
- **Supabase Edge Function** `verify-otp`: prüft via `checkVerificationStatus`, erstellt bei Erfolg eine Supabase Auth-Session
- **Vor dem Senden**: optional `checkSendAbility` aufrufen → wenn Nutzer kein Telegram hat, könnten wir später einen SMS-Fallback einbauen (für V1 nicht nötig)

**API-Schlüssel:** Aus dem Telegram Gateway Dashboard (`gatewayapi.telegram.org`), als Secret in Supabase hinterlegt.

### Profilerstellung

Beim allerersten Login (neuer Account):
1. OTP-Verifikation erfolgreich
2. Zusatzformular: Vorname + Nachname (Pflicht), Telegram-Kontakt teilen (Toggle für „Telefonnummer in Einträgen sichtbar")
3. Profil wird in `profiles`-Tabelle angelegt (per Trigger aus `auth.users`)

Bei bestehenden Accounts: direkt zur Liste.

---

## 5. Datenmodell

### Tabellen-Übersicht

```
auth.users (Supabase)
    │
    ├──► profiles (1:1)
    │       ├── role: 'user' | 'admin'
    │       ├── show_phone, telegram_chat_id
    │       └── avatar_color (aus Name generiert)
    │
    ├──► listings (1:n)
    │       ├── type: 'angebot' | 'anfrage'
    │       ├── origin_* (label, city, lat, lng)
    │       ├── destination_* (label, city, lat, lng)
    │       ├── departure_at, seats, notes
    │
    ├──► listings_archive (1:n, von Cron befüllt)
    │
    └──► push_subscriptions (1:n)
            └── ein Eintrag pro Gerät
```

### SQL-Schema

```sql
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
```

---

## 6. Echtzeit-Synchronisation

Supabase Realtime sendet jede `INSERT` / `UPDATE` / `DELETE`-Operation auf der `listings`-Tabelle als WebSocket-Event an alle verbundenen Clients (typische Latenz: 50–200 ms).

**Frontend-Pattern:**
```typescript
const channel = supabase
  .channel('listings-feed')
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'listings' },
      handleListingChange)
  .subscribe();
```

**UX-Detail:** Neue Einträge werden nicht direkt in die sichtbare Liste eingefügt (würde unter dem Daumen springen), sondern als unauffälliges Banner oben angezeigt: „2 neue Einträge ↑". Klick → Banner verschwindet, Liste scrollt nach oben, neue Einträge erscheinen sanft animiert.

Eigene Änderungen werden sofort optimistisch in die UI gerendert (kein Warten auf Round-Trip).

---

## 7. Geolocation & Geocoding

### Browser-Geolocation

Die `navigator.geolocation.getCurrentPosition()`-API liefert Koordinaten, vorausgesetzt die Seite läuft über HTTPS (Standard bei Vercel/Cloudflare). Der Browser fragt einmalig nach Erlaubnis.

### Reverse-Geocoding (Koordinaten → Ortsname)

**Nominatim** (`nominatim.openstreetmap.org/reverse`):
- Kostenlos, attributionspflichtig
- Liefert strukturierte Adressdaten inkl. `city`/`town`/`village`
- Max. 1 Anfrage pro Sekunde — bei selten genutzter Aktion (GPS-Klick) kein Problem
- Daraus extrahieren wir `origin_city` für die Gruppierung

### Forward-Geocoding mit Autocomplete

**Photon** (`photon.komoot.io`):
- OSM-basiert, ebenfalls kostenlos
- Schnelle Vorschläge beim Tippen
- Liefert direkt strukturierte Antworten mit Koordinaten

### Praktischer Ablauf im Formular

```
[ Von wo? _____________________________ ]  📍
                                            │
                                  Tippt User: Photon-Autocomplete
                                  Klickt User: GPS → Nominatim Reverse

[ Wohin? ______________________________ ]
                                  Tippt User: Photon-Autocomplete
```

Der GPS-Vorschlag landet als Text im Feld, bleibt aber editierbar. Erst beim Submit werden Koordinaten + Stadt aus dem letzten Geocoder-Ergebnis übernommen.

---

## 8. Matching-Logik

### Kriterien (DB-side in `find_matches`)

| Kriterium | Schwellwert |
|---|---|
| Abfahrtsort | Haversine-Distanz ≤ 15 km |
| Zielort | Haversine-Distanz ≤ 15 km |
| Abfahrtszeit | ± 2 Stunden |
| Plätze (Angebot ↔ Anfrage) | Angebot.seats ≥ Anfrage.seats |
| Eigener Eintrag | ausgeschlossen |
| Eintragstyp | gegenseitig (Anfrage ↔ Angebot) |

Schwellwerte sind als Konstanten im Funktionscode hinterlegt, jederzeit anpassbar.

### UX

**Beim Erstellen einer Anfrage / eines Angebots:**

1. User füllt Formular aus, drückt „Einstellen"
2. Insert geht in Datenbank
3. Direkt danach Aufruf von `find_matches(new_id)`
4. **Wenn Treffer:** Bottom-Sheet zeigt sich:
   > **🎯 Es gibt schon 2 passende Angebote!**
   > [Karte 1: Max — Freiburg → München, Sa 14:00, 3 Plätze]
   > [Karte 2: Anna — Freiburg HBF → München Hbf, Sa 15:30, 2 Plätze]
   > [Buttons: Detail ansehen / Mein Eintrag bleibt aktiv]
5. **Wenn keine Treffer:** kurzer Toast „Geht klar! 🎯 Dein Eintrag ist online."

Matching ist **vorschlagend, nie verbindend.** Es wird nichts automatisch verknüpft.

### Asynchrones Matching für Push

Wenn nach dem Einstellen später ein Match entsteht (jemand anderes erstellt einen passenden Eintrag), läuft das Matching durch denselben Trigger auch in die andere Richtung und löst eine Push-Notification an den ursprünglichen Ersteller aus.

---

## 9. Push Notifications

### Web Push (primär)

**Standard-Web-Push mit VAPID-Schlüsseln:**
- Service Worker empfängt Notifications, auch bei geschlossener App
- Funktioniert auf Android Chrome/Firefox/Edge sofort
- Auf iOS: erst ab Safari 16.4 und nur wenn App auf Homescreen installiert ist

**Architektur:**
```
Insert in listings (Edge Function Trigger)
        │
        ▼
   find_matches() für neuen Eintrag aufrufen
        │
        ▼
   für jeden gematchten User:
   push_subscriptions abfragen
        │
        ▼
   web-push-Library (Node) → Push Service der Browser
        │
        ▼
   Service Worker auf Endgerät
        │
        ▼
   self.registration.showNotification(...)
```

**Inhalt:** „🎯 Neues passendes Angebot: Freiburg → München, morgen 14:00" — Klick öffnet die App auf dem Detail-Screen des Matches.

### Telegram-Bot (optional, als Opt-in)

In den Einstellungen kann der User „Auch via Telegram benachrichtigen" aktivieren:

1. User klickt Toggle
2. App generiert One-Time-Token und Deeplink: `t.me/kommit_bot?start=TOKEN`
3. User klickt → Telegram öffnet sich → Bot startet
4. Bot empfängt `/start TOKEN`, schreibt `telegram_chat_id` ins User-Profil
5. Bot sendet kurze Bestätigung
6. Ab jetzt bei jedem Match: parallele Nachricht via Bot

**Vorteile:**
- Funktioniert auf iOS ohne Homescreen-Installation
- Funktioniert bei geschlossener App
- Telegram ist bei allen Nutzern ohnehin installiert (sonst hätten sie ja kein OTP empfangen)
- Komplett kostenlos

**Hosting des Bots:** als zweite Supabase Edge Function (Webhook). Kein dauerhaftes Polling, kein eigener Server.

---

## 10. Screens im Detail

### 10.1 Login
- App-Logo + Wordmark mittig oben
- „Hey 👋 — schön, dass du da bist."
- Telefonnummer-Eingabe (DE-Flagge default, Live-Formatierung)
- Button „Code anfordern"
- Step 2 (gleicher Screen): 6-stelliges OTP-Feld mit `autocomplete="one-time-code"` (iOS-Suggest)
- Mini-Text: „Wir schicken dir den Code via Telegram"
- Bei neuem User: zusätzliches Profilformular (Vor- + Nachname)

### 10.2 Liste (Hauptscreen)
- Header: Logo links, Avatar des Users rechts (→ Profil)
- Segmented Control: `Angebote · Anfragen · Alle`
- Filter-Chips: „Heute", „Diese Woche", „Alle"
- Gruppierte Liste mit Sticky-Headers: `📍 Freiburg im Breisgau (4)`
- Eintragsschemata: Avatar-Bubble + Vorname, Route (`Freiburg ───→ München`), Zeit-Pille, Plätze-Icon, Quick-Action-Buttons (💬 📞) wenn Nummer öffentlich
- Floating Action Button unten rechts (`+`)
- Pull-to-Refresh
- Realtime-Banner bei neuen Einträgen: „2 neue Einträge ↑"

### 10.3 Detail
- Hero-Bereich: große Routendarstellung, optional kleine Karte
- User-Card: Avatar, voller Name, „Mitglied seit ..."
- Zwei große Kontakt-Buttons (Telegram / Anruf), wenn Nummer öffentlich
- Eckdaten-Liste: Datum & Zeit, Plätze, Typ (Badge)
- Notiz des Erstellers
- Bei eigenem Eintrag: „Bearbeiten" + „Löschen" unten
- Bei Admin: zusätzlich „Als Admin bearbeiten"

### 10.4 Erstellen
- Großer Toggle oben: „🚗 Ich biete an" / „🙋 Ich suche eine Mitfahrt"
- „Von wo?" mit Autocomplete + GPS-Button (`📍`)
- „Wohin?" mit Autocomplete
- „Wann?" Native Date+Time-Picker
- „Plätze" Stepper (`− 3 +`)
- „Anmerkung" optionale Textarea
- Sticky Submit-Button unten
- Nach Submit: Match-Sheet (falls Treffer) oder Toast „Geht klar! 🎯"

### 10.5 Editieren
- Identisches Layout zu Erstellen, vorausgefüllt
- Bei Änderung von Route/Zeit: dezente Info „Achtung, dadurch könnten frühere Matches nicht mehr passen."
- Lösch-Button ganz unten in Coral, mit Bestätigung

### 10.6 Profil
- Avatar groß oben (Initialen-Bubble)
- Voller Name (editierbar via Stift-Icon)
- Telefonnummer maskiert: „+49 170 •••• 567"
- Toggle: „Telefonnummer in meinen Einträgen anzeigen"
- Sektion „Meine aktiven Einträge"
- Sektion „Vergangene Fahrten" (collapsed)
- „Abmelden" unten

### 10.7 Einstellungen
- Toggle „Push-Benachrichtigungen" (triggert Browser-Permission)
- Toggle „Auch via Telegram benachrichtigen" (Bot-Deeplink)
- „App auf Homescreen" (kontextueller Hinweis für iOS)
- Links: Datenschutz, Impressum
- App-Version
- „Abmelden"
- Für Admins: Link in den Admin-Bereich

### 10.8 Admin-View
- Tabelle aller aktiven Einträge mit Filtern (Typ, Stadt, Datum)
- Zeile: User, Route, Zeit, Plätze, Erstellt am — plus „Bearbeiten" + „Löschen"
- Schalter „Archiv anzeigen"
- (V1.1: einfache User-Übersicht mit Admin-Rolle vergeben, User deaktivieren)
- Minimalistisch, keine Charts

---

## 11. Design-System

### Farbpalette „Sunny"

| Token | Hex | Verwendung |
|---|---|---|
| `--primary` | `#FF8A4C` | Buttons, Aktionen, Logo |
| `--primary-hover` | `#F77637` | Hover/Active |
| `--accent` | `#3DA9FC` | Sekundäre Aktionen, Links |
| `--bg` | `#FFFBF5` | App-Hintergrund |
| `--surface` | `#FFFFFF` | Karten, Dialoge |
| `--border` | `#F0EAE2` | dezente Trennlinien |
| `--text-primary` | `#1A1A2E` | Fließtext |
| `--text-secondary` | `#6B7280` | Sekundärer Text |
| `--success` | `#10B981` | Erfolgsmeldungen |
| `--warning` | `#FBBF24` | Warnhinweise |
| `--danger` | `#F97066` | Coral statt grellem Rot, weicher |

### Typografie

- **Primärschrift:** DM Sans (Google Fonts, gratis)
- Headlines: 600/700, body: 400/500
- Größen: 12 / 14 / 16 / 20 / 24 / 32 / 40 px

### Form-Sprache

- **Rundungen:** `rounded-2xl` (16 px) bis `rounded-3xl` (24 px)
- **Schatten:** weich, mehrere Layer (`shadow-sm` / `shadow-md` aus Tailwind)
- **Whitespace:** großzügig, mindestens 16 px Padding in Karten
- **Touchziele:** mindestens 44 × 44 px
- **Avatare:** farbige Bubbles mit Initialen, Farbe deterministisch aus User-ID

### Mikroanimationen (Framer Motion)

- Karten skalieren beim Tap (0.97) und federn zurück
- Neue Einträge sliden sanft von oben ein (Realtime)
- Bottom-Sheets mit Spring-Animation
- Logo-Pin „hüpft" beim App-Start und bei neuem Match

### Tonalität

Du-Form, direkt, freundlich, nie steif. Beispiele:
- „Hey 👋 — schön, dass du da bist." (statt „Herzlich willkommen")
- „Wie lautet deine Nummer?" (statt „Bitte geben Sie Ihre Telefonnummer ein")
- „Geht klar! 🎯 Deine Anfrage ist online." (statt „Eintrag erfolgreich erstellt")
- „Hm, der Code passt nicht. Nochmal? 🤔" (statt „Ungültiger Verifizierungscode")

---

## 12. App-Name & Logo

### Name: **Kommit**

Doppelte Lesart:
- „Komm mit" — direkt zum Kern: jemand fährt, du kommst mit
- „commit" — sich verbindlich auf eine Fahrt einlassen

Vorteile: kurz (6 Buchstaben, 2 Silben), einprägsam, einfach auszusprechen, gut für Domain und App-Stores.

**Domain-Optionen (vor Festlegung prüfen):** `kommit.app`, `kommit.de`, `kommit.community`

### Logo

#### Wordmark — primäre Verwendung

<p align="center">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 180" width="480" role="img" aria-label="kommit">
  <title>kommit</title>
  <text x="10" y="140" font-family="'DM Sans', 'Inter', system-ui, 'Helvetica Neue', sans-serif" font-weight="700" font-size="140" letter-spacing="-6" fill="#1A1A2E">kommit</text>
  <g transform="translate(470, 60)">
    <path d="M 30,0 C 13.4,0 0,13.4 0,30 C 0,47 15,60 30,80 C 45,60 60,47 60,30 C 60,13.4 46.6,0 30,0 Z" fill="#FF8A4C"/>
    <circle cx="30" cy="30" r="11.5" fill="#FFFBF5"/>
  </g>
</svg>
</p>

- **Schrift:** DM Sans Bold (Weight 700), lowercase, Letter-Spacing −6
- **Textfarbe:** `#1A1A2E`
- **Pin:** Sunny-Orange `#FF8A4C` mit cremefarbenem Innenkreis `#FFFBF5`
- **Verhältnis:** Pin-Höhe ≈ 57 % der Cap-Height — groß genug, um als Markenzeichen zu wirken, klein genug, um typografisch als „Endpunkt" zu lesen
- **Datei:** `kommit_wordmark.svg`

#### Standalone-Mark — App-Icon und Favicon

<p align="center">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="180" role="img" aria-label="kommit app icon">
  <title>kommit</title>
  <rect x="0" y="0" width="240" height="240" rx="56" fill="#FF8A4C"/>
  <text x="32" y="178" font-family="'DM Sans', 'Inter', system-ui, sans-serif" font-weight="700" font-size="170" letter-spacing="-3" fill="#FFFBF5">k</text>
  <g transform="translate(150, 110)">
    <path d="M 24,0 C 10.7,0 0,10.7 0,24 C 0,37.5 12,49 24,65 C 36,49 48,37.5 48,24 C 48,10.7 37.3,0 24,0 Z" fill="#FFFBF5"/>
    <circle cx="24" cy="24" r="9" fill="#FF8A4C"/>
  </g>
</svg>
</p>

- **Form:** abgerundetes Quadrat 240 × 240, `rx="56"` (~23 % Radius, harmoniert mit iOS-App-Icon-Maske)
- **Hintergrund:** Sunny-Orange `#FF8A4C`
- **Buchstabe & Pin:** Cream `#FFFBF5`, Pin-Innenkreis nimmt das Orange auf — Echo des Hintergrunds, gibt Tiefe ohne Schatten
- **Skalierung:** funktioniert von 16 px (Favicon) bis 1024 px (App Store)
- **Datei:** `kommit_icon.svg`

#### Designprinzipien

- **Flat:** keine Gradients, keine Schatten, keine 3D-Effekte
- **Zwei-Farben-System pro Kontext:** Wordmark = dunkler Text + orange Akzent; Icon = orange + creme
- **Pin als wiederkehrendes Motiv:** verbindet Wordmark und Icon visuell, baut Wiedererkennung auf

#### Animation

Der Pin „hüpft" sanft als Mikroanimation in zwei Momenten:

1. **App-Start** — beim Laden der Splash-/Home-View ein kurzer Spring-Bounce (200 ms, leichte Skalierung 1 → 1.15 → 1)
2. **Neues Match** — bei eingehender Push-Notification, falls App im Vordergrund

Umsetzung in Framer Motion:

```tsx
<motion.div
  animate={{ scale: [1, 1.15, 1] }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  {/* Pin-SVG */}
</motion.div>
```

---

## 13. Onboarding

3 Slides beim ersten Start (überspringbar), gespeichert per `localStorage`-Flag:

**Slide 1**
> 🚗 **Mitfahrgelegenheiten in der Community.**
> Finde Mitfahrer oder eine Mitfahrt — alles an einem Ort.

**Slide 2**
> 🎯 **Wir matchen automatisch.**
> Wenn du eine Anfrage stellst und schon ein passendes Angebot da ist, sagen wir Bescheid.

**Slide 3**
> 💬 **Direkter Kontakt.**
> Per Telegram oder Anruf — kein extra Chat, keine Umwege.

> [Button: Los geht's →]

Alle anderen Permission-Prompts (Standort, Push) werden kontextuell abgefragt, wenn sie zum ersten Mal benötigt werden.

---

## 14. Datenschutz & Rechtliches

Kurz und pragmatisch:

### Datenschutzerklärung — Pflichtangaben
- Welche Daten: Telefonnummer (Auth + optional sichtbar), Vor-/Nachname (in Einträgen sichtbar), Standortdaten der Einträge (für alle User sichtbar)
- Auftragsverarbeiter: Supabase (EU-Region Frankfurt wählen), Telegram (für OTP-Auslieferung)
- Speicherdauer: aktive Einträge bis 24 h nach Abfahrt, danach Archiv (90 Tage); Profildaten bis Kontolöschung
- Rechte: Auskunft, Löschung („Konto löschen"-Button), Berichtigung

### Impressum
- §5 TMG: Name, Anschrift, Kontakt
- Bei nicht-kommerzieller Community-Nutzung trotzdem nötig (V. i. S. d. P.)

### AVV mit Supabase
- Im Supabase-Dashboard akzeptierbar
- DPA Supabase deckt EU-Compliance ab, wenn EU-Region gewählt wird

### Beim Registrieren
- Checkbox: „Ich akzeptiere [Datenschutz] und [AGB]"
- Keine Cookie-Banner-Pflicht (keine Tracking-Cookies)

**Generatoren** wie eRecht24 oder Datenschutz-Generator.de liefern brauchbare Textbausteine in ~10 Minuten.

---

## 15. Admin-Bereich

### Rollenmodell
- `profiles.role` mit Default `'user'`
- Manuell in Supabase-Tabellenansicht zum ersten Admin promoten
- Spätere Admins über Admin-View vergeben (V1.1)

### Berechtigungen
RLS-Policies prüfen via `is_admin()`-Helper:
- Admin kann **alle** Einträge bearbeiten und löschen
- Admin kann andere User-Profile updaten

### Frontend
- Admin-Status beim Login mitgeladen, in App-State gehalten
- Sichtbar nur als „🛡 Admin-Bereich"-Link in den Einstellungen
- Route-Guard: Direkt-URL ohne Admin-Rechte → Redirect zur Liste

### V1-Funktionen
- Tabelle aller Einträge mit Filter
- Bearbeiten / Löschen pro Eintrag
- Archiv-Toggle

### V1.1-Erweiterung
- User-Liste mit Admin-Rolle vergeben/entziehen
- User deaktivieren (soft-disable)
- Einfache Statistik (Anzahl Einträge pro Stadt, MAU)

---

## 16. Phasen-/Sprint-Plan

Realistische Schätzungen für Hobbyzeit (~5 h/Tag effektive Entwicklung).

### Phase 1 — Foundation (~2 Tage)
- Git-Repo, Vercel-Account, Supabase-Projekt (EU-Region!)
- Vite + React + TypeScript + Tailwind + shadcn/ui + Lucide
- Komplettes SQL-Schema einspielen
- Erste Komponenten: Button, Card, Input, Sheet aus shadcn

### Phase 2 — Auth (~2 Tage)
- Supabase Edge Functions `send-otp` + `verify-otp`
- Telegram Gateway Account, API-Token in Supabase Secret
- Login-Screen + OTP-Flow
- Profilerstellung (Vor-/Nachname) für neue User

### Phase 3 — Core CRUD (~3 Tage)
- Listen-Screen mit Sticky-Group-Headern
- Detail-Screen mit Kontakt-Buttons
- Erstellen-Formular inkl. Photon-Autocomplete + GPS-Button (Nominatim)
- Editieren-Screen + Löschen

### Phase 4 — Realtime + Matching (~2 Tage)
- Realtime-Subscription auf `listings`
- „Neue Einträge"-Banner-UX
- `find_matches`-Call nach Insert
- Match-Sheet beim Erstellen

### Phase 5 — Notifications (~2 Tage)
- VAPID-Schlüssel generieren
- Service Worker mit Web-Push-Handler
- Edge Function für Push-Versand bei Match
- Optional: Telegram-Bot Edge Function für Bot-Notifications

### Phase 6 — Polish + Onboarding (~2 Tage)
- Profil + Einstellungen
- 3-Slide-Onboarding
- PWA Manifest, App-Icons in allen Größen
- Framer-Motion-Mikroanimationen
- DM Sans laden, Farben final ziehen

### Phase 7 — Admin (~1 Tag)
- Admin-View Listings
- Route-Guards

### Phase 8 — Deploy + Rechtliches (~1 Tag)
- Domain registrieren, Vercel verbinden
- Datenschutzerklärung + Impressum erstellen (Generator)
- AVV in Supabase akzeptieren
- Beta-Test mit kleinem Kreis

**Gesamt: ~15 Tage**, also etwa 3 Wochen bei Hobby-Tempo.

---

## 17. Kostenübersicht

| Posten | Kosten |
|---|---|
| Supabase Free Tier | 0 € |
| Hosting (Vercel/Cloudflare Pages) | 0 € |
| Domain | ~10–15 €/Jahr |
| OTP via Telegram Gateway (~100/Monat) | ~1 €/Monat |
| Geocoding (Photon/Nominatim) | 0 € |
| Push Notifications (Web Push) | 0 € |
| Telegram-Bot | 0 € |

**Erwartete Gesamtkosten:** ~25–30 €/Jahr für die laufende V1.

**Skalierungs-Punkte** (irrelevant für V1, aber gut zu wissen):
- Supabase Free deckt bis 50 000 monatlich aktive User
- Bei mehr DB-Traffic: Supabase Pro ab 25 $/Monat
- Bei mehr Geocoding-Anfragen: MapTiler 100 k/Monat gratis, danach gestaffelt

---

## 18. Offene Punkte & nächste Schritte

### Vor Implementierungsstart zu klären
- [ ] Domain final auswählen und registrieren
- [ ] Telegram Gateway-Account anlegen (`gatewayapi.telegram.org`)
- [ ] Telegram-Bot-Account via `@BotFather` einrichten
- [ ] Supabase-Projekt in EU-Region (Frankfurt) anlegen
- [ ] Datenschutztexte mit Generator erzeugen

### Mögliche Erweiterungen für spätere Versionen
- **V1.1:** BCC Login als zweite Auth-Option (Auth0 OIDC), User-Admin im Admin-View
- **V1.2:** Filter nach Datum & Stadt in der Liste
- **V2.0:** Wiederkehrende Einträge (z. B. „jeden Sonntag")
- **V2.0:** Bewertungssystem oder „Vertrauenslevel" zwischen Usern
- **V2.0:** Optionale Karte mit allen aktiven Routen

### Mögliche Visualisierungen für die nächste Planungsrunde
- Wireframes der Hauptscreens (Liste, Detail, Erstellen)
- Logo-Entwurf als SVG
- Komplette Komponenten-Library als Storybook-ähnliches Mockup

---

*Dokument-Stand: V1.0 — wird parallel zur Umsetzung aktualisiert.*
