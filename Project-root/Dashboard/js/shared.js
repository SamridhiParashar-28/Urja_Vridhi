// shared.js — WattWise (Consistent Block Colors + Line-Only Charts)

// ── Custom Cursor ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (!cursor || !cursorDot) return;
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

  document.querySelectorAll('a, button, .nav-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.opacity    = '0';
      cursorDot.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.opacity    = '1';
      cursorDot.style.opacity = '1';
    });
  });
});


/* ── THEME ── */
const THEME_KEY = 'ww_theme';

function initTheme() {
  // Read theme from localStorage (shared with welcome page via 'ww_theme' key)
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
initTheme(); // run immediately to prevent flash

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = next === 'light'
      ? '<i class="fas fa-moon"></i> Dark'
      : '<i class="fas fa-sun"></i> Light';
  }
  if (typeof Chart !== 'undefined') {
    const colors = getChartColors();
    Chart.instances && Object.values(Chart.instances).forEach(chart => {
      chart.options.scales.y.ticks.color   = colors.tick;
      chart.options.scales.x.ticks.color   = colors.tick;
      chart.options.scales.y.grid.color    = colors.grid;
      chart.options.plugins.legend.labels.color = colors.legend;
      chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
      chart.options.plugins.tooltip.titleColor      = colors.tooltipTitle;
      chart.options.plugins.tooltip.bodyColor       = colors.tooltipBody;
      chart.options.plugins.tooltip.borderColor     = colors.tooltipBorder;
      chart.update();
    });
  }
}

function getChartColors() {
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  return light ? {
    tick:         '#4a6a94',
    grid:         'rgba(74,156,255,0.10)',
    legend:       '#0a2a4a',
    tooltipBg:    '#ffffff',
    tooltipTitle: '#4a9cff',
    tooltipBody:  '#2b7fe6',
    tooltipBorder:'#b8d8ff'
  } : {
    tick:         '#007a1f',
    grid:         'rgba(0,255,65,0.06)',
    legend:       '#00cc33',
    tooltipBg:    '#010d01',
    tooltipTitle: '#00ff41',
    tooltipBody:  '#00cc33',
    tooltipBorder:'#00551a'
  };
}

const WW_SAMPLE_DATA = {
  dates: ['Jan 06', 'Jan 07', 'Jan 08', 'Jan 09', 'Jan 10', 'Jan 11', 'Jan 12'],
  blocks: {
    'G-H':   {
      label: 'Block GH',
      icon: 'fa-venus',
      daily: [92.4, 78.2, 94.1, 76.8, 91.6, 61.3, 58.7],
      total: 553.1, avg: 79.0, peak: 94.1, rate: 8.5,
      appliances: [['AC', 238.0], ['Geyser', 210.0], ['Power Socket', 58.5], ['Sockets', 22.4], ['Fan', 12.6], ['Tubelights', 7.56], ['Bulbs', 4.04]]
    },
    'B-H':   {
      label: 'Block BH',
      icon: 'fa-mars',
      daily: [74.3, 81.6, 77.9, 89.2, 93.8, 55.4, 48.9],
      total: 521.1, avg: 74.4, peak: 93.8, rate: 8.5,
      appliances: [['AC', 198.0], ['Geyser', 185.0], ['Power Socket', 72.0], ['Sockets', 31.5], ['Fan', 18.9], ['Tubelights', 9.45], ['Bulbs', 6.25]]
    },
    'AB1':   {
      label: 'Block AB1',
      icon: 'fa-building-columns',
      daily: [177.3, 45.0, 177.3, 45.0, 177.3, 0.0, 0.0],
      total: 621.9, avg: 88.84, peak: 177.3, rate: 8.5,
      appliances: [['PCs', 337.5], ['ACs', 180.0], ['AC', 54.0], ['Fans', 18.0], ['Tube lights', 9.0], ['Smart board', 9.0], ['Sockets', 9.0], ['Smartboard', 5.4]]
    },
    'AB2':   {
      label: 'Block AB2',
      icon: 'fa-building',
      daily: [396.0, 23.4, 396.0, 23.4, 396.0, 0.0, 0.0],
      total: 1234.8, avg: 176.4, peak: 396.0, rate: 8.5,
      appliances: [['PCs', 675.0], ['ACs', 432.0], ['AC', 90.0], ['Smartboards', 10.8], ['Smartboard', 9.0], ['Sockets', 9.0], ['Fans', 9.0]]
    },
    'ADMIN': {
      label: 'Block ADMIN',
      icon: 'fa-landmark',
      daily: [322.47, 91.62, 322.47, 91.62, 322.47, 0.0, 0.0],
      total: 1150.65, avg: 164.38, peak: 322.47, rate: 8.5,
      appliances: [['ACs', 828.0], ['AC', 180.0], ['PCs', 45.0], ['PC', 45.0], ['Sockets', 21.6], ['Smartboards', 10.8], ['Projector', 8.1], ['Fan', 4.5], ['LED TV', 3.6], ['Projector Screen', 2.7], ['Mic Stand', 1.35]]
    }
  }
};

