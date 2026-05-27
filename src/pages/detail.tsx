import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ListingDetail } from "@/components/listing/listing-detail";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useListings } from "@/hooks/use-listings";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/lib/constants";
import type { Listing, Profile } from "@/types";

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile: authProfile } = useAuthContext();
  const { getListing, deleteListing } = useListings();
  const [listing, setListing] = useState<Listing | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getListing(id);
      setListing(data);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user_id)
        .single();
      setOwnerProfile(profile);
    } catch {
      navigate(ROUTES.HOME);
    } finally {
      setLoading(false);
    }
  }, [id, getListing, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!listing || !confirm("Eintrag wirklich loeschen?")) return;
    await deleteListing(listing.id);
    navigate(ROUTES.HOME);
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

  const isOwner = user?.id === listing.user_id;
  const isAdmin = authProfile?.role === "admin";

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <ListingDetail
          listing={listing}
          profile={ownerProfile}
          isOwner={isOwner}
          isAdmin={isAdmin}
          onDelete={handleDelete}
        />
      </div>
    </AppShell>
  );
}
