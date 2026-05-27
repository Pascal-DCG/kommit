import { useState } from "react";
import { useNavigate } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ListingForm, type ListingFormData } from "@/components/listing/listing-form";
import { MatchSheet } from "@/components/listing/match-sheet";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useListings } from "@/hooks/use-listings";
import { useMatches, type MatchResult } from "@/hooks/use-matches";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/lib/constants";

export default function CreatePage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { createListing } = useListings();
  const { findMatches } = useMatches();
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [showMatches, setShowMatches] = useState(false);

  const handleSubmit = async (data: ListingFormData) => {
    if (!user) return;

    const created = await createListing(
      {
        type: data.type,
        origin_label: data.origin.label,
        origin_city: data.origin.city,
        origin_lat: data.origin.lat,
        origin_lng: data.origin.lng,
        destination_label: data.destination.label,
        destination_city: data.destination.city,
        destination_lat: data.destination.lat,
        destination_lng: data.destination.lng,
        departure_at: new Date(data.departureAt).toISOString(),
        seats: data.seats,
        notes: data.notes || null,
      },
      user.id,
    );

    const matches = await findMatches(created.id);

    if (matches.length > 0) {
      supabase.functions.invoke("send-push", {
        body: { listing_id: created.id },
      }).catch(() => {});
      setMatchResults(matches);
      setShowMatches(true);
    } else {
      navigate(ROUTES.HOME);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">Neuer Eintrag</h1>
        <ListingForm onSubmit={handleSubmit} />
      </div>

      <MatchSheet
        matches={matchResults}
        open={showMatches}
        onClose={() => {
          setShowMatches(false);
          navigate(ROUTES.HOME);
        }}
      />
    </AppShell>
  );
}