// WW is the live data object used by all pages.
// It defaults to WW_SAMPLE_DATA so charts always show real values on first load.
function _deepCopyWWSample() {
  return {
    dates: [...WW_SAMPLE_DATA.dates],
    blocks: Object.fromEntries(
      Object.entries(WW_SAMPLE_DATA.blocks).map(([k, b]) => [k, {
        label: b.label, icon: b.icon,
        daily: [...b.daily],
        total: b.total, avg: b.avg, peak: b.peak,
        rate: b.rate,
        appliances: b.appliances.map(a => [...a])
      }])
    )
  };
}
const WW = _deepCopyWWSample();

const API_BASE_SHARED = 'http://localhost:5000';

/**
 * Fetches decrypted entries for the active dataset from the backend
 * and merges the aggregated block data into WW.
 * Falls back gracefully to the WW_SAMPLE_DATA defaults if no dataset
 * is active or the network is unavailable.
 * Dispatches  'ww:ready'  on window when done (regardless of outcome).
 */
async function loadAndPopulateWW() {
  const activeId  = localStorage.getItem('activeDatasetId');
  const localKey  = activeId ? localStorage.getItem(`ds_key_${activeId}`) : null;
  const token     = localStorage.getItem('token');

  if (!activeId || !localKey || !token) {
    // No active dataset – keep WW_SAMPLE_DATA defaults, signal ready
    window.dispatchEvent(new CustomEvent('ww:ready', { detail: { source: 'sample' } }));
    return;
  }

  try {
    // localKey is stored as Base64; convert to hex for backend (also handles legacy hex keys)
    const hexKey = localKey.length === 64 && /^[0-9a-f]+$/i.test(localKey)
      ? localKey
      : Array.from(atob(localKey), c => c.charCodeAt(0).toString(16).padStart(2,'0')).join('');

    const res = await fetch(
      `${API_BASE_SHARED}/datasets/${activeId}/entries`,
      { headers: { 'Authorization': `Bearer ${token}`, 'X-Encryption-Key': hexKey } }
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.entries) || data.entries.length === 0) {
      // Dataset exists but has no entries yet – stay on sample data
      window.dispatchEvent(new CustomEvent('ww:ready', { detail: { source: 'sample' } }));
      return;
    }

    // Merge all entries: each entry.content is an array of { blockKey, label, usage } objects
    // (as seeded by seedActiveDataset or processFile).
    // We accumulate totals then compute avg and peak from them.
    const acc = {}; // blockKey -> { label, totalSum, count }
    data.entries.forEach(entry => {
      const items = Array.isArray(entry.content) ? entry.content : [entry.content];
      items.forEach(item => {
        const key = item.blockKey || item.label || 'UNKNOWN';
        if (!acc[key]) acc[key] = { label: item.label || key, totalSum: 0, count: 0 };
        acc[key].totalSum += Number(item.usage || item.avg || 0);
        acc[key].count++;
      });
    });

    // Update WW blocks that we got data for; leave others on sample values
    let gotAnyData = false;
    Object.entries(acc).forEach(([key, val]) => {
      if (WW.blocks[key]) {
        const newAvg   = val.count > 0 ? +(val.totalSum / val.count).toFixed(2) : WW.blocks[key].avg;
        const newTotal = +(val.totalSum).toFixed(2);
        WW.blocks[key].avg   = newAvg;
        WW.blocks[key].total = newTotal;
        WW.blocks[key].peak  = newAvg; // single-entry datasets don't carry daily breakdown
        gotAnyData = true;
      }
    });

    window.dispatchEvent(new CustomEvent('ww:ready', {
      detail: { source: gotAnyData ? 'backend' : 'sample' }
    }));
  } catch (err) {
    console.warn('[WattWise] loadAndPopulateWW failed, using sample data:', err.message);
    window.dispatchEvent(new CustomEvent('ww:ready', { detail: { source: 'sample' } }));
  }
}

