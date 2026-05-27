import { MapPin } from "lucide-react";
import { ListingCard } from "./listing-card";
import type { Listing, Profile } from "@/types";

interface ListingListProps {
  groupedByCity: Record<string, Listing[]>;
  profiles: Record<string, Profile>;
}

export function ListingList({ groupedByCity, profiles }: ListingListProps) {
  const cities = Object.keys(groupedByCity).sort();

  if (cities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium text-muted-foreground">
          Noch keine Eintraege
        </p>
        <p className="text-sm text-muted-foreground">
          Erstelle den ersten Eintrag mit dem + Button.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cities.map((city) => (
        <div key={city}>
          <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-2 backdrop-blur">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {city} ({groupedByCity[city]!.length})
            </h2>
          </div>
          <div className="space-y-3">
            {groupedByCity[city]!.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                profile={profiles[listing.user_id]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
