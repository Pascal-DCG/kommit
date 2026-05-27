import { useCallback, useRef, useState } from "react";

export interface GeocodingResult {
  label: string;
  city: string;
  lat: number;
  lng: number;
}

const PHOTON_URL = "https://photon.komoot.io/api/";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export function useGeocoding() {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: "5",
        lang: "de",
        lat: "48.0",
        lon: "7.85",
      });

      const response = await fetch(`${PHOTON_URL}?${params}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      const results: GeocodingResult[] = data.features.map(
        (feature: {
          properties: {
            name?: string;
            street?: string;
            housenumber?: string;
            city?: string;
            town?: string;
            village?: string;
            state?: string;
          };
          geometry: { coordinates: [number, number] };
        }) => {
          const p = feature.properties;
          const parts = [
            p.name,
            p.street && p.housenumber
              ? `${p.street} ${p.housenumber}`
              : p.street,
            p.city || p.town || p.village,
          ].filter(Boolean);

          return {
            label: [...new Set(parts)].join(", "),
            city: p.city || p.town || p.village || p.state || "",
            lat: feature.geometry.coordinates[1],
            lng: feature.geometry.coordinates[0],
          };
        },
      );

      setSuggestions(results);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<GeocodingResult> => {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: "json",
        "accept-language": "de",
      });

      const response = await fetch(`${NOMINATIM_URL}?${params}`);
      const data = await response.json();

      const address = data.address ?? {};
      const city =
        address.city || address.town || address.village || address.state || "";
      const parts = [
        address.road,
        address.house_number,
        city,
      ].filter(Boolean);

      return {
        label: parts.join(", ") || data.display_name || "",
        city,
        lat,
        lng,
      };
    },
    [],
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, loading, search, reverseGeocode, clearSuggestions };
}
