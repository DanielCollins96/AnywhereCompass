"use client";

import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/bearing";

export function useGeolocation(enabled: boolean) {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      enabled &&
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      window.location.hostname !== "localhost"
    ) {
      setError("Location needs HTTPS on mobile. Use Vercel, ngrok, or another HTTPS URL.");
      return;
    }

    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not available");
      return;
    }

    setLoading(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [enabled]);

  return { position, error, loading };
}
