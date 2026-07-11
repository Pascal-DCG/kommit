import { useAuthContext } from "@/hooks/use-auth-context";

export function useProfile() {
  const { profile, updateProfile } = useAuthContext();
  return { profile, updateProfile };
}
