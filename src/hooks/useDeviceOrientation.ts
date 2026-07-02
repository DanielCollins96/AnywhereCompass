"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readDeviceHeading } from "@/lib/compass-heading";
import { rememberMotionGranted } from "@/lib/location-preference";

type DeviceOrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

export function useDeviceOrientation(enabled: boolean) {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usingAbsoluteRef = useRef(false);
  const lastEventRef = useRef<DeviceOrientationEvent | null>(null);
  const lastHeadingRef = useRef<number | null>(null);

  const needsPermission =
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as DeviceOrientationEventConstructor)
      .requestPermission === "function";

  // silent=true is safe to call without a user gesture: iOS resolves
  // immediately if motion was already granted this session, and rejects
  // without showing a prompt otherwise.
  const requestPermission = useCallback(async (silent = false) => {
    try {
      if (typeof DeviceOrientationEvent === "undefined") {
        if (!silent) setError("Compass sensor is not available in this browser");
        return false;
      }
      const ctor = DeviceOrientationEvent as DeviceOrientationEventConstructor;
      if (typeof ctor.requestPermission === "function") {
        const result = await ctor.requestPermission();
        if (result !== "granted") {
          if (!silent) setError("Compass permission denied");
          return false;
        }
        rememberMotionGranted();
      }
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch {
      if (!silent) setError("Could not access compass");
      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled || (needsPermission && !permissionGranted)) return;

    usingAbsoluteRef.current = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.type === "deviceorientationabsolute") {
        usingAbsoluteRef.current = true;
      } else if (usingAbsoluteRef.current) {
        return;
      }

      lastEventRef.current = event;
      const nextHeading = readDeviceHeading(event);
      if (nextHeading == null) return;

      // Sensors fire at ~60Hz with sub-degree jitter; updating state that
      // often re-renders the whole compass for invisible movement. Only
      // propagate changes of at least 1 degree.
      const prev = lastHeadingRef.current;
      if (prev != null) {
        const diff = Math.abs(((nextHeading - prev + 540) % 360) - 180);
        if (diff < 1) return;
      }
      lastHeadingRef.current = nextHeading;
      setHeading(nextHeading);
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    const onScreenChange = () => {
      const event = lastEventRef.current;
      if (!event) return;
      const nextHeading = readDeviceHeading(event);
      if (nextHeading == null) return;
      lastHeadingRef.current = nextHeading;
      setHeading(nextHeading);
    };
    screen.orientation?.addEventListener("change", onScreenChange);

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
      window.removeEventListener("deviceorientation", handleOrientation, true);
      screen.orientation?.removeEventListener("change", onScreenChange);
    };
  }, [enabled, needsPermission, permissionGranted]);

  return {
    heading,
    needsPermission,
    permissionGranted,
    requestPermission,
    error,
  };
}
