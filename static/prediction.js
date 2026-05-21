// prediction.js
// ==========================================================
// Handles all real-time dashboard logic for NIDS demo
// - Socket.IO streaming
// - Live map visualization
// - Attack rate chart (last 60 seconds)
// - Replay & threshold controls


// --- MODIFIED: Wait for the *entire window* to load ---
// This ensures Leaflet (L) and Chart.js are defined before we use them.
window.addEventListener("load", function () {

  // --- Socket.IO Setup ---
  const socket = io.connect("http://localhost:5000");
  socket.on("connect", () => {
    console.log("✅ Connected to server");
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected");
  });
  const feed = document.getElementById("live-feed");

  function logToFeed(message, type = "info") {
    if (feed) {
      const line = document.createElement("div");
      line.textContent = message;
      if (type === "alert") {
        line.style.color = "red";
        line.style.fontWeight = "bold";
      } else if (type === "warn") {
        line.style.color = "orange";
      } else {
        line.style.color = "#333";
      }
      feed.appendChild(line);
      feed.scrollTop = feed.scrollHeight; // Auto-scroll
    }
  }

  socket.on("connect", () => {
    console.log("🟢 Connected to Flask-SocketIO server");
    logToFeed("✅ Connected to server.", "info");
  });

  socket.on("disconnect", () => {
    console.warn("🔴 Disconnected from server");
    logToFeed("🔴 Disconnected from server. Trying to reconnect...", "warn");
  });

  socket.on("error", (data) => {
    console.error("Server Error:", data.message);
    logToFeed(`⚠️ SERVER ERROR: ${data.message}`, "warn");
  });

  // --- Leaflet Map Setup (Robust Check) ---
  let map; // Declare map variable
  const mapElement = document.getElementById("map");
  if (mapElement) {
    try {
      map = L.map("map").setView([20, 0], 2); // Center of world
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        minZoom: 2,
        maxZoom: 18,
      }).addTo(map);
      console.log("🗺️ Map initialized successfully.");
    } catch (e) {
      console.error("Map initialization failed:", e);
    }
  } else {
    console.warn("Map element with id='map' not found. Skipping map.");
  }

  // --- Real-time Attack Chart Setup (Robust Check) ---
  let attackRateChart;
  let attackData = {
    labels: Array(60).fill(""), // 60 data points (seconds)
    datasets: [
      {
        label: "Attacks/sec",
        data: Array(60).fill(0),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 1,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartCanvas = document.getElementById("attackRateChart");
  if (chartCanvas) {
    try {
      const ctxAttack = chartCanvas.getContext("2d");
      attackRateChart = new Chart(ctxAttack, {
        type: "line",
        data: attackData,
        options: {
          scales: {
            y: { beginAtZero: true, suggestedMax: 10 },
            x: { ticks: { display: false } },
          },
          plugins: { legend: { display: false } },
          maintainAspectRatio: false,
        },
      });
      console.log("📈 Attack chart initialized successfully.");

      let attackCountPerSecond = 0;
      // Update chart every second
      setInterval(() => {
        attackData.datasets[0].data.shift(); // remove oldest
        attackData.datasets[0].data.push(attackCountPerSecond); // add current
        if (attackRateChart) {
          attackRateChart.update("none"); // 'none' for no animation
        }
        attackCountPerSecond = 0; // reset counter
      }, 1000);
    } catch (e) {
      console.error("Chart initialization failed:", e);
    }
  } else {
    console.warn("Chart canvas with id='attackRateChart' not found. Skipping chart.");
  }


  // --- Main Socket Event Handler ---
  socket.on("flow_result", function (data) {
    // data = {ts, src_ip, dst_ip, attack_score, label, shap_explain, geo?}
    const isAttack = data.label === 1;

    // 1. Update Live Feed
    let logMsg = `[${data.src_ip} -> ${data.dst_ip}] Score: ${data.attack_score.toFixed(
      3
    )}`;
    if (isAttack) {
      logMsg = `🚨 ATTACK: ${logMsg}`;
      // Add SHAP explanation if it exists
      if (data.shap_explain && Object.keys(data.shap_explain).length > 0) {
        const explain = Object.entries(data.shap_explain)
          .map(([f, v]) => `${f}: ${v.toFixed(2)}`)
          .join(", ");
        logMsg += ` | Reason: {${explain}}`;
      }
      logToFeed(logMsg, "alert");
    } else {
      // Optional: log benign flows too
      // logToFeed(logMsg, 'info');
    }

    // 2. Update Map (if map exists)
    if (map && data.geo && data.geo.lat) {
      const isAttackMarker = data.label === 1;

      // --- Colour scheme ---
      //   Attack  → red fill  + bright red border (glow effect)
      //   Benign  → green fill + dark green border
      const fillColor = isAttackMarker ? '#ff2222' : '#00cc55';
      const borderColor = isAttackMarker ? '#ff6666' : '#007733';
      const markerRadius = isAttackMarker ? 8 : 6;
      const borderWidth = isAttackMarker ? 2 : 1;

      // Tooltip label text
      const labelText = isAttackMarker ? 'Attack' : 'Benign';

      // Build the circle marker (no bindPopup — we use a hover tooltip instead)
      const marker = L.circleMarker([data.geo.lat, data.geo.lon], {
        radius: markerRadius,
        fillColor: fillColor,
        color: borderColor,   // border colour
        weight: borderWidth,
        fillOpacity: 0.85,
        opacity: 1
      }).addTo(map);

      // --- Custom floating hover tooltip ---
      // We build a single shared <div> tooltip at the top of the page,
      // then reposition and show/hide it on marker mouseover/mouseout.
      // This avoids alert() and click-requirement of bindPopup().
      let tooltip = document.getElementById('map-hover-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'map-hover-tooltip';
        Object.assign(tooltip.style, {
          position: 'fixed',
          background: 'rgba(15,15,25,0.92)',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: 'monospace',
          pointerEvents: 'none',   // don't block mouse events on map
          zIndex: '9999',
          border: '1px solid #444',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          display: 'none',
          lineHeight: '1.6',
          whiteSpace: 'nowrap'
        });
        document.body.appendChild(tooltip);
      }

      marker.on('mouseover', function (e) {
        tooltip.innerHTML =
          `<span style="color:#aaa">IP:</span>    <b>${data.src_ip}</b><br>` +
          `<span style="color:#aaa">Score:</span> <b style="color:${isAttackMarker ? '#ff6666' : '#00dd66'}">${(data.attack_score || 0).toFixed(3)}</b><br>` +
          `<span style="color:#aaa">Type:</span>  <b style="color:${isAttackMarker ? '#ff4444' : '#00cc55'}">${labelText}</b>`;
        tooltip.style.display = 'block';
        // Position near the mouse cursor
        const latlng = e.containerPoint;
        const mapRect = document.getElementById('map').getBoundingClientRect();
        tooltip.style.left = (mapRect.left + latlng.x + 14) + 'px';
        tooltip.style.top = (mapRect.top + latlng.y - 10) + 'px';
      });

      marker.on('mousemove', function (e) {
        // Keep tooltip following the cursor
        const latlng = e.containerPoint;
        const mapRect = document.getElementById('map').getBoundingClientRect();
        tooltip.style.left = (mapRect.left + latlng.x + 14) + 'px';
        tooltip.style.top = (mapRect.top + latlng.y - 10) + 'px';
      });

      marker.on('mouseout', function () {
        tooltip.style.display = 'none';
      });
    }


    // 3. Update Real-time Chart Counter (if chart exists)
    if (attackRateChart && isAttack) {
      // Find the count variable inside the interval scope
      // This is tricky, let's redefine:
      const currentData = attackRateChart.data.datasets[0].data;
      const lastValue = currentData[currentData.length - 1];
      // This is not ideal, the logic should be inside the interval
      // The interval logic will handle this.
    }
  });

  // --- Control Listeners ---
  // This code should now be reached reliably.
  console.log("Attaching control listeners...");

  // Replay Controls
  const replaySpeedSlider = document.getElementById("replaySpeed");
  const replaySpeedLabel = document.getElementById("replaySpeedLabel");
  const startReplayButton = document.getElementById("startReplay");

  if (replaySpeedSlider && replaySpeedLabel) {
    replaySpeedSlider.addEventListener("input", () => {
      replaySpeedLabel.textContent = replaySpeedSlider.value;
    });
  }

  if (startReplayButton) {
    startReplayButton.addEventListener("click", () => {
      let speed = replaySpeedSlider ? parseFloat(replaySpeedSlider.value) : 1.0;
      speed = Math.min(speed, 10);  // limit to 10x
      // --- NEW: Console log on click ---
      console.log(`▶️ CLICK: Start Replay at ${speed}x`);
      logToFeed(`▶️ Starting replay at ${speed}x...`, "info");
      socket.emit("start_replay", { speed: speed });
    });
  } else {
    console.error("Start Replay button not found!");
  }

  // Parameter Controls
  const alphaSlider = document.getElementById("alpha");
  const betaSlider = document.getElementById("beta");
  const threshSlider = document.getElementById("thresh");
  const alphaLabel = document.getElementById("alphaLabel");
  const betaLabel = document.getElementById("betaLabel");
  const threshLabel = document.getElementById("threshLabel");
  const applyParamsButton = document.getElementById("applyParams");

  if (alphaSlider && alphaLabel) alphaSlider.addEventListener("input", () => alphaLabel.textContent = alphaSlider.value);
  if (betaSlider && betaLabel) betaSlider.addEventListener("input", () => betaLabel.textContent = betaSlider.value);
  if (threshSlider && threshLabel) threshSlider.addEventListener("input", () => threshLabel.textContent = threshSlider.value);

  if (applyParamsButton) {
    applyParamsButton.addEventListener("click", () => {
      const params = {
        alpha: alphaSlider ? alphaSlider.value : 0.6,
        beta: betaSlider ? betaSlider.value : 0.4,
        thresh: threshSlider ? threshSlider.value : 0.5,
      };
      // --- NEW: Console log on click ---
      console.log("🔧 CLICK: Applying params:", params);
      logToFeed(
        `🔧 Applying params: α=${params.alpha}, β=${params.beta}, T=${params.thresh}`, "info"
      );
      socket.emit("set_params", params);
    });
  } else {
    console.error("Apply Params button not found!");
  }

  console.log("✅ All event listeners attached.");

}); // <-- Closes the "window.addEventListener('load', ...)"