// Expose globally
window.loadAndPopulateWW = loadAndPopulateWW;

const BLOCK_COLORS = {
  'G-H':   '#b026ff',
  'B-H':   '#00ff41',
  'AB1':   '#00aaff',
  'AB2':   '#ffaa00',
  'ADMIN': '#ff6432'
};

function getBlockColor(blockKey) {
  return BLOCK_COLORS[blockKey] || '#00ff41';
}

// Distinct appliance colors for pie/doughnut charts (avoids block colors)
// Palette chosen to be vivid, distinct, and NOT overlap with BLOCK_COLORS above
const APPLIANCE_PIE_PALETTE = [
  '#e91e8c', // hot pink
  '#29d9c2', // teal / aqua
  '#f5c518', // golden yellow
  '#ff5252', // coral red
  '#7c4dff', // deep violet
  '#00e5ff', // cyan
  '#ff6d00', // deep orange
  '#76ff03', // lime green
  '#ea80fc', // light purple
  '#1de9b6', // mint
  '#ff4081', // rose
  '#64dd17', // light green
];

/**
 * Returns an array of distinct pie chart colours for `count` appliances.
 * Cycles through APPLIANCE_PIE_PALETTE if there are more appliances than palette entries.
 */
function getApplianceColors(count) {
  return Array.from({ length: count }, (_, i) =>
    APPLIANCE_PIE_PALETTE[i % APPLIANCE_PIE_PALETTE.length]
  );
}

function getDashboardRoot() {
  return '/Dashboard/';
}

function getPublicLogin() {
  return '/public/index.html';
}

function getWelcomePage() {
  return '/welcome.html';
}

function authGuard() {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.replace(getPublicLogin());
    return false;
  }
  return true;
}

function isAdmin() {
  return localStorage.getItem('role') === 'admin';
}

