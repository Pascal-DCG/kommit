import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Header } from "./header";
import { ROUTES } from "@/lib/constants";

interface AppShellProps {
  children: React.ReactNode;
  showFab?: boolean;
}

export function AppShell({ children, showFab = false }: AppShellProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-4">{children}</main>
      {showFab && (
        <button
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          onClick={() => navigate(ROUTES.CREATE)}
          title="Neuen Eintrag erstellen"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
