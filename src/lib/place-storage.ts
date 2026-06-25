import type { CompassTarget } from "@/lib/target-url";

const KEY = "anywhere-compass-place";

export function getLastPlace(): CompassTarget | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CompassTarget) : null;
  } catch {
    return null;
  }
}

export function saveLastPlace(target: CompassTarget): void {
  localStorage.setItem(KEY, JSON.stringify(target));
}
