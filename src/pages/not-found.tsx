import { Link } from "react-router";
import { ROUTES } from "@/lib/constants";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground text-lg">Seite nicht gefunden.</p>
      <Link
        to={ROUTES.HOME}
        className="text-primary hover:text-primary/80 underline"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
