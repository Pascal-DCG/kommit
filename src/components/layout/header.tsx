import { useNavigate } from "react-router";
import { Avatar } from "@/components/common/avatar";
import { useAuthContext } from "@/hooks/use-auth-context";
import { ROUTES } from "@/lib/constants";

export function Header() {
  const { profile } = useAuthContext();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <img
          src="/kommit_wordmark.svg"
          alt="Kommit"
          className="h-8 cursor-pointer"
          onClick={() => navigate(ROUTES.HOME)}
        />
        {profile && (
          <button onClick={() => navigate(ROUTES.PROFILE)}>
            <Avatar
              firstName={profile.first_name}
              lastName={profile.last_name}
              color={profile.avatar_color}
              size="sm"
            />
          </button>
        )}
      </div>
    </header>
  );
}
