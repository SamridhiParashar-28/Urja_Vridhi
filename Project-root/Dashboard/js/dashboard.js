document.addEventListener("DOMContentLoaded", () => {

  // ── Auth Guard ──────────────────────────────────────────
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    window.location.replace("../public/index.html");
    return;
  }

  const username = localStorage.getItem("username") || "samridhi";

  // ── Populate User Info ──────────────────────────────────
  const userEl = document.getElementById("current-user");
  if (userEl) userEl.textContent = username;

  const updateEl = document.getElementById("last-update");
  if (updateEl) {
    updateEl.textContent = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  // ── Logout Handler ──────────────────────────────────────
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.replace("../wecomepage/welcome.html");
    });
  }

  // ── Sidebar Active Link Highlighting ─────────────────────
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(link => {
    link.addEventListener("click", function () {
      navItems.forEach(l => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Auto-highlight current page (Dashboard)
  navItems.forEach(link => {
    if (link.getAttribute("data-page") === "dashboard") {
      link.classList.add("active");
    }
  });

  // ── Dummy Data ──────────────────────────────────────────
  const dummyData = {
    todayUsage:  "14.8",
    todayChange: "+12% from yesterday",
    monthUsage:  "287.4",
    monthChange: "−3.1% from last month",
    peakHour:    "18:00 – 19:00 (3.2 kW)",
    hasAnomaly:  true
  };

  // Safe element setter
  function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  setEl("today-usage",  dummyData.todayUsage + " kWh");
  setEl("today-change", dummyData.todayChange);
  setEl("month-usage",  dummyData.monthUsage + " kWh");
  setEl("month-change", dummyData.monthChange);
  setEl("peak-hour",    dummyData.peakHour);

  // Anomaly Alert
  const alertCard = document.getElementById("anomaly-alert");
  if (dummyData.hasAnomaly && alertCard) {
    alertCard.style.display = "block";
  }

  // ── Chart with Transparent Points ───────────────────────
  const canvas = document.getElementById("consumptionChart");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label:           "kWh / day",
          data:            [18.2, 21.5, 19.8, 24.1, 22.7, 17.3, 15.9],
          borderColor:     "#00ff41",
          backgroundColor: "rgba(0, 255, 65, 0.08)",
          tension:         0.35,
          fill:            false,                    // Cleaner look
          borderWidth:     3,
          pointBackgroundColor: "transparent",       // ← Transparent center (as requested)
          pointBorderColor:     "#00ff41",
          pointBorderWidth:     2.5,
          pointRadius:          5,
          pointHoverRadius:     7.5,
          pointHoverBackgroundColor: "#00ff41",
          pointHoverBorderColor: "#000"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#00cc33" },
            grid:  { color: "rgba(0, 255, 65, 0.08)" }
          },
          x: {
            ticks: { color: "#00cc33" },
            grid:  { display: false }
          }
        },
        plugins: {
          legend: {
            labels: { color: "#00ff41", font: { size: 13 } }
          },
          tooltip: {
            backgroundColor: "#001100",
            borderColor:     "#00aa33",
            borderWidth:     1,
            titleColor:      "#00ff41",
            bodyColor:       "#00cc33",
            displayColors:   false
          }
        }
      }
    });
  }

  // ── Future: Real Data Fetch (Uncomment when backend ready) ──
  /*
  async function loadRealData() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/usage/summary", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      // Update your elements with real data here
    } catch (err) {
      console.warn("Using dummy data:", err);
    }
  }
  // loadRealData();
  */
});