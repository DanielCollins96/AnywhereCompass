(function () {
  var CH = window.CompassHeading;
  if (!CH) return;

  var root = document.getElementById("compass-app");
  if (!root) return;

  var target = {
    lat: parseFloat(root.dataset.lat),
    lng: parseFloat(root.dataset.lng),
    name: root.dataset.name || "Destination",
  };

  var btn = document.getElementById("compass-start-btn");
  var statusEl = document.getElementById("compass-status");
  var distanceEl = document.getElementById("compass-distance");
  var bearingEl = document.getElementById("compass-bearing");
  var needleWrap = document.getElementById("compass-needle-wrap");

  var userPos = null;
  var watchId = null;
  var lastDeviceHeading = null;
  var usingAbsoluteOrientation = false;
  var lastOrientationEvent = null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function toDeg(rad) {
    return (rad * 180) / Math.PI;
  }

  function bearing(from, to) {
    var lat1 = toRad(from.lat);
    var lat2 = toRad(to.lat);
    var dLng = toRad(to.lng - from.lng);
    var y = Math.sin(dLng) * Math.cos(lat2);
    var x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return CH.normalizeAngle(toDeg(Math.atan2(y, x)));
  }

  function distanceMeters(from, to) {
    var R = 6371000;
    var lat1 = toRad(from.lat);
    var lat2 = toRad(to.lat);
    var dLat = toRad(to.lat - from.lat);
    var dLng = toRad(to.lng - from.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(meters) {
    if (meters < 1000) return Math.round(meters) + " m";
    return (meters / 1000).toFixed(1) + " km";
  }

  function updateNeedle(deviceHeading) {
    if (!userPos || !needleWrap) return;

    if (deviceHeading != null) {
      lastDeviceHeading = deviceHeading;
    }

    var heading = lastDeviceHeading;
    var b = bearing(userPos, target);
    var angle =
      heading != null ? CH.needleAngle(b, heading) : b;

    needleWrap.style.transform = "rotate(" + angle + "deg)";

    if (distanceEl) {
      distanceEl.textContent = formatDistance(distanceMeters(userPos, target));
    }
    if (bearingEl) {
      if (heading != null) {
        bearingEl.textContent =
          "Hold phone upright — needle points toward " + target.name;
      } else {
        bearingEl.textContent =
          "Target bearing: " + Math.round(b) + "° from north (no compass sensor)";
      }
    }
  }

  function onOrientation(event) {
    if (event.type === "deviceorientationabsolute") {
      usingAbsoluteOrientation = true;
    } else if (usingAbsoluteOrientation) {
      return;
    }

    lastOrientationEvent = event;
    var heading = CH.readDeviceHeading(event);
    if (heading != null) updateNeedle(heading);
  }

  function startOrientationTracking() {
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    if (!("ondeviceorientationabsolute" in window)) {
      window.addEventListener("deviceorientation", onOrientation, true);
    }

    if (screen.orientation && screen.orientation.addEventListener) {
      screen.orientation.addEventListener("change", function () {
        if (!lastOrientationEvent) return;
        var heading = CH.readDeviceHeading(lastOrientationEvent);
        if (heading != null) updateNeedle(heading);
      });
    }

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
      var result = await DeviceOrientationEvent.requestPermission();
      return result === "granted";
    } catch (err) {
      return false;
    }
  }

  function startLocationWatch() {
    if (watchId != null) return;
    watchId = navigator.geolocation.watchPosition(
      function (pos) {
        userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updateNeedle(lastDeviceHeading);
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

    var insecure = insecureMessage();
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

    var orientationOk = await requestOrientationPermission();
    if (!orientationOk) {
      setStatus(
        "Compass sensor denied — arrow shows map direction only, not phone rotation.",
      );
    } else {
      startOrientationTracking();
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        updateNeedle(lastDeviceHeading);
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
