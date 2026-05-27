import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ListingList } from "@/components/listing/listing-list";
import { useListings } from "@/hooks/use-listings";
import { useProfiles } from "@/hooks/use-profiles";
import type { ListingType } from "@/types";

type TypeFilter = ListingType | "alle";

const FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "Alle", value: "alle" },
  { label: "Angebote", value: "angebot" },
  { label: "Anfragen", value: "anfrage" },
];

export default function HomePage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("alle");
  const { groupedByCity, listings, loading } = useListings({ typeFilter });

  const userIds = useMemo(
    () => [...new Set(listings.map((l) => l.user_id))],
    [listings],
  );
  const profiles = useProfiles(userIds);

  return (
    <AppShell showFab>
      <div className="space-y-4">
        <div className="flex gap-2 rounded-2xl bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                typeFilter === f.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <ListingList groupedByCity={groupedByCity} profiles={profiles} />
        )}
      </div>
    </AppShell>
  );
}
