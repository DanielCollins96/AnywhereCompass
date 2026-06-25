window.CompassHeading = (function () {
  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function getScreenAngle() {
    if (screen.orientation && typeof screen.orientation.angle === "number") {
      return screen.orientation.angle;
    }
    var legacy = window.orientation;
    if (typeof legacy === "number" && !isNaN(legacy)) {
      return legacy < 0 ? legacy + 360 : legacy;
    }
    return 0;
  }

  function readDeviceHeading(event) {
    if (
      typeof event.webkitCompassHeading === "number" &&
      !isNaN(event.webkitCompassHeading)
    ) {
      return normalizeAngle(event.webkitCompassHeading);
    }

    if (event.alpha == null || isNaN(event.alpha)) return null;

    var isAbsolute =
      event.absolute === true || event.type === "deviceorientationabsolute";
    if (!isAbsolute) return null;

    var heading = normalizeAngle(360 - event.alpha);
    var screenAngle = getScreenAngle();
    if (screenAngle !== 0) {
      heading = normalizeAngle(heading - screenAngle);
    }
    return heading;
  }

  function needleAngle(targetBearing, deviceHeading) {
    return normalizeAngle(targetBearing - deviceHeading);
  }

  return {
    normalizeAngle: normalizeAngle,
    getScreenAngle: getScreenAngle,
    readDeviceHeading: readDeviceHeading,
    needleAngle: needleAngle,
  };
})();
