import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AdminTable } from "@/components/admin/admin-table";
import { useProfiles } from "@/hooks/use-profiles";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/types";

export default function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const table = showArchive ? "listings_archive" : "listings";
    const { data } = await supabase
      .from(table)
      .select("*")
      .order("departure_at", { ascending: false })
      .limit(200);

    setListings(data ?? []);
    setLoading(false);
  }, [showArchive]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const userIds = useMemo(
    () => [...new Set(listings.map((l) => l.user_id))],
    [listings],
  );
  const profiles = useProfiles(userIds);

  const handleDelete = async (id: string) => {
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Admin-Bereich</h1>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <AdminTable
            listings={listings}
            profiles={profiles}
            onDelete={handleDelete}
            showArchive={showArchive}
            onToggleArchive={() => setShowArchive(!showArchive)}
          />
        )}
      </div>
    </AppShell>
  );
}
