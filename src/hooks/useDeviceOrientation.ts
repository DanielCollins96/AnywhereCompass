"use client";

import { useCallback, useEffect, useState } from "react";

type DeviceOrientationEventWithWebkit = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type DeviceOrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

function readHeading(event: DeviceOrientationEvent): number | null {
  const e = event as DeviceOrientationEventWithWebkit;

  if (
    typeof e.webkitCompassHeading === "number" &&
    !Number.isNaN(e.webkitCompassHeading)
  ) {
    return e.webkitCompassHeading;
  }

  if (event.alpha == null) return null;

  if (event.absolute) {
    return (360 - event.alpha) % 360;
  }

  return (360 - event.alpha) % 360;
}

export function useDeviceOrientation(enabled: boolean) {
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ctor = DeviceOrientationEvent as DeviceOrientationEventConstructor;
    const requiresPermission = typeof ctor.requestPermission === "function";
    setNeedsPermission(requiresPermission);
    if (!requiresPermission) setPermissionGranted(true);
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const ctor = DeviceOrientationEvent as DeviceOrientationEventConstructor;
      if (typeof ctor.requestPermission === "function") {
        const result = await ctor.requestPermission();
        if (result !== "granted") {
          setError("Compass permission denied");
          return false;
        }
      }
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch {
      setError("Could not access compass");
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !permissionGranted) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const nextHeading = readHeading(event);
      if (nextHeading != null) setHeading(nextHeading);
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [enabled, permissionGranted]);

  return {
    heading,
    needsPermission,
    permissionGranted,
    requestPermission,
    error,
  };
}
