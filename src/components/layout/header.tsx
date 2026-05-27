import { useNavigate } from "react-router";
import { Settings } from "lucide-react";
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(ROUTES.SETTINGS)}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <Settings className="h-5 w-5" />
          </button>
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
      </div>
    </header>
  );
}
