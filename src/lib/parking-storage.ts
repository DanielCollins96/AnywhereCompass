export type ParkingSpot = {
  lat: number;
  lng: number;
  savedAt: string;
  label?: string;
};

const KEY = "anywhere-compass-parking";

export function getParkingSpot(): ParkingSpot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ParkingSpot) : null;
  } catch {
    return null;
  }
}

export function saveParkingSpot(
  spot: Omit<ParkingSpot, "savedAt"> & { savedAt?: string },
): ParkingSpot {
  const saved: ParkingSpot = {
    ...spot,
    savedAt: spot.savedAt ?? new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(saved));
  return saved;
}

export function clearParkingSpot(): void {
  localStorage.removeItem(KEY);
}