function initSidebar(activeId) {
  if (!authGuard()) return;

  const u = localStorage.getItem('username') || 'User';
  const avatarEl    = document.getElementById('avatarEl');
  const sidebarUser = document.getElementById('sidebarUser');
  const sidebarRole = document.getElementById('sidebarRole');

  if (avatarEl)    avatarEl.textContent    = u[0].toUpperCase();
  if (sidebarUser) sidebarUser.textContent = localStorage.getItem('username') || 'Guest';
  
  // Show active dataset role
  if (sidebarRole) {
    const activeName = localStorage.getItem('activeDatasetName');
    const activeRole = localStorage.getItem('activeDatasetRole');
    if (activeName) {
      const roleTxt = activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1) : 'Member (Syncing...)';
      sidebarRole.textContent = `Role: ${roleTxt}`;
      sidebarRole.style.color = 'var(--accent2)';
    } else {
      sidebarRole.textContent = 'No Active Dataset';
      sidebarRole.style.color = 'var(--text3)';
    }
  }

  // Inject Dataset Manager Link into Sidebar dynamically
  const mainLabel = Array.from(document.querySelectorAll('.nav-section-label')).find(el => el.textContent === 'Main');
  if (mainLabel && !document.querySelector('[data-page="datasets"]') && !document.querySelector('[data-page="dataset_manager"]')) {
    const link = document.createElement('a');
    link.className = 'nav-item';
    link.setAttribute('data-page', 'datasets');
    link.innerHTML = '<i class="fas fa-database"></i> Dataset Manager';
    mainLabel.after(link);
  }

  // Inject Blocks Manager Link into Sidebar dynamically under 'Blocks'
  const blocksLabel = Array.from(document.querySelectorAll('.nav-section-label')).find(el => el.textContent === 'Blocks');
  if (blocksLabel && !document.querySelector('[data-page="blocks_manager"]')) {
    const link = document.createElement('a');
    link.className = 'nav-item';
    link.setAttribute('data-page', 'blocks_manager');
    link.innerHTML = '<i class="fas fa-cubes"></i> Blocks Manager';
    blocksLabel.after(link);
  }

  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === activeId);
    el.addEventListener('click', (e) => {
      // Don't navigate if already on this page
      if (el.dataset.page === activeId) { e.preventDefault(); return; }
      navigate(el.dataset.page);
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Preserve theme across logout so welcome page keeps user's theme preference
      const savedTheme = localStorage.getItem(THEME_KEY);
      localStorage.clear();
      if (savedTheme) localStorage.setItem(THEME_KEY, savedTheme);
      window.location.replace(getWelcomePage());
    });
  }

  // Inject theme toggle button into topbar-right (beside System Online)
  const topbarRight = document.querySelector('.topbar-right');
  if (topbarRight && !document.getElementById('themeToggleBtn')) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const btn = document.createElement('button');
    btn.id        = 'themeToggleBtn';
    btn.className = 'theme-toggle-btn';
    btn.innerHTML = isLight
      ? '<i class="fas fa-moon"></i> Dark'
      : '<i class="fas fa-sun"></i> Light';
    btn.addEventListener('click', toggleTheme);
    topbarRight.insertBefore(btn, topbarRight.firstChild);
  }

  // Inject Active Dataset Name into Topbar Left
  updateActiveDatasetDisplay();
}

function updateActiveDatasetDisplay() {
  const topbarLeft = document.querySelector('.topbar-left');
  if (!topbarLeft) return;

  const datasetName = localStorage.getItem('activeDatasetName');
  let pill = document.getElementById('activeDatasetDisplay');

  if (!datasetName) {
    if (pill) pill.remove();
    return;
  }

  if (!pill) {
    pill = document.createElement('div');
    pill.id = 'activeDatasetDisplay';
    pill.className = 'active-dataset-pill';
    topbarLeft.prepend(pill);
  }

  pill.innerHTML = `<i class="fas fa-database"></i> Active Dataset: ${datasetName}`;
}

function navigate(page) {
  const root = getDashboardRoot();
  const map = {
    dashboard:       root + 'dashboard.html',
    dataset_manager: root + 'pages/dataset_manager.html',
    datasets:        root + 'pages/datasets.html',       // Bug Fix #8: added datasets page route
    blocks_manager:  root + 'pages/blocks_manager.html',
    block_custom:    root + 'pages/block_custom.html',
    live:            root + 'pages/live.html',
    consumption:     root + 'pages/consumption.html',
    forecast:        root + 'pages/forecast.html',
    lstm_dashboard:  root + 'pages/lstm_dashboard.html',
    ai_assistant:    root + 'pages/ai_assistant.html',
    anomalies:       root + 'pages/anomalies.html',
    billing:         root + 'pages/billing.html',
    export:          root + 'pages/export.html',
    switch_user:     root + 'pages/switch_user.html',
    block_gh:        root + 'pages/block_gh.html',
    block_bh:        root + 'pages/block_bh.html',
    block_ab1:       root + 'pages/block_ab1.html',
    block_ab2:       root + 'pages/block_ab2.html',
    block_adm:       root + 'pages/block_adm.html',
  };
  if (map[page]) window.location.href = map[page];
  else console.warn('[WattWise] Unknown page:', page);
}

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#007a1f', font: { family: "'Share Tech Mono'", size: 10 } }, grid: { color: 'rgba(0,255,65,0.06)' } },
    x: { ticks: { color: '#007a1f', font: { family: "'Share Tech Mono'", size: 10 } }, grid: { display: false } }
  },
  plugins: {
    legend:  { labels: { color: '#00cc33', font: { family: "'Share Tech Mono'", size: 11 }, boxWidth: 12 } },
    tooltip: { backgroundColor: '#010d01', borderColor: '#00551a', borderWidth: 1, titleColor: '#00ff41', bodyColor: '#00cc33' }
  }
};

