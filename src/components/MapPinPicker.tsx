"use client";

import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { reverseGeocode } from "@/lib/geocode";
import {
  getLastKnownPosition,
  saveLastKnownPosition,
  shouldAutoStartLocation,
} from "@/lib/location-preference";
import { getLastPlace } from "@/lib/place-storage";
import type { CompassTarget } from "@/lib/target-url";
import "leaflet/dist/leaflet.css";

const FALLBACK_CENTER: [number, number] = [40.7128, -74.006];

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapPinPickerProps = {
  onSelect: (target: CompassTarget) => void;
};

function ClickHandler({
  onPin,
}: {
  onPin: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPin(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Leaflet measures its container once at init; if the container was 0px or
// resizes afterwards the map renders blank until told to re-measure.
function InvalidateOnResize() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 50);
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

// Recenter on a fresh GPS fix, but only when location permission is already
// granted/remembered — never triggers a permission prompt from the map.
function RecenterOnUser() {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;

    void shouldAutoStartLocation().then((ok) => {
      if (!ok || cancelled || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          saveLastKnownPosition(next);
          map.setView([next.lat, next.lng], 15);
        },
        () => {
          /* keep last-known/fallback center */
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [map]);

  return null;
}

export function MapPinPicker({ onSelect }: MapPinPickerProps) {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [confirming, setConfirming] = useState(false);
  // This component is client-only (dynamic ssr:false), so localStorage is
  // available during the first render. Prefer a real GPS position; without
  // one (e.g. phone on HTTP where geolocation is blocked) fall back to the
  // last destination the user pointed at, then the default.
  const [initialCenter] = useState<[number, number]>(() => {
    const gps = getLastKnownPosition();
    if (gps) return [gps.lat, gps.lng];
    const place = getLastPlace();
    if (place) return [place.lat, place.lng];
    return FALLBACK_CENTER;
  });

  async function confirm() {
    if (!pin) return;
    setConfirming(true);
    try {
      const name = (await reverseGeocode(pin.lat, pin.lng)) ?? "Dropped pin";
      onSelect({ lat: pin.lat, lng: pin.lng, name });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="shrink-0 text-sm text-[#c4b59a]">Tap the map to drop a pin.</p>
      {/* 50dvh leaves room for header, tabs, and the confirm button below the
          map on phone screens; taller maps pushed the button off-screen. */}
      <div className="h-[min(50dvh,420px)] shrink-0 overflow-hidden rounded-xl border border-[#d4af37]/30">
        <MapContainer
          center={initialCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <InvalidateOnResize />
          <RecenterOnUser />
          <ClickHandler onPin={(lat, lng) => setPin({ lat, lng })} />
          {pin && <Marker position={[pin.lat, pin.lng]} icon={defaultIcon} />}
        </MapContainer>
      </div>
      {pin && (
        <button
          type="button"
          onClick={confirm}
          disabled={confirming}
          className="shrink-0 rounded-xl border border-[#d4af37] bg-[#2a2218] py-3 font-medium text-[#f5e6c8] disabled:opacity-50"
        >
          {confirming ? "Confirming…" : "Use this pin"}
        </button>
      )}
    </div>
  );
}
