(function () {
  const root = document.getElementById("compass-app");
  if (!root) return;

  const target = {
    lat: parseFloat(root.dataset.lat),
    lng: parseFloat(root.dataset.lng),
    name: root.dataset.name || "Destination",
  };

  const btn = document.getElementById("compass-start-btn");
  const statusEl = document.getElementById("compass-status");
  const distanceEl = document.getElementById("compass-distance");
  const bearingEl = document.getElementById("compass-bearing");
  const needleWrap = document.getElementById("compass-needle-wrap");

  let userPos = null;
  let watchId = null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function toDeg(rad) {
    return (rad * 180) / Math.PI;
  }

  function normalizeAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function bearing(from, to) {
    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);
    const dLng = toRad(to.lng - from.lng);
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return normalizeAngle(toDeg(Math.atan2(y, x)));
  }

  function distanceMeters(from, to) {
    const R = 6371000;
    const lat1 = toRad(from.lat);
    const lat2 = toRad(to.lat);
    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(meters) {
    if (meters < 1000) return Math.round(meters) + " m";
    return (meters / 1000).toFixed(1) + " km";
  }

  function readHeading(event) {
    if (typeof event.webkitCompassHeading === "number") {
      return event.webkitCompassHeading;
    }
    if (event.alpha == null) return null;
    return normalizeAngle(360 - event.alpha);
  }

  function updateNeedle(deviceHeading) {
    if (!userPos || !needleWrap) return;
    const b = bearing(userPos, target);
    const angle = deviceHeading != null ? normalizeAngle(b - deviceHeading) : b;
    needleWrap.style.transform = "rotate(" + angle + "deg)";
    if (distanceEl) distanceEl.textContent = formatDistance(distanceMeters(userPos, target));
    if (bearingEl) {
      bearingEl.textContent =
        deviceHeading != null
          ? "Rotate device — needle points to target"
          : "Target bearing: " + Math.round(b) + "° from north";
    }
  }

  function onOrientation(event) {
    const heading = readHeading(event);
    if (heading != null) updateNeedle(heading);
  }

  function startOrientationTracking() {
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
    updateNeedle(null);
  }

  function insecureMessage() {
    if (window.isSecureContext || location.hostname === "localhost") return null;
    return "Location needs HTTPS. Use localhost on your computer, or deploy with Vercel/ngrok.";
  }

  async function requestOrientationPermission() {
    if (typeof DeviceOrientationEvent.requestPermission !== "function") {
      return true;
    }
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      return result === "granted";
    } catch {
      return false;
    }
  }

  function startLocationWatch() {
    if (watchId != null) return;
    watchId = navigator.geolocation.watchPosition(
      function (pos) {
        userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updateNeedle(null);
        setStatus("Compass active");
      },
      function (err) {
        setStatus(err.message || "Location error");
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 },
    );
  }

  async function onStartClick() {
    setStatus("Starting…");
    btn.disabled = true;

    const insecure = insecureMessage();
    if (insecure) {
      setStatus(insecure);
      btn.disabled = false;
      return;
    }

    if (!navigator.geolocation) {
      setStatus("Geolocation is not available in this browser.");
      btn.disabled = false;
      return;
    }

    const orientationOk = await requestOrientationPermission();
    if (!orientationOk) {
      setStatus("Compass sensor denied — distance and direction from north still work.");
    } else {
      startOrientationTracking();
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updateNeedle(null);
        startLocationWatch();
        setStatus("Compass active");
        btn.style.display = "none";
      },
      function (err) {
        var msg = err.message || "Could not get location";
        if (err.code === 1) {
          msg =
            "Location denied. Click the lock icon in your address bar and allow location, then try again.";
        }
        setStatus(msg);
        btn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  if (btn) {
    btn.addEventListener("click", onStartClick);
  }

  setStatus("Tap the button below to allow location.");
})();
