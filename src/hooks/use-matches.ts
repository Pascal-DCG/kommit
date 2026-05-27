import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

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

export function useMatches() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const findMatches = useCallback(async (listingId: string) => {
    setLoading(true);
    try {
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
