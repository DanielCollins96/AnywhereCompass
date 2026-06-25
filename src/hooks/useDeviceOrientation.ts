"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readDeviceHeading } from "@/lib/compass-heading";

type DeviceOrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

export function useDeviceOrientation(enabled: boolean) {
  const [heading, setHeading] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const usingAbsoluteRef = useRef(false);
  const lastEventRef = useRef<DeviceOrientationEvent | null>(null);

  const needsPermission =
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as DeviceOrientationEventConstructor)
      .requestPermission === "function";

  const requestPermission = useCallback(async () => {
    try {
      if (typeof DeviceOrientationEvent === "undefined") {
        setError("Compass sensor is not available in this browser");
        return false;
      }
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
      if (nextHeading != null) setHeading(nextHeading);
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    const onScreenChange = () => {
      const event = lastEventRef.current;
      if (!event) return;
      const nextHeading = readDeviceHeading(event);
      if (nextHeading != null) setHeading(nextHeading);
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
