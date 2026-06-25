export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function getScreenAngle(): number {
  if (typeof window === "undefined") return 0;
  if (screen.orientation && typeof screen.orientation.angle === "number") {
    return screen.orientation.angle;
  }
  const legacy = window.orientation;
  if (typeof legacy === "number" && !Number.isNaN(legacy)) {
    return legacy < 0 ? legacy + 360 : legacy;
  }
  return 0;
}

type OrientationLike = {
  alpha: number | null;
  absolute?: boolean;
  type?: string;
  webkitCompassHeading?: number;
};

/** Device heading in degrees clockwise from magnetic north (top of screen forward). */
export function readDeviceHeading(event: OrientationLike): number | null {
  const webkit = event.webkitCompassHeading;
  if (typeof webkit === "number" && !Number.isNaN(webkit)) {
    return normalizeAngle(webkit);
  }

  if (event.alpha == null || Number.isNaN(event.alpha)) return null;

  const isAbsolute =
    event.absolute === true || event.type === "deviceorientationabsolute";
  if (!isAbsolute) return null;

  let heading = normalizeAngle(360 - event.alpha);
  const screenAngle = getScreenAngle();
  if (screenAngle !== 0) {
    heading = normalizeAngle(heading - screenAngle);
  }
  return heading;
}

export function needleAngle(
  targetBearing: number,
  deviceHeading: number,
): number {
  return normalizeAngle(targetBearing - deviceHeading);
}
