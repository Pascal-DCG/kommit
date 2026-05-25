import { APP_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-3">
        <img src="/kommit_icon.svg" alt="" className="h-12 w-12" />
        <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
      </div>
      <p className="text-muted-foreground text-lg">
        Mitfahrgelegenheit organisieren
      </p>
    </div>
  );
}
