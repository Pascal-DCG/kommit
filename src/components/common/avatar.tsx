import { cn } from "@/lib/utils";

interface AvatarProps {
  firstName: string;
  lastName: string;
  color: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function Avatar({
  firstName,
  lastName,
  color,
  avatarUrl,
  size = "md",
  className,
}: AvatarProps) {
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={cn(
          "shrink-0 rounded-full object-cover",
          sizes[size],
          className,
        )}
        style={{ backgroundColor: color }}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
