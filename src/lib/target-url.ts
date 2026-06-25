export type CompassTarget = {
  lat: number;
  lng: number;
  name?: string;
};

export type CompassMode = "place" | "parking";

export function buildPlaceUrl(
  target: CompassTarget,
  origin?: string,
): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  const params = new URLSearchParams({
    mode: "place",
    to: `${target.lat},${target.lng}`,
  });
  if (target.name) params.set("name", target.name);
  return `${base}/c?${params.toString()}`;
}

export function parseToParam(to: string): CompassTarget | null {
  const [latStr, lngStr] = to.split(",");
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}
