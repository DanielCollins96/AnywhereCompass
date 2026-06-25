"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import { reverseGeocode } from "@/lib/geocode";
import type { CompassTarget } from "@/lib/target-url";
import "leaflet/dist/leaflet.css";

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

export function MapPinPicker({ onSelect }: MapPinPickerProps) {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function confirm() {
    if (!pin) return;
    setConfirming(true);
    const name = (await reverseGeocode(pin.lat, pin.lng)) ?? "Dropped pin";
    onSelect({ lat: pin.lat, lng: pin.lng, name });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#c4b59a]">Tap the map to drop a pin.</p>
      <div className="h-72 overflow-hidden rounded-xl border border-[#d4af37]/30">
        <MapContainer
          center={[40.7128, -74.006]}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPin={(lat, lng) => setPin({ lat, lng })} />
          {pin && <Marker position={[pin.lat, pin.lng]} icon={defaultIcon} />}
        </MapContainer>
      </div>
      {pin && (
        <button
          type="button"
          onClick={confirm}
          disabled={confirming}
          className="rounded-xl border border-[#d4af37] bg-[#2a2218] py-3 text-[#f5e6c8] disabled:opacity-50"
        >
          {confirming ? "Confirming…" : "Use this pin"}
        </button>
      )}
    </div>
  );
}
