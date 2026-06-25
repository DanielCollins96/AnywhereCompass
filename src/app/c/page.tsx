import Link from "next/link";
import { CompassShell } from "@/components/CompassShell";
import { ParkingCompassLoader } from "@/components/CompassView";
import { fetchPhotonSearch } from "@/lib/photon";
import { parseToParam, type CompassTarget } from "@/lib/target-url";

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    to?: string;
    name?: string;
    q?: string;
  }>;
};

export default async function CompassPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (params.mode === "parking") {
    return <ParkingCompassLoader />;
  }

  let target: CompassTarget | null = null;
  let error: string | null = null;

  if (params.to) {
    const parsed = parseToParam(params.to);
    if (parsed) {
      target = { ...parsed, name: params.name ?? undefined };
    } else {
      error = "Invalid coordinates in link";
    }
  } else if (params.q) {
    try {
      const results = await fetchPhotonSearch(params.q);
      if (results[0]) {
        target = results[0];
      } else {
        error = `Could not find "${params.q}"`;
      }
    } catch {
      error = "Search failed. Try again from setup.";
    }
  } else {
    error = "No destination specified";
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

  return <CompassShell target={target} />;
}
