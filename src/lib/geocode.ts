export type GeocodeResult = {
  lat: number;
  lng: number;
  name: string;
};

function apiUrl(path: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return path;
}

export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];

  const res = await fetch(
    apiUrl(`/api/geocode/search?q=${encodeURIComponent(query.trim())}`),
  );

  const data = await res.json();

  if (!res.ok) {
    const message =
      typeof data === "object" && data && "error" in data
        ? String(data.error)
        : "Search failed";
    throw new Error(message);
  }

  return Array.isArray(data) ? (data as GeocodeResult[]) : [];
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  const res = await fetch(apiUrl(`/api/geocode/reverse?lat=${lat}&lng=${lng}`));
  if (!res.ok) return null;
  const data = (await res.json()) as { name?: string | null };
  return data.name ?? null;
}
