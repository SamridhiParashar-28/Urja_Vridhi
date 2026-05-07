// ── Matrix rain ───────────────────────────────────────────
const canvas = document.getElementById('matrix-canvas');
const ctx    = canvas.getContext('2d');
let cols, drops;

function initMatrix() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cols  = Math.floor(canvas.width / 20);
  drops = Array(cols).fill(1);
}

function drawMatrix() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  ctx.fillStyle = isLight ? 'rgba(224,240,255,0.15)' : 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = isLight ? '#4a9cff' : '#00ff41';
  ctx.font = '14px Share Tech Mono';
  drops.forEach((y, i) => {
    const char = String.fromCharCode(0x30A0 + Math.random() * 96);
    ctx.fillText(char, i * 20, y * 20);
    if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  });
}

initMatrix();
window.addEventListener('resize', initMatrix);
setInterval(drawMatrix, 60);

// ── Theme Management ─────────────────────────────────────
const THEME_KEY = 'ww_theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = theme === 'light' 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
  }
}

initTheme();
const themeBtn = document.getElementById('themeToggleBtn');
if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

// ── Custom cursor ─────────────────────────────────────────
const cursor    = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
  cx += (mx - cx) * 0.18;
  cy += (my - cy) * 0.18;
  cursor.style.left    = cx + 'px';
  cursor.style.top     = cy + 'px';
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
  });
});


// ── Counter animation for hero stats ─────────────────────
function animateCounter(el, target, suffix, duration) {
  let start = 0;
  const isFloat = target % 1 !== 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = isFloat ? start.toFixed(1) + suffix : Math.floor(start) + suffix;
  }, 16);
}

// Trigger counters when hero stats come into view
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(document.querySelectorAll('.hero-stat-val')[0], 5,    '',  800);
      animateCounter(document.querySelectorAll('.hero-stat-val')[1], 94.2, '%', 1200);
      observer.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) observer.observe(statsEl);
