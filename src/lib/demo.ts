import type { Listing, Profile } from "@/types";
import type { User, Session } from "@supabase/supabase-js";

const DEMO_KEY = "kommit_demo";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_KEY) === "1";
}

export function enableDemoMode() {
  localStorage.setItem(DEMO_KEY, "1");
}

export function disableDemoMode() {
  localStorage.removeItem(DEMO_KEY);
}

const DEMO_USER_ID = "demo-user-00000000-0000-0000-0000-000000000001";
const NOW = new Date();

function hoursFromNow(h: number): string {
  return new Date(NOW.getTime() + h * 3600_000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(NOW.getTime() - d * 86400_000).toISOString();
}

export const DEMO_USER: User = {
  id: DEMO_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "",
  phone: "+491701234567",
  app_metadata: {},
  user_metadata: {},
  created_at: daysAgo(120),
  updated_at: daysAgo(1),
};

export const DEMO_SESSION: Session = {
  access_token: "demo",
  refresh_token: "demo",
  expires_in: 3600,
  expires_at: Math.floor(NOW.getTime() / 1000) + 3600,
  token_type: "bearer",
  user: DEMO_USER,
};

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  first_name: "Max",
  last_name: "Mustermann",
  phone: "+491701234567",
  show_phone: true,
  telegram_chat_id: null,
  role: "admin",
  avatar_color: "#FF8A4C",
  created_at: daysAgo(120),
  updated_at: daysAgo(1),
};

const OTHER_PROFILES: Profile[] = [
  {
    id: "demo-user-00000000-0000-0000-0000-000000000002",
    first_name: "Anna",
    last_name: "Schmidt",
    phone: "+491729876543",
    show_phone: true,
    telegram_chat_id: null,
    role: "user",
    avatar_color: "#3DA9FC",
    created_at: daysAgo(80),
    updated_at: daysAgo(2),
  },
  {
    id: "demo-user-00000000-0000-0000-0000-000000000003",
    first_name: "Lukas",
    last_name: "Mueller",
    phone: "+491601112233",
    show_phone: false,
    telegram_chat_id: null,
    role: "user",
    avatar_color: "#10B981",
    created_at: daysAgo(45),
    updated_at: daysAgo(5),
  },
  {
    id: "demo-user-00000000-0000-0000-0000-000000000004",
    first_name: "Sophie",
    last_name: "Weber",
    phone: "+491775556677",
    show_phone: true,
    telegram_chat_id: null,
    role: "user",
    avatar_color: "#F97066",
    created_at: daysAgo(15),
    updated_at: daysAgo(3),
  },
];

export const DEMO_PROFILES: Record<string, Profile> = {
  [DEMO_PROFILE.id]: DEMO_PROFILE,
  ...Object.fromEntries(OTHER_PROFILES.map((p) => [p.id, p])),
};

// Lat/lng grob fuer drei Orte im Breisgau
const BOETZINGEN = { city: "Boetzingen", lat: 48.0689, lng: 7.7172 };
const FREIBURG = { city: "Freiburg im Breisgau", lat: 47.9959, lng: 7.8494 };
const ENDINGEN = { city: "Endingen am Kaiserstuhl", lat: 48.1417, lng: 7.7042 };
const LILIENHOF = {
  city: "Freiburg im Breisgau",
  label: "Lilienhof, Freiburg",
  lat: 47.9892,
  lng: 7.8627,
};

