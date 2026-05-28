import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import type { Listing, Profile } from "@/types";
import type { ListingType } from "@/types";

type FilterType = ListingType | "alle";

interface AdminTableProps {
  listings: Listing[];
  profiles: Record<string, Profile>;
  onDelete: (id: string) => Promise<void>;
  showArchive: boolean;
  onToggleArchive: () => void;
}

export function AdminTable({
  listings,
  profiles,
  onDelete,
  showArchive,
  onToggleArchive,
}: AdminTableProps) {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<FilterType>("alle");
  const [cityFilter, setCityFilter] = useState("");

  const cities = [...new Set(listings.map((l) => l.origin_city))].sort();

  const filtered = listings.filter((l) => {
    if (typeFilter !== "alle" && l.type !== typeFilter) return false;
    if (cityFilter && l.origin_city !== cityFilter) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Eintrag wirklich loeschen?")) return;
    await onDelete(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as FilterType)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="alle">Alle Typen</option>
          <option value="angebot">Angebote</option>
          <option value="anfrage">Anfragen</option>
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">Alle Staedte</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <Button
          variant={showArchive ? "default" : "outline"}
          size="sm"
          onClick={onToggleArchive}
        >
          {showArchive ? "Archiv" : "Aktiv"}
        </Button>

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} Eintraege
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">User</th>
              <th className="px-3 py-2 text-left font-medium">Route</th>
              <th className="px-3 py-2 text-left font-medium">Zeit</th>
              <th className="px-3 py-2 text-left font-medium">Typ</th>
              <th className="px-3 py-2 text-left font-medium">Plaetze</th>
              <th className="px-3 py-2 text-left font-medium">Erstellt</th>
              <th className="px-3 py-2 text-right font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing) => {
              const p = profiles[listing.user_id];
              return (
                <tr key={listing.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    {p ? `${p.first_name} ${p.last_name}` : "–"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1">
                      <span className="truncate max-w-[100px]">
                        {listing.origin_city}
                      </span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[100px]">
                        {listing.destination_city}
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {formatDateTime(listing.departure_at)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        listing.type === "angebot" ? "default" : "secondary"
                      }
                    >
                      {listing.type === "angebot" ? "Angebot" : "Anfrage"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">{listing.seats}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {formatDateTime(listing.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        className="rounded p-1 hover:bg-muted"
                        onClick={() => navigate(`/edit/${listing.id}`)}
                        title="Bearbeiten"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="rounded p-1 text-destructive hover:bg-muted"
                        onClick={() => handleDelete(listing.id)}
                        title="Loeschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  Keine Eintraege gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
