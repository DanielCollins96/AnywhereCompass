import type { LatLng } from "@/lib/bearing";

export const LOCATION_GRANTED_KEY = "anywhere-compass-location-granted";
export const MOTION_GRANTED_KEY = "anywhere-compass-motion-granted";
export const LAST_POSITION_KEY = "anywhere-compass-last-position";

export function rememberLocationGranted(): void {
  try {
    localStorage.setItem(LOCATION_GRANTED_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function clearLocationGranted(): void {
  try {
    localStorage.removeItem(LOCATION_GRANTED_KEY);
  } catch {
    /* private mode */
  }
}

export function hasRememberedLocation(): boolean {
  try {
    return localStorage.getItem(LOCATION_GRANTED_KEY) === "1";
  } catch {
    return false;
  }
}

export async function queryGeolocationPermission(): Promise<PermissionState | null> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return null;
  }
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state;
  } catch {
    return null;
  }
}

export async function shouldAutoStartLocation(): Promise<boolean> {
  const permission = await queryGeolocationPermission();
  if (permission === "granted") return true;
  if (permission === "denied") return false;
  return hasRememberedLocation();
}

export function rememberMotionGranted(): void {
  try {
    localStorage.setItem(MOTION_GRANTED_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function hasRememberedMotion(): boolean {
  try {
    return localStorage.getItem(MOTION_GRANTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveLastKnownPosition(pos: LatLng): void {
  try {
    localStorage.setItem(LAST_POSITION_KEY, JSON.stringify(pos));
  } catch {
    /* private mode */
  }
}

export function getLastKnownPosition(): LatLng | null {
  try {
    const raw = localStorage.getItem(LAST_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lat?: unknown; lng?: unknown };
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") {
      return null;
    }
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}
