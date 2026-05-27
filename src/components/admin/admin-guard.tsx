import { Navigate } from "react-router";
import { useAuthContext } from "@/hooks/use-auth-context";
import { ROUTES } from "@/lib/constants";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
