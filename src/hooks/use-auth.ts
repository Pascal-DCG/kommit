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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
    if (error) throw new Error(error.message);
    return data as { request_id: string };
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, code: string, requestId: string) => {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, code, request_id: requestId },
      });
      if (error) throw new Error(error.message);

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
    signOut,
    isAuthenticated: !!state.session,
  };
}
