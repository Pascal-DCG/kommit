import { Navigate } from "react-router";
import { LoginForm } from "@/components/auth/login-form";
import { ProfileSetup } from "@/components/auth/profile-setup";
import { useAuthContext } from "@/hooks/use-auth-context";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  const { isAuthenticated, isNewUser, loading, sendOtp, verifyOtp, completeProfile } =
    useAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && !isNewUser) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {isNewUser ? (
        <ProfileSetup onComplete={completeProfile} />
      ) : (
        <LoginForm
          onSendOtp={sendOtp}
          onVerifyOtp={async (phone, code, requestId) => {
            await verifyOtp(phone, code, requestId);
          }}
        />
      )}
    </div>
  );
}
