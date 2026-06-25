export type CompassTarget = {
  lat: number;
  lng: number;
  name?: string;
};

export type CompassMode = "place" | "parking";

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

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
  const parts = to.split(",");
  if (parts.length !== 2) return null;

  const lat = Number(parts[0].trim());
  const lng = Number(parts[1].trim());
  if (!isValidCoordinate(lat, lng)) return null;
  return { lat, lng };
}
