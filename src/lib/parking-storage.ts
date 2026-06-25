import { isValidCoordinate } from "@/lib/target-url";

export type ParkingSpot = {
  lat: number;
  lng: number;
  savedAt: string;
  label?: string;
};

const KEY = "anywhere-compass-parking";
const CHANGE_EVENT = "anywhere-compass-parking-change";

export function getParkingSpot(): ParkingSpot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const spot = JSON.parse(raw) as ParkingSpot;
    return isValidCoordinate(spot.lat, spot.lng) &&
      typeof spot.savedAt === "string"
      ? spot
      : null;
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
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return saved;
}

export function clearParkingSpot(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function hasParkingSpot(): boolean {
  return getParkingSpot() != null;
}

export function subscribeParkingSpot(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}
