"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompassView, ParkingCompassLoader } from "@/components/CompassView";
import { searchPlaces } from "@/lib/geocode";
import { saveLastPlace } from "@/lib/place-storage";
import { parseToParam, type CompassTarget } from "@/lib/target-url";

type CompassPageClientProps = {
  mode: string | null;
  to: string | null;
  name: string | null;
  q: string | null;
};

export function CompassPageClient({
  mode,
  to,
  name,
  q,
}: CompassPageClientProps) {
  const [target, setTarget] = useState<CompassTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolve() {
      if (mode === "parking") {
        setLoading(false);
        return;
      }

      if (to) {
        const parsed = parseToParam(to);
        if (parsed) {
          const resolved = { ...parsed, name: name ?? undefined };
          setTarget(resolved);
          saveLastPlace(resolved);
        } else {
          setError("Invalid coordinates in link");
        }
        setLoading(false);
        return;
      }

      if (q) {
        const results = await searchPlaces(q);
        if (results[0]) {
          const resolved = {
            lat: results[0].lat,
            lng: results[0].lng,
            name: results[0].name,
          };
          setTarget(resolved);
          saveLastPlace(resolved);
        } else {
          setError(`Could not find "${q}"`);
        }
        setLoading(false);
        return;
      }

      setError("No destination specified");
      setLoading(false);
    }

    resolve();
  }, [mode, to, name, q]);

  if (mode === "parking") {
    return <ParkingCompassLoader />;
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#1a1410] text-[#c4b59a]">
        Loading destination…
      </div>
    );
  }

  if (error || !target) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#1a1410] px-6 text-center">
        <p className="text-[#f5e6c8]">{error ?? "Unknown error"}</p>
        <Link href="/setup" className="text-[#d4af37] underline">
          Pick a destination
        </Link>
      </div>
    );
  }

  return <CompassView mode="place" target={target} />;
}
