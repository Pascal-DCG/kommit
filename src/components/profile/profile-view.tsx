import { useState } from "react";
import { Check, LogOut, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { formatPhone } from "@/lib/format";
import type { Profile } from "@/types";

interface ProfileViewProps {
  profile: Profile;
  onUpdate: (updates: { first_name?: string; last_name?: string }) => Promise<void>;
  onSignOut: () => void;
}

export function ProfileView({ profile, onUpdate, onSignOut }: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ first_name: firstName.trim(), last_name: lastName.trim() });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar
          firstName={profile.first_name}
          lastName={profile.last_name}
          color={profile.avatar_color}
          size="lg"
        />

        {editing ? (
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Vorname"
            />
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nachname"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !firstName.trim() || !lastName.trim()}
                className="flex-1"
              >
                <Check className="mr-1 h-3 w-3" />
                Speichern
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFirstName(profile.first_name);
                  setLastName(profile.last_name);
                  setEditing(false);
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">
              {profile.first_name} {profile.last_name}
            </h1>
            <button
              onClick={() => setEditing(true)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {formatPhone(profile.phone)}
        </p>
      </div>

      <Card className="p-4">
        <p className="text-sm text-muted-foreground">
          Mitglied seit{" "}
          {new Date(profile.created_at).toLocaleDateString("de-DE", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </Card>

      <Button
        variant="ghost"
        className="w-full text-destructive hover:text-destructive"
        onClick={onSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Abmelden
      </Button>
    </div>
  );
}
