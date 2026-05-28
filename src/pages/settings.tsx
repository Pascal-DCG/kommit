import { Navigate } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsView } from "@/components/profile/settings-view";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useProfile } from "@/hooks/use-profile";
import { ROUTES } from "@/lib/constants";

export default function SettingsPage() {
  const { profile, user, signOut } = useAuthContext();
  const { updateProfile } = useProfile();

  if (!profile || !user) return <Navigate to={ROUTES.LOGIN} replace />;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <SettingsView
          profile={profile}
          userId={user.id}
          onToggleShowPhone={async (value) => {
            await updateProfile({ show_phone: value });
          }}
          onSignOut={signOut}
        />
      </div>
    </AppShell>
  );
}
