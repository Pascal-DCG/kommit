import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "@/hooks/use-auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { OnboardingSlides } from "@/components/onboarding/onboarding-slides";
import { ROUTES } from "@/lib/constants";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import CreatePage from "@/pages/create";
import EditPage from "@/pages/edit";
import DetailPage from "@/pages/detail";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import AdminPage from "@/pages/admin";
import { AdminGuard } from "@/components/admin/admin-guard";
import NotFoundPage from "@/pages/not-found";

const ONBOARDING_KEY = "kommit_onboarding_done";

function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingSlides onComplete={completeOnboarding} />;
  }

  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route
        path={ROUTES.HOME}
        element={
          <AuthGuard>
            <HomePage />
          </AuthGuard>
        }
      />
      <Route
        path={ROUTES.CREATE}
        element={
          <AuthGuard>
            <CreatePage />
          </AuthGuard>
        }
      />
      <Route
        path={ROUTES.EDIT}
        element={
          <AuthGuard>
            <EditPage />
          </AuthGuard>
        }
      />
      <Route
        path={ROUTES.DETAIL}
        element={
          <AuthGuard>
            <DetailPage />
          </AuthGuard>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <AuthGuard>
            <SettingsPage />
          </AuthGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN}
        element={
          <AuthGuard>
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          </AuthGuard>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
