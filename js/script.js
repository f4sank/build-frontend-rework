/* ============================
   DungeonScribe — script.js
   ============================ */

/* ---------------------------------
   1) Cursor lighting (no parallax)
----------------------------------*/
const rootEl = document.documentElement;

// Set center defaults
rootEl.style.setProperty('--mx', '50vw');
rootEl.style.setProperty('--my', '50vh');

// Update CSS vars for the torchlight glow
function updateLightPos(x, y) {
    rootEl.style.setProperty('--mx', `${x}px`);
    rootEl.style.setProperty('--my', `${y}px`);
}

window.addEventListener('mousemove', (e) => {
    updateLightPos(e.clientX, e.clientY);
});

window.addEventListener('touchmove', (e) => {
    if (!e.touches?.length) return;
    const t = e.touches[0];
    updateLightPos(t.clientX, t.clientY);
}, { passive: true });


/* ---------------------------------
   2) Sidebar + Home button syncing
----------------------------------*/
const menuBtn = document.getElementById('menu-btn');
const homeBtn = document.getElementById('home-btn');     // may be undefined if not present
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open', sidebar.classList.contains('open')); // ← add this
    });

    document.addEventListener('click', (e) => {
        const clickedOutside =
            !sidebar.contains(e.target) &&
            !menuBtn.contains(e.target) &&
            !(homeBtn && homeBtn.contains(e.target));
        if (sidebar.classList.contains('open') && clickedOutside) {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open'); // ← add this
        }
    });
}


// (Optional) Home button placeholder action
if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        // Implement navigation if needed
        // e.g., location.href = '/';
    });
}


/* ---------------------------------
   3) Transcription Settings panel
      - play/pause icon toggle
      - status indicator dot color
----------------------------------*/
const playBtn = document.getElementById('play-btn');
const statusIndicator = document.querySelector('.status-indicator');

let isPlaying = false;

function updateTranscriptionUI() {
    if (!playBtn || !statusIndicator) return;
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    statusIndicator.classList.toggle('active', isPlaying);
}

if (playBtn) {
    playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        updateTranscriptionUI();
    });
    // Initialize
    updateTranscriptionUI();
}

// Upload button placeholder (no functionality by request)
const uploadBtn = document.getElementById('upload-btn');
if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        // Intentionally left as a placeholder for now
        // You could trigger a hidden <input type="file"> here later.
    });
}


/* ---------------------------------
   4) Theme switching
      - background via CSS var (--bg-image)
      - colors via theme tokens
      - font via --font-display
      - persisted in localStorage
----------------------------------*/
const themes = {
    default: { font: "'Fondamento', serif" },
    velvet: { font: "'Fondamento', serif" },
    gold: { font: "'Cinzel Decorative', serif" },
    evergreen: { font: "'Uncial Antiqua', serif" }
};

function applyTheme(key) {
    const t = themes[key] || themes.default;
    rootEl.setAttribute('data-theme', key);
    rootEl.style.setProperty('--font-display', t.font);
    localStorage.setItem('themeKey', key);

    // Mark active theme item in the sidebar
    const items = document.querySelectorAll('.theme-item[data-theme]');
    items.forEach(el => el.classList.toggle('active', el.getAttribute('data-theme') === key));
}

// Click handlers for theme items
document.querySelectorAll('.theme-item[data-theme]').forEach(item => {
    item.addEventListener('click', () => {
        const key = item.getAttribute('data-theme');
        applyTheme(key);
    });
});

// Load saved theme or fallback to default
const savedTheme = localStorage.getItem('themeKey') || 'default';
applyTheme(savedTheme);

// Keep multiple tabs in sync (optional)
window.addEventListener('storage', (e) => {
    if (e.key === 'themeKey' && e.newValue) {
        applyTheme(e.newValue);
    }
});


// Home button: magical glow pulse
if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        homeBtn.classList.remove('magic'); // reset animation if clicked fast
        void homeBtn.offsetWidth;          // force reflow to restart animation
        homeBtn.classList.add('magic');
    });
}


/* ---------------------------------
   5) Light / Dark mode toggle
----------------------------------*/
const modeToggle = document.getElementById('modeToggle');

function applyMode(mode) {
    const light = mode === 'light';
    document.documentElement.classList.toggle('light-mode', light);
    localStorage.setItem('uiMode', light ? 'light' : 'dark');
    if (modeToggle) modeToggle.checked = light;
}

// restore saved mode (default: dark)
applyMode(localStorage.getItem('uiMode') || 'dark');

// click handler
if (modeToggle) {
    modeToggle.addEventListener('change', (e) => {
        applyMode(e.target.checked ? 'light' : 'dark');
    });
}
