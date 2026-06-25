import { NextRequest, NextResponse } from "next/server";
import { fetchPhotonSearch } from "@/lib/photon";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const results = await fetchPhotonSearch(q);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Geocoding service unavailable" },
      { status: 502 },
    );
  }
}
