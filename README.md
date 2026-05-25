# Kommit

Mitfahrgelegenheit organisieren — eine PWA fuer die Community.

## Beschreibung

Kommit ist eine Progressive Web App, mit der eine Community Mitfahrgelegenheiten organisieren kann. Nutzer koennen Fahrten **anbieten** oder Mitfahrgelegenheiten **anfragen**. Alle Eintraege werden in Echtzeit synchronisiert und nach Abfahrtsort gruppiert.

## Tech-Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **Karten:** Leaflet + OpenStreetMap
- **Backend:** Supabase (Postgres + Auth + Realtime + Edge Functions)
- **Auth:** Telegram Gateway OTP
- **Geocoding:** Photon + Nominatim

## Entwicklung

```bash
pnpm install
pnpm dev
```

Umgebungsvariablen aus `.env.example` kopieren:

```bash
cp .env.example .env.local
```

## Projektstruktur

```
src/
  components/   Feature-basierte Komponenten
  pages/        Seiten (1:1 mit Routen)
  hooks/        Custom React Hooks
  lib/          Utilities, Supabase-Client, Konstanten
  types/        TypeScript-Typen
  styles/       Globale CSS-Variablen (Sunny-Palette)
supabase/
  migrations/   DB-Schema
  functions/    Edge Functions (OTP, Push, etc.)
```

## Dokumentation

Der vollstaendige Projektplan liegt unter [`docs/Kommit_Projektplan.md`](docs/Kommit_Projektplan.md).
