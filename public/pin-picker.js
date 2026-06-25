(function () {
  var mapEl = document.getElementById("pin-map");
  if (!mapEl) return;

  var useBtn = document.getElementById("pin-use-btn");
  var statusEl = document.getElementById("pin-status");
  var coordsEl = document.getElementById("pin-coords");

  var pin = null;
  var marker = null;
  var map = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  function fixDefaultIcon() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }

  function showPin(lat, lng) {
    pin = { lat: lat, lng: lng };
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }
    if (useBtn) {
      useBtn.hidden = false;
      useBtn.disabled = false;
      useBtn.textContent = "Use this pin";
    }
    if (coordsEl) {
      coordsEl.textContent = lat.toFixed(5) + ", " + lng.toFixed(5);
      coordsEl.hidden = false;
    }
    setStatus('Pin placed — tap "Use this pin" when ready.');
  }

  function initMap() {
    fixDefaultIcon();
    map = L.map(mapEl, { scrollWheelZoom: true }).setView([40.7128, -74.006], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on("click", function (e) {
      showPin(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(function () {
      map.invalidateSize();
    }, 100);

    setStatus("Tap the map to drop a pin.");

    if (
      navigator.geolocation &&
      (window.isSecureContext || location.hostname === "localhost")
    ) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15);
          setStatus("Centered on your location. Tap the map to drop a pin.");
        },
        function () {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
      );
    }
  }

  async function onUsePin() {
    if (!pin || !useBtn) return;
    useBtn.disabled = true;
    useBtn.textContent = "Confirming…";
    setStatus("Looking up address…");

    var name = "Dropped pin";
    try {
      var res = await fetch(
        "/api/geocode/reverse?lat=" + pin.lat + "&lng=" + pin.lng,
      );
      if (res.ok) {
        var data = await res.json();
        if (data.name) name = data.name;
      }
    } catch (err) {
      /* use default name */
    }

    var params = new URLSearchParams({
      mode: "place",
      to: pin.lat + "," + pin.lng,
      name: name,
    });
    window.location.href = "/c?" + params.toString();
  }

  function boot() {
    if (useBtn) {
      useBtn.addEventListener("click", onUsePin);
    }

    if (window.L) {
      initMap();
      return;
    }

    var s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload = initMap;
    s.onerror = function () {
      setStatus("Could not load map. Check your connection.");
    };
    document.head.appendChild(s);
  }

  boot();
})();
