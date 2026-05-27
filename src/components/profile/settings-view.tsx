import { useNavigate } from "react-router";
import { Bell, BellOff, Info, LogOut, Shield, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePush } from "@/hooks/use-push";
import type { Profile } from "@/types";

interface SettingsViewProps {
  profile: Profile;
  userId: string;
  onToggleShowPhone: (value: boolean) => Promise<void>;
  onSignOut: () => void;
}

export function SettingsView({
  profile,
  userId,
  onToggleShowPhone,
  onSignOut,
}: SettingsViewProps) {
  const navigate = useNavigate();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePush({
    userId,
  });

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <Card className="divide-y p-0">
        {isSupported && (
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
            onClick={handlePushToggle}
          >
            <span className="flex items-center gap-3">
              {isSubscribed ? (
                <Bell className="h-4 w-4 text-primary" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              Push-Benachrichtigungen
            </span>
            <span
              className={`text-xs font-medium ${isSubscribed ? "text-success" : "text-muted-foreground"}`}
            >
              {isSubscribed ? "An" : "Aus"}
            </span>
          </button>
        )}

        <button
          className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
          onClick={() => onToggleShowPhone(!profile.show_phone)}
        >
          <span className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            Telefonnummer in Eintraegen anzeigen
          </span>
          <span
            className={`text-xs font-medium ${profile.show_phone ? "text-success" : "text-muted-foreground"}`}
          >
            {profile.show_phone ? "An" : "Aus"}
          </span>
        </button>
      </Card>

      <Card className="divide-y p-0">
        <button
          className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50"
          onClick={() => navigate("/datenschutz")}
        >
          <Info className="h-4 w-4 text-muted-foreground" />
          Datenschutz
        </button>
        <button
          className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50"
          onClick={() => navigate("/impressum")}
        >
          <Info className="h-4 w-4 text-muted-foreground" />
          Impressum
        </button>
      </Card>

      {profile.role === "admin" && (
        <Card className="p-0">
          <button
            className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50"
            onClick={() => navigate("/admin")}
          >
            <Shield className="h-4 w-4 text-primary" />
            Admin-Bereich
          </button>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Kommit v1.0.0
      </p>

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
