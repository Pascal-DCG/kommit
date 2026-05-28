import { useCallback, useEffect, useRef, useState } from "react";
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
  const [newCount, setNewCount] = useState(0);
  const pendingRef = useRef<Listing[]>([]);

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
    setNewCount(0);
    pendingRef.current = [];
  }, [typeFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    const channel = supabase
      .channel("listings-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "listings" },
        (payload) => {
          const newListing = payload.new as Listing;
          pendingRef.current = [...pendingRef.current, newListing];
          setNewCount(pendingRef.current.length);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "listings" },
        (payload) => {
          const updated = payload.new as Listing;
          setListings((prev) =>
            prev.map((l) => (l.id === updated.id ? updated : l)),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "listings" },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setListings((prev) => prev.filter((l) => l.id !== deletedId));
          pendingRef.current = pendingRef.current.filter(
            (l) => l.id !== deletedId,
          );
          setNewCount(pendingRef.current.length);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showPending = useCallback(() => {
    setListings((prev) => {
      const existingIds = new Set(prev.map((l) => l.id));
      const toAdd = pendingRef.current.filter((l) => !existingIds.has(l.id));
      return [...toAdd, ...prev].sort(
        (a, b) =>
          new Date(a.departure_at).getTime() -
          new Date(b.departure_at).getTime(),
      );
    });
    pendingRef.current = [];
    setNewCount(0);
  }, []);

  const createListing = useCallback(
    async (listing: Omit<ListingInsert, "user_id">, userId: string) => {
      const { data, error } = await supabase
        .from("listings")
        .insert({ ...listing, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      setListings((prev) =>
        [...prev, data].sort(
          (a, b) =>
            new Date(a.departure_at).getTime() -
            new Date(b.departure_at).getTime(),
        ),
      );
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
    setListings((prev) => prev.filter((l) => l.id !== id));
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
    newCount,
    showPending,
    refetch: fetchListings,
    createListing,
    updateListing,
    deleteListing,
    getListing,
  };
}
