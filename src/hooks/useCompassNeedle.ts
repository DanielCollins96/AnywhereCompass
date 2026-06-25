"use client";

import { useMemo } from "react";
import {
  bearing,
  distanceMeters,
  isAligned,
  normalizeAngle,
  type LatLng,
} from "@/lib/bearing";

export function useCompassNeedle(
  position: LatLng | null,
  deviceHeading: number | null,
  target: LatLng | null,
) {
  return useMemo(() => {
    if (!position || !target) {
      return {
        needleAngle: 0,
        targetBearing: null as number | null,
        distance: null as number | null,
        aligned: false,
        hasCompass: deviceHeading != null,
      };
    }

    const targetBearing = bearing(position, target);
    const dist = distanceMeters(position, target);
    const hasCompass = deviceHeading != null;
    const needleAngle = hasCompass
      ? normalizeAngle(targetBearing - deviceHeading!)
      : targetBearing;

    return {
      needleAngle,
      targetBearing,
      distance: dist,
      aligned: hasCompass && isAligned(needleAngle),
      hasCompass,
    };
  }, [position, deviceHeading, target]);
}
