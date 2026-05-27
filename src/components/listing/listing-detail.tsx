import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Clock,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/common/avatar";
import { formatDate, formatTime } from "@/lib/format";
import type { Listing, Profile } from "@/types";

interface ListingDetailProps {
  listing: Listing;
  profile: Profile | null;
  isOwner: boolean;
  isAdmin: boolean;
  onDelete: () => void;
}

export function ListingDetail({
  listing,
  profile,
  isOwner,
  isAdmin,
  onDelete,
}: ListingDetailProps) {
  const navigate = useNavigate();
  const canEdit = isOwner || isAdmin;

  return (
    <div className="space-y-6">
      <button
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Zurueck
      </button>

      <div className="space-y-2">
        <Badge variant={listing.type === "angebot" ? "default" : "secondary"}>
          {listing.type === "angebot" ? "Angebot" : "Anfrage"}
        </Badge>
        <div className="flex items-center gap-2 text-xl font-semibold">
          <span>{listing.origin_label}</span>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span>{listing.destination_label}</span>
        </div>
      </div>

      {profile && (
        <Card className="flex items-center gap-3 p-4">
          <Avatar
            firstName={profile.first_name}
            lastName={profile.last_name}
            color={profile.avatar_color}
            size="lg"
          />
          <div>
            <p className="font-semibold">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              Mitglied seit{" "}
              {new Date(profile.created_at).toLocaleDateString("de-DE", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </Card>
      )}

      {profile?.show_phone && !isOwner && (
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() =>
              window.open(
                `https://t.me/+${profile.phone.replace(/\+/g, "")}`,
                "_blank",
              )
            }
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Telegram
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`tel:${profile.phone}`, "_self")}
          >
            <Phone className="mr-2 h-4 w-4" />
            Anrufen
          </Button>
        </div>
      )}

      <Card className="divide-y p-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(listing.departure_at)}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatTime(listing.departure_at)} Uhr</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          {listing.type === "angebot" ? (
            <Car className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Users className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm">
            {listing.seats} {listing.seats === 1 ? "Platz" : "Plaetze"}
          </span>
        </div>
      </Card>

      {listing.notes && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">{listing.notes}</p>
        </Card>
      )}

      {canEdit && (
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/edit/${listing.id}`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {isAdmin && !isOwner ? "Als Admin bearbeiten" : "Bearbeiten"}
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Loeschen
          </Button>
        </div>
      )}
    </div>
  );
}
