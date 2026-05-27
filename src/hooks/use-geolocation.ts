import { useCallback, useState } from "react";

interface Position {
  lat: number;
  lng: number;
}

interface UseGeolocationResult {
  position: Position | null;
  loading: boolean;
  error: string | null;
  getPosition: () => Promise<Position>;
}

export function useGeolocation(): UseGeolocationResult {
  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosition = useCallback((): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "Standort wird von deinem Browser nicht unterstuetzt.";
        setError(msg);
        reject(new Error(msg));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          let msg = "Standort konnte nicht ermittelt werden.";
          if (err.code === err.PERMISSION_DENIED) {
            msg = "Standortzugriff wurde verweigert.";
          }
          setError(msg);
          setLoading(false);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    });
  }, []);

  return { position, loading, error, getPosition };
}
