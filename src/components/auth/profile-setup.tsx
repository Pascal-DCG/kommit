import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSetupProps {
  onComplete: (firstName: string, lastName: string) => Promise<void>;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onComplete(firstName.trim(), lastName.trim());
    } catch (err) {
      setError((err as Error).message || "Profil konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Fast geschafft!</h1>
        <p className="text-muted-foreground">
          Wie heisst du? Damit andere wissen, mit wem sie fahren.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Max"
            autoComplete="given-name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Mustermann"
            autoComplete="family-name"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !firstName.trim() || !lastName.trim()}
        >
          {loading ? "Wird gespeichert..." : "Los geht's"}
        </Button>
      </form>
    </div>
  );
}
