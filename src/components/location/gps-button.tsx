import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useGeocoding, type GeocodingResult } from "@/hooks/use-geocoding";

interface GpsButtonProps {
  onResult: (result: GeocodingResult) => void;
}

export function GpsButton({ onResult }: GpsButtonProps) {
  const { loading: gpsLoading, getPosition } = useGeolocation();
  const { reverseGeocode } = useGeocoding();

  const handleClick = async () => {
    try {
      const pos = await getPosition();
      const result = await reverseGeocode(pos.lat, pos.lng);
      onResult(result);
    } catch {
      // Fehler wird im useGeolocation Hook behandelt
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={gpsLoading}
      title="Aktuellen Standort verwenden"
    >
      <MapPin className={gpsLoading ? "animate-pulse" : ""} />
    </Button>
  );
}
