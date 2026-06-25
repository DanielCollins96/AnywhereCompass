import { NextRequest, NextResponse } from "next/server";
import { fetchPhotonReverse } from "@/lib/photon";
import { isValidCoordinate } from "@/lib/target-url";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!isValidCoordinate(latitude, longitude)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const name = await fetchPhotonReverse(latitude, longitude);
    return NextResponse.json({ name });
  } catch {
    return NextResponse.json(
      { error: "Geocoding service unavailable" },
      { status: 502 },
    );
  }
}
