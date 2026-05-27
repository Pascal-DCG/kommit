import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "@/hooks/use-auth-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ROUTES } from "@/lib/constants";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import CreatePage from "@/pages/create";
import EditPage from "@/pages/edit";
import DetailPage from "@/pages/detail";
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
