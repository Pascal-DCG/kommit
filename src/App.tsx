import { BrowserRouter, Routes, Route } from "react-router";
import { ROUTES } from "@/lib/constants";
import HomePage from "@/pages/home";
import NotFoundPage from "@/pages/not-found";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
