import { NextRequest, NextResponse } from "next/server";
import { fetchPhotonReverse } from "@/lib/photon";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    const name = await fetchPhotonReverse(parseFloat(lat), parseFloat(lng));
    return NextResponse.json({ name });
  } catch {
    return NextResponse.json({ name: null });
  }
}
