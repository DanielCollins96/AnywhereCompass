"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/bearing";
import { rememberLocationGranted, clearLocationGranted } from "@/lib/location-preference";

function insecureContextMessage(): string | null {
  if (typeof window === "undefined") return null;
  if (window.isSecureContext || window.location.hostname === "localhost") {
    return null;
  }
  return "Location needs HTTPS. Open via localhost on your computer, or deploy with Vercel/ngrok.";
}

function formatGeoError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied. Check browser site settings and allow location for this site.";
    case error.POSITION_UNAVAILABLE:
      return "Location unavailable. Check that location services are on.";
    case error.TIMEOUT:
      return "Location request timed out. Try again.";
    default:
      return error.message || "Could not get your location.";
  }
}

export function useGeolocation() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const insecure = insecureContextMessage();
    if (insecure) {
      setError(insecure);
      setLoading(false);
      return false;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      setLoading(false);
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setTracking(true);
          setLoading(false);
          rememberLocationGranted();
          resolve(true);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            clearLocationGranted();
          }
          setError(formatGeoError(err));
          setLoading(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
      );
    });
  }, []);

  useEffect(() => {
    if (!tracking || typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(formatGeoError(err));
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [tracking]);

  return {
    position,
    error,
    loading,
    tracking,
    requestLocation,
  };
}