export const DEMO_LISTINGS: Listing[] = [
  {
    id: "demo-listing-00000000-0000-0000-0000-000000000001",
    user_id: OTHER_PROFILES[0]!.id,
    type: "angebot",
    origin_label: `Bahnhof ${BOETZINGEN.city}`,
    origin_city: BOETZINGEN.city,
    origin_lat: BOETZINGEN.lat,
    origin_lng: BOETZINGEN.lng,
    destination_label: LILIENHOF.label,
    destination_city: LILIENHOF.city,
    destination_lat: LILIENHOF.lat,
    destination_lng: LILIENHOF.lng,
    departure_at: hoursFromNow(5),
    seats: 3,
    notes: "Treffpunkt am Bahnhofsvorplatz. Bin puenktlich!",
    created_at: hoursFromNow(-2),
    updated_at: hoursFromNow(-2),
  },
  {
    id: "demo-listing-00000000-0000-0000-0000-000000000002",
    user_id: OTHER_PROFILES[1]!.id,
    type: "anfrage",
    origin_label: `Marktplatz ${BOETZINGEN.city}`,
    origin_city: BOETZINGEN.city,
    origin_lat: BOETZINGEN.lat + 0.002,
    origin_lng: BOETZINGEN.lng + 0.001,
    destination_label: LILIENHOF.label,
    destination_city: LILIENHOF.city,
    destination_lat: LILIENHOF.lat,
    destination_lng: LILIENHOF.lng,
    departure_at: hoursFromNow(5.5),
    seats: 1,
    notes: null,
    created_at: hoursFromNow(-1),
    updated_at: hoursFromNow(-1),
  },
  {
    id: "demo-listing-00000000-0000-0000-0000-000000000003",
    user_id: DEMO_USER_ID,
    type: "angebot",
    origin_label: `Freiburg Hauptbahnhof`,
    origin_city: FREIBURG.city,
    origin_lat: FREIBURG.lat,
    origin_lng: FREIBURG.lng,
    destination_label: `Endingen Rathaus`,
    destination_city: ENDINGEN.city,
    destination_lat: ENDINGEN.lat,
    destination_lng: ENDINGEN.lng,
    departure_at: hoursFromNow(28),
    seats: 2,
    notes: "Habe Kofferraum frei fuer Instrumente.",
    created_at: hoursFromNow(-5),
    updated_at: hoursFromNow(-5),
  },
  {
    id: "demo-listing-00000000-0000-0000-0000-000000000004",
    user_id: OTHER_PROFILES[2]!.id,
    type: "anfrage",
    origin_label: `Endingen Bahnhof`,
    origin_city: ENDINGEN.city,
    origin_lat: ENDINGEN.lat,
    origin_lng: ENDINGEN.lng,
    destination_label: LILIENHOF.label,
    destination_city: LILIENHOF.city,
    destination_lat: LILIENHOF.lat,
    destination_lng: LILIENHOF.lng,
    departure_at: hoursFromNow(6),
    seats: 1,
    notes: "Kann bei Bedarf etwas Spritgeld zahlen.",
    created_at: hoursFromNow(-3),
    updated_at: hoursFromNow(-3),
  },
  {
    id: "demo-listing-00000000-0000-0000-0000-000000000005",
    user_id: OTHER_PROFILES[0]!.id,
    type: "angebot",
    origin_label: `Endingen Marktplatz`,
    origin_city: ENDINGEN.city,
    origin_lat: ENDINGEN.lat + 0.001,
    origin_lng: ENDINGEN.lng + 0.001,
    destination_label: LILIENHOF.label,
    destination_city: LILIENHOF.city,
    destination_lat: LILIENHOF.lat,
    destination_lng: LILIENHOF.lng,
    departure_at: hoursFromNow(29),
    seats: 4,
    notes: "Faehrt morgens auch Richtung Freiburg!",
    created_at: hoursFromNow(-4),
    updated_at: hoursFromNow(-4),
  },
  {
    id: "demo-listing-00000000-0000-0000-0000-000000000006",
    user_id: OTHER_PROFILES[1]!.id,
    type: "anfrage",
    origin_label: `Freiburg Stuehlinger`,
    origin_city: FREIBURG.city,
    origin_lat: FREIBURG.lat - 0.005,
    origin_lng: FREIBURG.lng - 0.01,
    destination_label: `Endingen Rathaus`,
    destination_city: ENDINGEN.city,
    destination_lat: ENDINGEN.lat,
    destination_lng: ENDINGEN.lng,
    departure_at: hoursFromNow(29.5),
    seats: 2,
    notes: null,
    created_at: hoursFromNow(-6),
    updated_at: hoursFromNow(-6),
  },
  {
    id: "demo-listing-00000000-0000-0000-0000-000000000007",
    user_id: OTHER_PROFILES[3]!.id,
    type: "angebot",
    origin_label: `Boetzingen Kirche`,
    origin_city: BOETZINGEN.city,
    origin_lat: BOETZINGEN.lat - 0.001,
    origin_lng: BOETZINGEN.lng - 0.001,
    destination_label: LILIENHOF.label,
    destination_city: LILIENHOF.city,
    destination_lat: LILIENHOF.lat,
    destination_lng: LILIENHOF.lng,
    departure_at: hoursFromNow(50),
    seats: 3,
    notes: "Naechste Woche Mittwoch.",
    created_at: hoursFromNow(-8),
    updated_at: hoursFromNow(-8),
  },
];
