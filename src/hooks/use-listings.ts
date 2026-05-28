import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEMO_LISTINGS, isDemoMode } from "@/lib/demo";
import type { Listing, ListingInsert, ListingUpdate, ListingType } from "@/types";

interface UseListingsOptions {
  typeFilter?: ListingType | "alle";
}

export function useListings(options: UseListingsOptions = {}) {
  const { typeFilter = "alle" } = options;
  const demo = isDemoMode();

  const filterDemo = (all: Listing[]) =>
    typeFilter === "alle" ? all : all.filter((l) => l.type === typeFilter);

  const [listings, setListings] = useState<Listing[]>(() =>
    demo ? filterDemo(DEMO_LISTINGS) : [],
  );
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  const pendingRef = useRef<Listing[]>([]);

  const fetchListings = useCallback(async () => {
    if (demo) {
      setListings(filterDemo(DEMO_LISTINGS));
      setLoading(false);
      return;
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, demo]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (demo) return;
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
  }, [demo]);

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
      if (demo) {
        const now = new Date().toISOString();
        const mock: Listing = {
          id: crypto.randomUUID(),
          user_id: userId,
          type: listing.type,
          origin_label: listing.origin_label,
          origin_city: listing.origin_city,
          origin_lat: listing.origin_lat,
          origin_lng: listing.origin_lng,
          destination_label: listing.destination_label,
          destination_city: listing.destination_city,
          destination_lat: listing.destination_lat,
          destination_lng: listing.destination_lng,
          departure_at: listing.departure_at,
          seats: listing.seats,
          notes: listing.notes ?? null,
          created_at: now,
          updated_at: now,
        };
        DEMO_LISTINGS.push(mock);
        setListings((prev) =>
          [...prev, mock].sort(
            (a, b) =>
              new Date(a.departure_at).getTime() -
              new Date(b.departure_at).getTime(),
          ),
        );
        return mock;
      }

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
    [demo],
  );

  const updateListing = useCallback(
    async (id: string, updates: ListingUpdate) => {
      if (demo) {
        const idx = DEMO_LISTINGS.findIndex((l) => l.id === id);
        if (idx === -1) throw new Error("Eintrag nicht gefunden");
        const updated: Listing = {
          ...DEMO_LISTINGS[idx]!,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        DEMO_LISTINGS[idx] = updated;
        setListings((prev) =>
          prev.map((l) => (l.id === id ? updated : l)),
        );
        return updated;
      }

      const { data, error } = await supabase
        .from("listings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    [demo],
  );

  const deleteListing = useCallback(
    async (id: string) => {
      if (demo) {
        const idx = DEMO_LISTINGS.findIndex((l) => l.id === id);
        if (idx !== -1) DEMO_LISTINGS.splice(idx, 1);
        setListings((prev) => prev.filter((l) => l.id !== id));
        return;
      }
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      setListings((prev) => prev.filter((l) => l.id !== id));
    },
    [demo],
  );

  const getListing = useCallback(
    async (id: string) => {
      if (demo) {
        const found = DEMO_LISTINGS.find((l) => l.id === id);
        if (!found) throw new Error("Eintrag nicht gefunden");
        return found;
      }
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    [demo],
  );

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
