import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types";

export function useProfiles(userIds: string[]) {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const fetchProfiles = useCallback(async (ids: string[]) => {
    const missing = ids.filter((id) => !profiles[id]);
    if (missing.length === 0) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("id", missing);

    if (data) {
      setProfiles((prev) => {
        const next = { ...prev };
        for (const p of data) {
          next[p.id] = p;
        }
        return next;
      });
    }
  }, [profiles]);

  useEffect(() => {
    if (userIds.length > 0) {
      fetchProfiles(userIds);
    }
  }, [userIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return profiles;
}
