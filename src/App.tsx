import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "@/hooks/use-auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ROUTES } from "@/lib/constants";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/not-found";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
