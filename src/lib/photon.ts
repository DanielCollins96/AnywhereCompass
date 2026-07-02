import { isValidCoordinate } from "@/lib/target-url";

export type GeocodeResult = {
  lat: number;
  lng: number;
  name: string;
};

type PhotonFeature = {
  properties: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

type PhotonResponse = {
  features: PhotonFeature[];
};

export function formatPhotonName(
  props: PhotonFeature["properties"],
): string {
  const parts = [
    props.name,
    props.street,
    props.city,
    props.state,
    props.country,
  ].filter(Boolean);
  return [...new Set(parts)].join(", ") || "Unknown place";
}

export function parsePhotonSearch(data: PhotonResponse): GeocodeResult[] {
  return data.features.flatMap((feature) => {
    const lat = feature.geometry.coordinates[1];
    const lng = feature.geometry.coordinates[0];
    if (!isValidCoordinate(lat, lng)) return [];
    return [{ lat, lng, name: formatPhotonName(feature.properties) }];
  });
}

export function parsePhotonReverse(data: PhotonResponse): string | null {
  const feature = data.features[0];
  if (!feature) return null;
  const [lng, lat] = feature.geometry.coordinates;
  if (!isValidCoordinate(lat, lng)) return null;
  return formatPhotonName(feature.properties);
}

export async function fetchPhotonSearch(query: string): Promise<GeocodeResult[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Geocoding service unavailable");
  const data = (await res.json()) as PhotonResponse;
  return parsePhotonSearch(data);
}

export async function fetchPhotonReverse(
  lat: number,
  lng: number,
): Promise<string | null> {
  const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as PhotonResponse;
  return parsePhotonReverse(data);
}
