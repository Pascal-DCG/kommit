import { AppShell } from "@/components/layout/app-shell";

export default function ImpressumPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <h1 className="text-2xl font-bold">Impressum</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Angaben gemaess § 5 TMG</h2>
          <p className="text-sm text-muted-foreground">
            [Name]
            <br />
            [Strasse und Hausnummer]
            <br />
            [PLZ Ort]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Kontakt</h2>
          <p className="text-sm text-muted-foreground">
            E-Mail: [E-Mail-Adresse]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            Verantwortlich fuer den Inhalt nach § 55 Abs. 2 RStV
          </h2>
          <p className="text-sm text-muted-foreground">
            [Name]
            <br />
            [Anschrift]
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Haftungsausschluss</h2>
          <p className="text-sm text-muted-foreground">
            Die Inhalte dieser App wurden mit groesster Sorgfalt erstellt. Fuer
            die Richtigkeit, Vollstaendigkeit und Aktualitaet der Inhalte
            koennen wir jedoch keine Gewaehr uebernehmen. Kommit vermittelt
            lediglich Kontakte zwischen Nutzern — fuer die tatsaechliche
            Durchfuehrung von Fahrten uebernehmen wir keine Haftung.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
