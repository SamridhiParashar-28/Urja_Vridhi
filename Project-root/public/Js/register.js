document.addEventListener("DOMContentLoaded", () => {

  const form        = document.getElementById("registerForm");
  const toggle      = document.getElementById("togglePassword");
  const passInput   = document.getElementById("password");
  const confirmPass = document.getElementById("confirmPassword");
  const submitBtn   = document.getElementById("submitBtn");
  const messageEl   = document.getElementById("message");

  // ── Password visibility toggle ─────────────────────────
  if (toggle && passInput) {
    toggle.addEventListener("click", () => {
      const show = passInput.type === "password";
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

    const username     = document.getElementById("username")?.value?.trim() ?? "";
    const passValue    = passInput?.value ?? "";
    const confirmValue = confirmPass?.value ?? "";

    // Client-side validation
    if (!username || !passValue || !confirmValue)
      return showMessage("All fields are required.", "error");
    if (username.length < 3 || username.length > 50)
      return showMessage("Username must be 3–50 characters.", "error");
    if (passValue.length < 6)
      return showMessage("Password must be at least 6 characters.", "error");
    if (passValue !== confirmValue)
      return showMessage("Passwords do not match.", "error");

    submitBtn.disabled    = true;
    submitBtn.textContent = "Creating account…";

    try {
      // Step 1: Register
      const regRes = await fetch("http://localhost:5000/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password: passValue }),
      });

      const regData = await regRes.json();

      if (!regRes.ok || !regData.success) {
        return showMessage(regData.message || "Registration failed.", "error");
      }

    showMessage("Account created! Redirecting to sign in…", "success");
    localStorage.setItem("prefillUsername", username);
    window.location.href = "index.html";


    } catch (err) {
      console.error("Registration error:", err);
      showMessage(
        "Cannot connect to server. Make sure the backend is running on port 5000.",
        "error"
      );
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = "REGISTER";
    }
  });

  // ── Helpers ────────────────────────────────────────────
  function showMessage(text, type = "error") {
    messageEl.innerText     = text;
    messageEl.style.color   = type === "success" ? "var(--success, #00ff41)" : "var(--danger, #ff3366)";
    messageEl.style.display = "block";
  }
  function clearMessage() {
    messageEl.style.display = "none";
    messageEl.textContent   = "";
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

    document.querySelectorAll('a, button, input').forEach(el => {
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
