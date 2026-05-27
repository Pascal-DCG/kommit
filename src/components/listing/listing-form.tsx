import { useState } from "react";
import { Car, Hand, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/location/autocomplete-input";
import { GpsButton } from "@/components/location/gps-button";
import type { GeocodingResult } from "@/hooks/use-geocoding";
import type { ListingType } from "@/types";

export interface ListingFormData {
  type: ListingType;
  origin: GeocodingResult;
  destination: GeocodingResult;
  departureAt: string;
  seats: number;
  notes: string;
}

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => Promise<void>;
  submitLabel?: string;
}

export function ListingForm({
  initialData,
  onSubmit,
  submitLabel = "Einstellen",
}: ListingFormProps) {
  const [type, setType] = useState<ListingType>(
    initialData?.type ?? "angebot",
  );
  const [originText, setOriginText] = useState(
    initialData?.origin?.label ?? "",
  );
  const [origin, setOrigin] = useState<GeocodingResult | null>(
    initialData?.origin ?? null,
  );
  const [destText, setDestText] = useState(
    initialData?.destination?.label ?? "",
  );
  const [destination, setDestination] = useState<GeocodingResult | null>(
    initialData?.destination ?? null,
  );
  const [departureAt, setDepartureAt] = useState(
    initialData?.departureAt ?? "",
  );
  const [seats, setSeats] = useState(initialData?.seats ?? 3);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departureAt) return;

    setError("");
    setLoading(true);
    try {
      await onSubmit({ type, origin, destination, departureAt, seats, notes });
    } catch (err) {
      setError((err as Error).message || "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  const handleGpsResult = (result: GeocodingResult) => {
    setOrigin(result);
    setOriginText(result.label);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 rounded-2xl bg-muted p-1">
        <button
          type="button"
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            type === "angebot"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setType("angebot")}
        >
          <Car className="h-4 w-4" />
          Ich biete an
        </button>
        <button
          type="button"
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            type === "anfrage"
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setType("anfrage")}
        >
          <Hand className="h-4 w-4" />
          Ich suche
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="origin">Von wo?</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <AutocompleteInput
              id="origin"
              value={originText}
              onChange={(v) => {
                setOriginText(v);
                if (origin && v !== origin.label) setOrigin(null);
              }}
              onSelect={(r) => setOrigin(r)}
              placeholder="Ort eingeben..."
            />
          </div>
          <GpsButton onResult={handleGpsResult} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Wohin?</Label>
        <AutocompleteInput
          id="destination"
          value={destText}
          onChange={(v) => {
            setDestText(v);
            if (destination && v !== destination.label) setDestination(null);
          }}
          onSelect={(r) => setDestination(r)}
          placeholder="Zielort eingeben..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="departure">Wann?</Label>
        <Input
          id="departure"
          type="datetime-local"
          value={departureAt}
          onChange={(e) => setDepartureAt(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Plaetze</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setSeats(Math.max(1, seats - 1))}
            disabled={seats <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-xl font-semibold">{seats}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setSeats(Math.min(10, seats + 1))}
            disabled={seats >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Anmerkung (optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="z.B. Treffpunkt am Bahnhof..."
          rows={2}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={loading || !origin || !destination || !departureAt}
      >
        {loading ? "Wird eingestellt..." : submitLabel}
      </Button>
    </form>
  );
}
