import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Listing, ListingInsert, ListingUpdate, ListingType } from "@/types";

interface UseListingsOptions {
  typeFilter?: ListingType | "alle";
}

export function useListings(options: UseListingsOptions = {}) {
  const { typeFilter = "alle" } = options;
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("listings")
      .select("*")
      .gte("departure_at", new Date().toISOString())
      .order("departure_at", { ascending: true });

    if (typeFilter !== "alle") {
      query = query.eq("type", typeFilter);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setListings(data ?? []);
    }
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const createListing = useCallback(
    async (listing: Omit<ListingInsert, "user_id">, userId: string) => {
      const { data, error } = await supabase
        .from("listings")
        .insert({ ...listing, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    [],
  );

  const updateListing = useCallback(
    async (id: string, updates: ListingUpdate) => {
      const { data, error } = await supabase
        .from("listings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    [],
  );

  const deleteListing = useCallback(async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) throw error;
  }, []);

  const getListing = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }, []);

  const groupedByCity = listings.reduce<Record<string, Listing[]>>(
    (acc, listing) => {
      const city = listing.origin_city;
      if (!acc[city]) acc[city] = [];
      acc[city].push(listing);
      return acc;
    },
    {},
  );

  return {
    listings,
    groupedByCity,
    loading,
    error,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing,
    getListing,
  };
}
