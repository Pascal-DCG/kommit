# Kommit

Mitfahr-PWA fuer eine Community. React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase.

## Commands

- `pnpm dev` — Dev-Server starten
- `pnpm build` — Production-Build (tsc + vite build)
- `pnpm lint` — ESLint ausfuehren
- `pnpm type-check` — TypeScript pruefen ohne Build

## Conventions

- Dateien: kebab-case (`listing-card.tsx`)
- Exports: PascalCase fuer Komponenten, camelCase fuer Hooks/Utils
- Komponenten in `src/components/`, gruppiert nach Feature (listing, auth, profile, admin, location, onboarding, common)
- shadcn/ui-Komponenten in `src/components/ui/` — nicht manuell aendern
- Seiten in `src/pages/`, 1:1 mit Routen
- Hooks in `src/hooks/`, Prefix `use-`
- Supabase-Client: `src/lib/supabase.ts` (Singleton)
- Typen: `src/types/database.ts` (DB-Schema), `src/types/index.ts` (App-Typen)
- Styling: Tailwind-Klassen, CSS-Variablen fuer Farben (Sunny-Palette)
- Path-Alias: `@/` zeigt auf `src/`
- Supabase Edge Functions: `supabase/functions/<name>/index.ts`
- DB-Migrationen: `supabase/migrations/`
