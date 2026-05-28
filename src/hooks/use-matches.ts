import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEMO_LISTINGS, isDemoMode } from "@/lib/demo";

export interface MatchResult {
  listing_id: string;
  user_id: string;
  origin_label: string;
  destination_label: string;
  departure_at: string;
  seats: number;
  distance_origin_km: number;
  distance_destination_km: number;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const r = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dlat = toRad(lat2 - lat1);
  const dlng = toRad(lng2 - lng1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useMatches() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const findMatches = useCallback(async (listingId: string) => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        const src = DEMO_LISTINGS.find((l) => l.id === listingId);
        if (!src) {
          setMatches([]);
          return [];
        }
        const counterType = src.type === "angebot" ? "anfrage" : "angebot";
        const results: MatchResult[] = DEMO_LISTINGS.filter((l) => {
          if (l.type !== counterType) return false;
          if (l.user_id === src.user_id) return false;
          const dOrigin = haversineKm(
            src.origin_lat,
            src.origin_lng,
            l.origin_lat,
            l.origin_lng,
          );
          const dDest = haversineKm(
            src.destination_lat,
            src.destination_lng,
            l.destination_lat,
            l.destination_lng,
          );
          if (dOrigin > 15 || dDest > 15) return false;
          const timeDiff = Math.abs(
            new Date(l.departure_at).getTime() -
              new Date(src.departure_at).getTime(),
          );
          if (timeDiff > 2 * 3600_000) return false;
          if (src.type === "anfrage" && l.seats < src.seats) return false;
          if (src.type === "angebot" && l.seats > src.seats) return false;
          return true;
        }).map((l) => ({
          listing_id: l.id,
          user_id: l.user_id,
          origin_label: l.origin_label,
          destination_label: l.destination_label,
          departure_at: l.departure_at,
          seats: l.seats,
          distance_origin_km: haversineKm(
            src.origin_lat,
            src.origin_lng,
            l.origin_lat,
            l.origin_lng,
          ),
          distance_destination_km: haversineKm(
            src.destination_lat,
            src.destination_lng,
            l.destination_lat,
            l.destination_lng,
          ),
        }));
        setMatches(results);
        return results;
      }

      const { data, error } = await supabase.rpc("find_matches", {
        p_listing_id: listingId,
      });

      if (error) throw error;
      setMatches(data ?? []);
      return data ?? [];
    } catch {
      setMatches([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMatches = useCallback(() => {
    setMatches([]);
  }, []);

  return { matches, loading, findMatches, clearMatches };
}
