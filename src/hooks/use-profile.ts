import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/hooks/use-auth-context";
import { isDemoMode } from "@/lib/demo";

export function useProfile() {
  const { profile, user } = useAuthContext();

  const updateProfile = useCallback(
    async (updates: {
      first_name?: string;
      last_name?: string;
      show_phone?: boolean;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt.");

      if (isDemoMode()) {
        // Aenderungen verfallen mit Reload — Demo-Profile bleibt unveraendert
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    [user],
  );

  return { profile, updateProfile };
}
