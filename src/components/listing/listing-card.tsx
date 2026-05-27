import { useNavigate } from "react-router";
import { ArrowRight, Car, Clock, MessageCircle, Phone, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/common/avatar";
import { formatTime, relativeDay } from "@/lib/format";
import type { Listing, Profile } from "@/types";

interface ListingCardProps {
  listing: Listing;
  profile?: Profile;
}

export function ListingCard({ listing, profile }: ListingCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.1 }}>
      <Card
        className="cursor-pointer p-4 transition-shadow hover:shadow-md"
        onClick={() => navigate(`/listing/${listing.id}`)}
      >
        <div className="flex items-start gap-3">
          <Avatar
            firstName={profile?.first_name ?? "?"}
            lastName={profile?.last_name ?? ""}
            color={profile?.avatar_color ?? "#ccc"}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">
                {profile?.first_name ?? "Unbekannt"}
              </span>
              <Badge variant={listing.type === "angebot" ? "default" : "secondary"}>
                {listing.type === "angebot" ? "Angebot" : "Anfrage"}
              </Badge>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="truncate">{listing.origin_label}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span className="truncate">{listing.destination_label}</span>
            </div>

            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {relativeDay(listing.departure_at)}, {formatTime(listing.departure_at)}
              </span>
              <span className="flex items-center gap-1">
                {listing.type === "angebot" ? (
                  <Car className="h-3 w-3" />
                ) : (
                  <Users className="h-3 w-3" />
                )}
                {listing.seats} {listing.seats === 1 ? "Platz" : "Plaetze"}
              </span>
            </div>
          </div>

          {profile?.show_phone && (
            <div className="flex shrink-0 gap-1">
              <button
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://t.me/+${profile.phone.replace(/\+/g, "")}`, "_blank");
                }}
                title="Telegram"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${profile.phone}`, "_self");
                }}
                title="Anrufen"
              >
                <Phone className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
