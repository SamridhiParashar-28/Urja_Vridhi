document.addEventListener("DOMContentLoaded", () => {

  const form      = document.getElementById("loginForm");
  const toggle    = document.getElementById("togglePassword");
  const passInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitBtn");
  const errorEl   = document.getElementById("error-message");

  // Pre-fill username if passed from register page
const prefill = localStorage.getItem("prefillUsername");
if (prefill) {
  document.getElementById("username").value = prefill;
  localStorage.removeItem("prefillUsername");
}
  

  // ── Password visibility toggle ─────────────────────────
  if (toggle && passInput) {
    toggle.addEventListener("click", () => {
      const show     = passInput.type === "password";
      passInput.type = show ? "text" : "password";
      toggle.classList.toggle("fa-eye",      !show);
      toggle.classList.toggle("fa-eye-slash", show);
    });
  }

  if (!form) return;

  // ── Form submit ────────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage();

    const username = document.getElementById("username")?.value?.trim();
    const password = passInput?.value?.trim();

    if (!username || !password) {
      return showError("Please enter your username and password.");
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = "Signing in…";

    try {
      const res  = await fetch("/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const _savedTheme = localStorage.getItem("ww_theme");
        localStorage.clear();
        if (_savedTheme) localStorage.setItem("ww_theme", _savedTheme);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username",   data.username);
        localStorage.setItem("token",      data.token);

        showSuccess("Login successful! Redirecting…");

        // index.html is at: Watt-Wise/Project-root/public/index.html
        // dashboard.html is: Watt-Wise/Project-root/Dashboard/dashboard.html
        // From public/ → go up one level (..) → into Dashboard/
        setTimeout(() => {
          window.location.replace("../Dashboard/dashboard.html");
        }, 1000);

      } else {
        showError(data.message || "Invalid username or password.");
      }
    } catch {
      showError("Cannot connect to server. Is the backend running on port 5000?");
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = "Sign in";
    }
  });

  // ── Helpers ────────────────────────────────────────────
  function showError(msg) {
    errorEl.style.color   = "var(--danger, #ff3366)";
    errorEl.innerText     = msg;
    errorEl.style.display = "block";
  }

  function showSuccess(msg) {
    errorEl.style.color   = "var(--success, #00ff41)";
    errorEl.innerText     = msg;
    errorEl.style.display = "block";
  }

  function clearMessage() {
    errorEl.style.display = "none";
    errorEl.textContent   = "";
  }

  // ── Custom cursor ─────────────────────────────────────────
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (cursor && cursorDot) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const animateCursor = () => {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.left    = cx + 'px';
      cursor.style.top     = cy + 'px';
      cursorDot.style.left = mx + 'px';
      cursorDot.style.top  = my + 'px';
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll('a, button, input, .password-toggle').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
      });
    });
  }
});