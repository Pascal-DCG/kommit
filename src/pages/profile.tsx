import { Navigate } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileView } from "@/components/profile/profile-view";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useProfile } from "@/hooks/use-profile";
import { ROUTES } from "@/lib/constants";

export default function ProfilePage() {
  const { profile, signOut } = useAuthContext();
  const { updateProfile } = useProfile();

  if (!profile) return <Navigate to={ROUTES.LOGIN} replace />;

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <ProfileView
          profile={profile}
          onUpdate={updateProfile}
          onSignOut={signOut}
        />
      </div>
    </AppShell>
  );
}
