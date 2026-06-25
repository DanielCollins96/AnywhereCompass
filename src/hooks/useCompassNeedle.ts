"use client";

import { useMemo } from "react";
import {
  bearing,
  distanceMeters,
  isAligned,
  type LatLng,
} from "@/lib/bearing";
import { needleAngle } from "@/lib/compass-heading";

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
    const angle = hasCompass
      ? needleAngle(targetBearing, deviceHeading!)
      : targetBearing;

    return {
      needleAngle: angle,
      targetBearing,
      distance: dist,
      aligned: hasCompass && isAligned(angle),
      hasCompass,
    };
  }, [position, deviceHeading, target]);
}
