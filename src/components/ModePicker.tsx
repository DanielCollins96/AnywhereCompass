"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DevNetworkHint } from "@/components/DevNetworkHint";
import { getParkingSpot } from "@/lib/parking-storage";

export function ModePicker() {
  const [hasParking, setHasParking] = useState(false);

  useEffect(() => {
    setHasParking(getParkingSpot() != null);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-[#1a1410] px-6">
      <div className="text-center">
        <p className="mb-2 text-4xl">🧭</p>
        <h1 className="font-serif text-3xl tracking-wide text-[#f5e6c8]">
          AnywhereCompass
        </h1>
        <p className="mt-2 text-sm text-[#c4b59a]">No map. Just which way.</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <Link
          href="/setup"
          className="rounded-2xl border-2 border-[#d4af37]/50 bg-[#2a2218] px-6 py-5 text-center font-medium text-[#f5e6c8] transition hover:border-[#d4af37] hover:bg-[#3a3020]"
        >
          Point to a place
        </Link>

        {hasParking ? (
          <Link
            href="/c?mode=parking"
            className="rounded-2xl border-2 border-[#5dade2]/50 bg-[#2a2218] px-6 py-5 text-center font-medium text-[#f5e6c8] transition hover:border-[#5dade2] hover:bg-[#3a3020]"
          >
            Find my car
          </Link>
        ) : (
          <SaveCarButton onSaved={() => setHasParking(true)} />
        )}
      </div>

      <DevNetworkHint />
    </div>
  );
}

function SaveCarButton({ onSaved }: { onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function saveCar() {
    if (!navigator.geolocation) {
      setMessage("Geolocation not available");
      return;
    }
    setSaving(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { reverseGeocode } = await import("@/lib/geocode");
        const { saveParkingSpot } = await import("@/lib/parking-storage");
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const label = (await reverseGeocode(lat, lng)) ?? undefined;
        saveParkingSpot({ lat, lng, label });
        setSaving(false);
        setMessage("Car saved!");
        onSaved();
      },
      () => {
        setSaving(false);
        setMessage("Could not get location");
      },
      { enableHighAccuracy: true },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={saveCar}
        disabled={saving}
        className="rounded-2xl border-2 border-[#5dade2]/50 bg-[#2a2218] px-6 py-5 text-center font-medium text-[#f5e6c8] transition hover:border-[#5dade2] hover:bg-[#3a3020] disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save my car"}
      </button>
      {message && (
        <p className="text-center text-xs text-[#5dade2]">{message}</p>
      )}
    </div>
  );
}
