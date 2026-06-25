"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CompassNeedle } from "@/components/CompassNeedle";
import { PermissionPrompt } from "@/components/PermissionPrompt";
import { ShareTarget } from "@/components/ShareTarget";
import { useCompassNeedle } from "@/hooks/useCompassNeedle";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { formatDistance } from "@/lib/bearing";
import { getParkingSpot, clearParkingSpot } from "@/lib/parking-storage";
import { buildPlaceUrl, type CompassTarget } from "@/lib/target-url";

type CompassViewProps = {
  mode: "place" | "parking";
  target: CompassTarget;
  showShare?: boolean;
};

export function CompassView({ mode, target, showShare = true }: CompassViewProps) {
  const [active, setActive] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const hapticRef = useRef(false);

  const orientation = useDeviceOrientation(active);
  const { position, error: geoError, loading: geoLoading } = useGeolocation(active);
  const { needleAngle, distance, aligned, hasCompass } = useCompassNeedle(
    position,
    orientation.heading,
    target,
  );

  useEffect(() => {
    if (aligned && !hapticRef.current && navigator.vibrate) {
      navigator.vibrate(10);
      hapticRef.current = true;
    }
    if (!aligned) hapticRef.current = false;
  }, [aligned]);

  async function handleEnable() {
    setEnabling(true);
    const ok = await orientation.requestPermission();
    if (ok) setActive(true);
    setEnabling(false);
  }

  if (!active) {
    return <PermissionPrompt onEnable={handleEnable} loading={enabling} />;
  }

  const shareUrl =
    mode === "place" ? buildPlaceUrl(target) : undefined;
  const title =
    target.name ??
    (mode === "parking" ? "Your car" : "Destination");

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between bg-[#1a1410] px-4 py-8">
      <div className="flex w-full max-w-md items-start justify-between gap-2">
        <Link
          href="/"
          className="rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-xs text-[#c4b59a]"
        >
          ← Home
        </Link>
        {showShare && shareUrl && (
          <ShareTarget url={shareUrl} label="Share this place" />
        )}
        {mode === "parking" && (
          <button
            type="button"
            onClick={() => {
              clearParkingSpot();
              window.location.href = "/";
            }}
            className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs text-red-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-[#d4af37]/70">
          {mode === "parking" ? "Parking mode" : "Place mode"}
        </p>
        <h1 className="mt-1 max-w-xs font-serif text-lg text-[#f5e6c8] line-clamp-2">
          {title}
        </h1>
      </div>

      <div className="relative aspect-square w-full max-w-[min(85vw,360px)]">
        <div
          className="absolute inset-0 rounded-full border-4 border-[#d4af37]/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.5),0_8px_32px_rgba(0,0,0,0.4)]"
          style={{
            background:
              "radial-gradient(circle at 40% 35%, #3d3428 0%, #1a1410 55%, #0d0a08 100%)",
          }}
        >
          {["N", "E", "S", "W"].map((dir, i) => (
            <span
              key={dir}
              className={`absolute font-serif text-sm font-bold ${
                dir === "N" ? "text-[#c0392b]" : "text-[#d4af37]/80"
              }`}
              style={{
                top: i === 0 ? "6%" : i === 2 ? "auto" : "50%",
                bottom: i === 2 ? "6%" : "auto",
                left: i === 3 ? "6%" : i === 1 ? "auto" : "50%",
                right: i === 1 ? "6%" : "auto",
                transform:
                  i === 0 || i === 2
                    ? "translateX(-50%)"
                    : "translateY(-50%)",
              }}
            >
              {dir}
            </span>
          ))}

          <div className="absolute inset-[12%] rounded-full border border-[#d4af37]/20" />
          <div className="absolute inset-[22%] rounded-full border border-[#d4af37]/10" />
          <div className="absolute inset-[32%] rounded-full border border-[#d4af37]/10" />

          <CompassNeedle angle={needleAngle} />
        </div>
      </div>

      <div className="text-center">
        {distance != null && (
          <p className="font-serif text-3xl text-[#f5e6c8]">
            {formatDistance(distance)}
          </p>
        )}
        {geoLoading && (
          <p className="mt-2 text-xs text-[#c4b59a]">Getting location…</p>
        )}
        {geoError && (
          <p className="mt-2 text-xs text-red-300">{geoError}</p>
        )}
        {!hasCompass && !geoLoading && (
          <p className="mt-2 text-xs text-[#c4b59a]">
            Arrow shows direction from north
          </p>
        )}
        {aligned && (
          <p className="mt-2 text-xs text-[#5dade2]">You&apos;re facing it</p>
        )}
      </div>
    </div>
  );
}

export function ParkingCompassLoader() {
  const [target, setTarget] = useState<CompassTarget | null>(null);

  useEffect(() => {
    const spot = getParkingSpot();
    if (spot) {
      setTarget({
        lat: spot.lat,
        lng: spot.lng,
        name: spot.label ?? "Your car",
      });
    }
  }, []);

  if (!target) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#1a1410] px-6 text-center">
        <p className="text-[#f5e6c8]">No saved parking spot.</p>
        <Link href="/" className="text-[#d4af37] underline">
          Go home
        </Link>
      </div>
    );
  }

  return <CompassView mode="parking" target={target} showShare={false} />;
}