function buildChartDefaults() {
  const c = getChartColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { beginAtZero: true, ticks: { color: c.tick, font: { family: "'Share Tech Mono'", size: 10 } }, grid: { color: c.grid } },
      x: { ticks: { color: c.tick, font: { family: "'Share Tech Mono'", size: 10 } }, grid: { display: false } }
    },
    plugins: {
      legend:  { labels: { color: c.legend, font: { family: "'Share Tech Mono'", size: 11 }, boxWidth: 12 } },
      tooltip: { backgroundColor: c.tooltipBg, borderColor: c.tooltipBorder, borderWidth: 1, titleColor: c.tooltipTitle, bodyColor: c.tooltipBody }
    }
  };
}

function lineChart(id, labels, datasets) {
  const el = document.getElementById(id);
  if (!el) return null;
  return new Chart(el.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: buildChartDefaults()
  });
}

function dataset(label, data, blockKey) {
  const color = getBlockColor(blockKey);
  return {
    label,
    data,
    borderColor: color,
    backgroundColor: 'transparent',
    tension: 0.4,
    fill: false,
    borderWidth: 3.5,
    pointBackgroundColor: '#f4f0f0',
    pointBorderColor: color,
    pointBorderWidth: 2.5,
    pointRadius: 4,
    pointHoverRadius: 7
  };
}

function exportCSV(rows, filename) {
  const csv = rows.map(row =>
    row.map(cell => {
      const str = String(cell);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? '"' + str.replace(/"/g, '""') + '"'
        : str;
    }).join(',')
  ).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const BUDGET_KEY = 'ww_budgets';

function getBudgets() {
  try { return JSON.parse(localStorage.getItem(BUDGET_KEY)) || {}; }
  catch { return {}; }
}

function saveBudget(key, value) {
  const b = getBudgets();
  b[key] = value;
  localStorage.setItem(BUDGET_KEY, JSON.stringify(b));
}

function getBudgetStatus(spent, budget) {
  if (!budget || budget <= 0) return null;
  const pct = (spent / budget) * 100;
  if (pct >= 100) return { label: 'OVER BUDGET', cls: 'badge-bad', pct };
  if (pct >= 80)  return { label: 'NEAR LIMIT',  cls: 'badge-warn', pct };
  return { label: 'WITHIN BUDGET', cls: 'badge-ok', pct };
}

/* ── CUSTOM CURSOR LOGIC ── */
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch devices

  // Inject elements if they don't exist
  if (!document.getElementById('cursor')) {
    const c = document.createElement('div');
    c.id = 'cursor';
    c.className = 'cursor';
    document.body.appendChild(c);
  }
  if (!document.getElementById('cursorDot')) {
    const cd = document.createElement('div');
    cd.id = 'cursorDot';
    cd.className = 'cursor-dot';
    document.body.appendChild(cd);
  }

  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  if (!cursor || !cursorDot) return;

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => { 
    mx = e.clientX; 
    my = e.clientY; 
  });

  function animateCursor() {
    cx += (mx - cx) * 0.18;
    cy += (my - cy) * 0.18;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states for interactive elements
  const updateHovers = () => {
    document.querySelectorAll('a, button, .nav-item, .block-btn, .theme-toggle-btn').forEach(el => {
      if (el.hasCursorListener) return;
      el.hasCursorListener = true;
      el.addEventListener('mouseenter', () => {
        cursor.style.opacity = '0';
        cursorDot.style.opacity = '0';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.opacity = '1';
        cursorDot.style.opacity = '1';
      });
    });
  };

  updateHovers();
  // Periodically check for new elements (e.g. dynamic sidebars)
  setInterval(updateHovers, 3000);
}

// Run cursor init on boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
  initCustomCursor();
}