import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  DEMO_PROFILE,
  DEMO_SESSION,
  DEMO_USER,
  disableDemoMode,
  isDemoMode,
} from "@/lib/demo";
import type { Profile } from "@/types";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isNewUser: boolean;
}

// supabase-js verpackt Edge-Function-Fehler in eine generische Meldung
// ("Edge Function returned a non-2xx status code"). Der echte Fehlertext
// steckt im Response-Body von error.context — den holen wir hier raus.
async function edgeErrorMessage(
  error: unknown,
  fallback: string,
): Promise<string> {
  const ctx = (error as { context?: Response } | null)?.context;
  if (ctx && typeof ctx.clone === "function") {
    try {
      const body = await ctx.clone().json();
      if (body?.error) return String(body.error);
    } catch {
      // Body ist kein JSON — Fallback auf die generische Meldung
    }
  }
  return (error as Error)?.message || fallback;
}

export function useAuth() {
  const demo = isDemoMode();

  const [state, setState] = useState<AuthState>(() =>
    demo
      ? {
          session: DEMO_SESSION,
          user: DEMO_USER,
          profile: DEMO_PROFILE,
          loading: false,
          isNewUser: false,
        }
      : {
          session: null,
          user: null,
          profile: null,
          loading: true,
          isNewUser: false,
        },
  );

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  }, []);

  useEffect(() => {
    if (demo) return;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          session,
          user: session.user,
          profile,
          loading: false,
          isNewUser: !profile?.first_name,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // WICHTIG: keine awaitenden supabase-Aufrufe direkt im Callback —
      // der Auth-Lock wird sonst nicht freigegeben und supabase.from(...)
      // deadlockt. Session sofort (synchron) setzen, Profil verzoegert laden.
      const user = session?.user;
      if (user) {
        // Bei frischem Login loading true halten, bis das Profil geladen ist —
        // sonst wuerde ein neuer User (isNewUser noch nicht bekannt) kurz zur
        // Liste navigiert statt zum Profil-Setup. Bei Token-Refresh kein Flackern.
        const freshLogin = event === "SIGNED_IN" || event === "INITIAL_SESSION";
        setState((s) => ({
          ...s,
          session,
          user,
          loading: freshLogin ? true : s.loading,
        }));
        setTimeout(() => {
          fetchProfile(user.id).then((profile) => {
            setState((s) => ({
              ...s,
              profile,
              isNewUser: !profile?.first_name,
              loading: false,
            }));
          });
        }, 0);
      } else {
        setState({
          session: null,
          user: null,
          profile: null,
          loading: false,
          isNewUser: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, demo]);

  const sendOtp = useCallback(async (phone: string) => {
    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { phone },
    });
    if (error) {
      throw new Error(
        await edgeErrorMessage(error, "Code konnte nicht gesendet werden."),
      );
    }
    return data as { request_id: string };
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string, requestId: string) => {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, code, request_id: requestId },
      });
      if (error) {
        throw new Error(
          await edgeErrorMessage(error, "Hm, der Code passt nicht. Nochmal?"),
        );
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      setState((s) => ({ ...s, isNewUser: data.is_new_user }));
      return data as { session: Session; is_new_user: boolean };
    },
    [],
  );

  const completeProfile = useCallback(
    async (firstName: string, lastName: string) => {
      if (!state.user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ first_name: firstName, last_name: lastName })
        .eq("id", state.user.id);

      if (error) throw error;

      const profile = await fetchProfile(state.user.id);
      setState((s) => ({ ...s, profile, isNewUser: false }));
    },
    [state.user, fetchProfile],
  );

  const updateProfile = useCallback(
    async (updates: {
      first_name?: string;
      last_name?: string;
      show_phone?: boolean;
      avatar_url?: string | null;
      avatar_color?: string;
    }) => {
      // Optimistisch: lokalen State sofort aktualisieren, damit die UI
      // (z.B. Toggles) unmittelbar umschaltet.
      setState((s) =>
        s.profile ? { ...s, profile: { ...s.profile, ...updates } } : s,
      );

      if (demo) return; // Demo: nur lokal, keine DB-Schreibung

      if (!state.user) throw new Error("Nicht eingeloggt.");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", state.user.id);
      if (error) {
        // Rollback der optimistischen Aenderung
        const profile = await fetchProfile(state.user.id);
        setState((s) => ({ ...s, profile }));
        throw error;
      }
    },
    [demo, state.user, fetchProfile],
  );

  const signOut = useCallback(async () => {
    if (demo) {
      disableDemoMode();
      window.location.reload();
      return;
    }
    await supabase.auth.signOut();
  }, [demo]);

  return {
    ...state,
    sendOtp,
    verifyOtp,
    completeProfile,
    updateProfile,
    signOut,
    isAuthenticated: !!state.session,
  };
}
