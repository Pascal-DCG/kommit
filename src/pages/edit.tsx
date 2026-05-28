import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ListingForm, type ListingFormData } from "@/components/listing/listing-form";
import { useListings } from "@/hooks/use-listings";
import { ROUTES } from "@/lib/constants";
import type { Listing } from "@/types";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getListing, updateListing } = useListings();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getListing(id);
      setListing(data);
    } catch {
      navigate(ROUTES.HOME);
    } finally {
      setLoading(false);
    }
  }, [id, getListing, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (data: ListingFormData) => {
    if (!id) return;

    await updateListing(id, {
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
    });

    navigate(`/listing/${id}`);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (!listing) return null;

  const toLocalDatetime = (iso: string) => {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">Eintrag bearbeiten</h1>
        <ListingForm
          initialData={{
            type: listing.type,
            origin: {
              label: listing.origin_label,
              city: listing.origin_city,
              lat: listing.origin_lat,
              lng: listing.origin_lng,
            },
            destination: {
              label: listing.destination_label,
              city: listing.destination_city,
              lat: listing.destination_lat,
              lng: listing.destination_lng,
            },
            departureAt: toLocalDatetime(listing.departure_at),
            seats: listing.seats,
            notes: listing.notes ?? "",
          }}
          onSubmit={handleSubmit}
          submitLabel="Speichern"
        />
      </div>
    </AppShell>
  );
}
