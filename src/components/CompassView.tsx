"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CompassNeedle } from "@/components/CompassNeedle";
import { ShareTarget } from "@/components/ShareTarget";
import { useCompassNeedle } from "@/hooks/useCompassNeedle";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { formatDistance } from "@/lib/bearing";
import {
  clearParkingSpot,
  getParkingSpot,
  hasParkingSpot,
  subscribeParkingSpot,
} from "@/lib/parking-storage";
import { buildPlaceUrl, type CompassTarget } from "@/lib/target-url";
import { shouldAutoStartLocation } from "@/lib/location-preference";

type CompassViewProps = {
  mode: "place" | "parking";
  target: CompassTarget;
  showShare?: boolean;
};

export function CompassView({ mode, target, showShare = true }: CompassViewProps) {
  const [started, setStarted] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const autoStartedRef = useRef(false);
  const hapticRef = useRef(false);

  const orientation = useDeviceOrientation(started);
  const {
    error: orientationError,
    heading,
    needsPermission,
    permissionGranted,
    requestPermission,
  } = orientation;
  const { position, error: geoError, loading: geoLoading, requestLocation } =
    useGeolocation();
  const { needleAngle, distance, aligned, hasCompass, targetBearing } =
    useCompassNeedle(position, heading, target);

  const startCompass = useCallback(async (fromAuto = false) => {
    setStarting(true);
    setStartError(null);

    if (needsPermission && !fromAuto) {
      const compassOk = await requestPermission();
      if (!compassOk) {
        setStartError(
          orientationError ??
            "Compass permission was not granted. Distance still works, but the needle cannot follow phone rotation.",
        );
      }
    }

    const locationOk = await requestLocation();
    if (!locationOk) {
      setStarting(false);
      return;
    }

    setStarted(true);
    setStarting(false);
  }, [needsPermission, orientationError, requestLocation, requestPermission]);

  useEffect(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;

    void shouldAutoStartLocation().then((ok) => {
      if (ok) void startCompass(true);
    });
  }, [startCompass]);

  useEffect(() => {
    if (aligned && !hapticRef.current && navigator.vibrate) {
      navigator.vibrate(10);
      hapticRef.current = true;
    }
    if (!aligned) hapticRef.current = false;
  }, [aligned]);

  const shareUrl = mode === "place" ? buildPlaceUrl(target) : undefined;
  const title =
    target.name ?? (mode === "parking" ? "Your car" : "Destination");
  const needsStart = !started && !position;

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#1a1410] px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-wrap items-start justify-between gap-2">
        <Link
          href="/"
          className="rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-xs text-[#c4b59a]"
        >
          ← Home
        </Link>
        {mode === "place" ? (
          <a
            href="/setup"
            className="rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-xs text-[#f5e6c8]"
          >
            Change place
          </a>
        ) : (
          <a
            href="/setup"
            className="rounded-full border border-[#d4af37]/30 px-3 py-1.5 text-xs text-[#f5e6c8]"
          >
            Point elsewhere
          </a>
        )}
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

      {needsStart && (
        <div className="mx-auto mt-6 w-full max-w-md space-y-3">
          <p className="text-center text-sm text-[#c4b59a]">
            Tap below — your browser will ask to use your location so the compass
            can point toward <span className="text-[#f5e6c8]">{title}</span>.
          </p>
          <button
            type="button"
            onClick={() => void startCompass()}
            disabled={starting}
            className="w-full rounded-full border-2 border-[#d4af37] bg-[#2a2218] px-6 py-4 text-base font-medium text-[#f5e6c8] disabled:opacity-50"
          >
            {starting ? "Requesting location…" : "Allow location & start compass"}
          </button>
          {(startError || geoError) && (
            <p className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {startError ?? geoError}
            </p>
          )}
        </div>
      )}

      {started &&
        position &&
        needsPermission &&
        !permissionGranted && (
          <div className="mx-auto mt-4 w-full max-w-md space-y-2">
            <button
              type="button"
              onClick={() => void requestPermission()}
              className="w-full rounded-full border border-[#5dade2] bg-[#2a2218] px-6 py-3 text-sm font-medium text-[#f5e6c8]"
            >
              Enable compass rotation
            </button>
            <p className="text-center text-xs text-[#c4b59a]">
              Location is active. iPhone and iPad require a separate tap before
              sharing compass sensor data.
            </p>
            {orientationError && (
              <p className="text-center text-xs text-red-300">
                {orientationError}
              </p>
            )}
          </div>
        )}

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-[#d4af37]/70">
            {mode === "parking" ? "Parking mode" : "Place mode"}
          </p>
          <h1 className="mt-1 max-w-xs font-serif text-lg text-[#f5e6c8] line-clamp-2">
            {title}
          </h1>
          {mode === "place" && (
            <a
              href="/setup"
              className="mt-2 inline-block text-xs text-[#d4af37] underline underline-offset-2"
            >
              Search or drop a new pin
            </a>
          )}
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

        <div className="space-y-2 text-center">
          {distance != null && (
            <p className="font-serif text-3xl text-[#f5e6c8]">
              {formatDistance(distance)}
            </p>
          )}
          {targetBearing != null && position && !hasCompass && (
            <p className="text-sm text-[#c4b59a]">
              Target bearing: {Math.round(targetBearing)}° from north
            </p>
          )}
          {geoLoading && (
            <p className="text-xs text-[#c4b59a]">Getting your location…</p>
          )}
          {started && geoError && (
            <p className="text-xs text-red-300">{geoError}</p>
          )}
          {hasCompass && (
            <p className="text-xs text-[#5dade2]">
              Rotate your device — needle points to target
            </p>
          )}
          {position && !hasCompass && !geoLoading && (
            <p className="text-xs text-[#c4b59a]">
              Laptops often have no compass sensor — arrow shows map direction
            </p>
          )}
          {aligned && (
            <p className="text-xs text-[#5dade2]">You&apos;re facing it</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ParkingCompassLoader() {
  const hasParking = useSyncExternalStore(
    subscribeParkingSpot,
    hasParkingSpot,
    () => false,
  );
  const spot = hasParking ? getParkingSpot() : null;
  const target = spot
    ? {
        lat: spot.lat,
        lng: spot.lng,
        name: spot.label ?? "Your car",
      }
    : null;

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
