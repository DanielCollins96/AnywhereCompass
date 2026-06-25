export const LOCATION_GRANTED_KEY = "anywhere-compass-location-granted";

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
