import { useNavigate } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ListingForm, type ListingFormData } from "@/components/listing/listing-form";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useListings } from "@/hooks/use-listings";
import { ROUTES } from "@/lib/constants";

export default function CreatePage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { createListing } = useListings();

  const handleSubmit = async (data: ListingFormData) => {
    if (!user) return;

    await createListing(
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

    navigate(ROUTES.HOME);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-2xl font-bold">Neuer Eintrag</h1>
        <ListingForm onSubmit={handleSubmit} />
      </div>
    </AppShell>
  );
}
