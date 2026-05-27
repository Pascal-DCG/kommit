import { AppShell } from "@/components/layout/app-shell";

export default function DatenschutzPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <h1 className="text-2xl font-bold">Datenschutzerklaerung</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1. Verantwortlicher</h2>
          <p className="text-sm text-muted-foreground">
            [Name und Anschrift des Verantwortlichen hier einfuegen]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2. Welche Daten wir erheben</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Telefonnummer</strong> — fuer die Authentifizierung via
              Telegram OTP und optional sichtbar in deinen Eintraegen.
            </li>
            <li>
              <strong>Vor- und Nachname</strong> — sichtbar fuer andere Nutzer
              in deinen Eintraegen.
            </li>
            <li>
              <strong>Standortdaten der Eintraege</strong> — Abfahrts- und
              Zielort (Koordinaten und Ortsname) sind fuer alle eingeloggten
              Nutzer sichtbar.
            </li>
            <li>
              <strong>Push-Subscription-Daten</strong> — Endpoint und Schluessel
              fuer Web-Push-Benachrichtigungen, gespeichert pro Geraet.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3. Auftragsverarbeiter</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Supabase Inc.</strong> — Datenbank und Authentifizierung
              (EU-Region Frankfurt). DPA liegt vor.
            </li>
            <li>
              <strong>Telegram</strong> — Zustellung des
              Verifizierungscodes (OTP) an dein Telegram-Konto.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4. Speicherdauer</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Aktive Eintraege werden 24 Stunden nach Abfahrtszeit automatisch
              ins Archiv verschoben.
            </li>
            <li>Archivierte Eintraege werden nach 90 Tagen geloescht.</li>
            <li>
              Profildaten bleiben bis zur Kontolöschung gespeichert.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5. Deine Rechte</h2>
          <p className="text-sm text-muted-foreground">
            Du hast das Recht auf Auskunft, Berichtigung und Loeschung deiner
            Daten. Du kannst dein Konto jederzeit in den Einstellungen loeschen.
            Bei Fragen wende dich an den Verantwortlichen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">6. Cookies</h2>
          <p className="text-sm text-muted-foreground">
            Kommit verwendet keine Tracking-Cookies. Es werden ausschliesslich
            technisch notwendige Daten im Local Storage gespeichert
            (Authentifizierungs-Token, Onboarding-Status).
          </p>
        </section>
      </div>
    </AppShell>
  );
}
