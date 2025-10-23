/* ============================
   DungeonScribe — script.js
   ============================ */

/* 1) Cursor lighting (no parallax) */
const rootEl = document.documentElement;
rootEl.style.setProperty('--mx', '50vw');
rootEl.style.setProperty('--my', '50vh');
function setLightPos(x, y) {
    rootEl.style.setProperty('--mx', `${x}px`);
    rootEl.style.setProperty('--my', `${y}px`);
}
window.addEventListener('mousemove', e => setLightPos(e.clientX, e.clientY), { passive: true });
window.addEventListener('touchmove', e => {
    if (!e.touches?.length) return;
    const t = e.touches[0];
    setLightPos(t.clientX, t.clientY);
}, { passive: true });

/* 2) Sidebar + Home button syncing */
const menuBtn = document.getElementById('menu-btn');
const homeBtn = document.getElementById('home-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open', sidebar.classList.contains('open'));
    });
    document.addEventListener('click', e => {
        const outside = !sidebar.contains(e.target) && !menuBtn.contains(e.target) && !(homeBtn && homeBtn.contains(e.target));
        if (sidebar.classList.contains('open') && outside) {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
        }
    });
}

if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        homeBtn.classList.remove('magic');
        void homeBtn.offsetWidth;
        homeBtn.classList.add('magic');
    });
}

/* 3) Transcription panel UI */
const playBtn = document.getElementById('play-btn');
const statusIndicator = document.querySelector('.status-indicator');
let isPlaying = false;
function updateTranscriptionUI() {
    if (!playBtn || !statusIndicator) return;
    playBtn.textContent = isPlaying ? '⏸' : '▶';
    statusIndicator.classList.toggle('active', isPlaying);
}
if (playBtn) {
    playBtn.addEventListener('click', () => { isPlaying = !isPlaying; updateTranscriptionUI(); });
    updateTranscriptionUI();
}
const uploadBtn = document.getElementById('upload-btn');
if (uploadBtn) uploadBtn.addEventListener('click', () => { });

/* 4) Theme switching */
const themes = {
    default: { font: "'Fondamento', serif" },
    velvet: { font: "'Cormorant Garamond', serif" },
    gold: { font: "'Cinzel Decorative', serif" },
    evergreen: { font: "'Uncial Antiqua', serif" }
};
function applyTheme(key) {
    const t = themes[key] || themes.default;
    rootEl.setAttribute('data-theme', key);
    rootEl.style.setProperty('--font-display', t.font);
    localStorage.setItem('themeKey', key);
    document.querySelectorAll('.theme-item[data-theme]').forEach(el =>
        el.classList.toggle('active', el.getAttribute('data-theme') === key)
    );
}
document.querySelectorAll('.theme-item[data-theme]').forEach(item => {
    item.addEventListener('click', () => applyTheme(item.getAttribute('data-theme')));
});
applyTheme(localStorage.getItem('themeKey') || 'default');
window.addEventListener('storage', e => {
    if (e.key === 'themeKey' && e.newValue) applyTheme(e.newValue);
});

/* 5) Light / Dark mode toggle */
const modeToggle = document.getElementById('modeToggle');
function applyMode(mode) {
    const light = mode === 'light';
    document.documentElement.classList.toggle('light-mode', light);
    localStorage.setItem('uiMode', light ? 'light' : 'dark');
    if (modeToggle) modeToggle.checked = light;
}
applyMode(localStorage.getItem('uiMode') || 'dark');
if (modeToggle) {
    modeToggle.addEventListener('change', e => applyMode(e.target.checked ? 'light' : 'dark'));
}

/* 6) Page transition: fade to campaigns */
(function () {
    document.body.classList.add('page-enter');
    const links = document.querySelectorAll('a[data-transition="fade"]');
    if (!links.length) return;
    links.forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (!href) return;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            if (document.startViewTransition) {
                e.preventDefault();
                document.startViewTransition(() => { location.href = href; });
                return;
            }

            e.preventDefault();
            const fader = document.createElement('div');
            fader.className = 'page-fader';
            document.body.appendChild(fader);
            requestAnimationFrame(() => {
                document.body.classList.add('leaving');
                fader.addEventListener('transitionend', () => { location.href = href; }, { once: true });
            });
        });
    });
})();

/* 7) In-page smooth scroll — native, delegated (index only) */
(function () {
    if (!document.body.classList.contains('page-index')) return;
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;

        // IMPORTANT: let the index-nav's own handler take over
        if (a.closest('#indexNav')) return;

        const hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', hash);
    }, { capture: true });
})();

/* 8) Index page: sideways nav + instant click + rAF scrollspy + fullness meter (text-only highlight) */
; (function () {
    if (!document.body.classList.contains('page-index')) return;

    const nav = document.getElementById('indexNav');
    if (!nav) return;

    // Keep visible; remove if you later reintroduce reveal-on-scroll
    nav.classList.add('show');
    nav.style.opacity = '1';
    nav.style.removeProperty('transform'); // let CSS apply translateY(-50%)
    nav.style.transform = 'translateY(-50%)';

    const links = Array.from(nav.querySelectorAll('a[data-sec]'));
    const sections = ['top', 'overview', 'howto', 'about']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    const idToLink = new Map(links.map(a => [a.dataset.sec, a]));

    function setActiveText(id) {
        links.forEach(a => a.classList.toggle('active-text', a.dataset.sec === id));
    }

    // --- Clicks: smooth scroll; optional instant text-only hint ---
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.dataset.sec;
            const target = document.getElementById(id);
            if (!id || !target) return;

            e.preventDefault();
            // optional immediate feedback (text-only)
            setActiveText(id);

            const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            target.scrollIntoView({ behavior: prefersReduce ? 'auto' : 'smooth', block: 'start' });
            history.pushState(null, '', `#${id}`);
        });
    });

    // --- rAF scrollspy: closest section center wins (text-only) ---
    const BIAS = 0.50; // 0=top, 1=bottom
    let lastActive = null;
    let lastY = -1, lastH = -1;

    function pickActiveByCenter() {
        const aim = window.innerHeight * BIAS;
        let bestId = null, bestDist = Infinity;
        for (const s of sections) {
            const r = s.getBoundingClientRect();
            const center = r.top + r.height / 2;
            const dist = Math.abs(center - aim);
            if (dist < bestDist) { bestDist = dist; bestId = s.id; }
        }
        if (bestId && bestId !== lastActive) {
            setActiveText(bestId);
            lastActive = bestId;
        }
    }

    // --- Fullness meter (0..1) -> CSS var on nav ---
    function updateProgress() {
        const doc = document.documentElement;
        const body = document.body;
        const scrollY = doc.scrollTop || window.pageYOffset || body.scrollTop || 0;
        const max = Math.max(doc.scrollHeight, body.scrollHeight) - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
        nav.style.setProperty('--scrollP', p.toFixed(4));
    }

    // Always-on watcher, but only recompute when values change
    function watch() {
        const y = window.pageYOffset
            || document.documentElement.scrollTop
            || document.body.scrollTop
            || 0;
        const h = window.innerHeight;

        if (y !== lastY || h !== lastH) {
            pickActiveByCenter();
            updateProgress();
            lastY = y; lastH = h;
        }
        requestAnimationFrame(watch);
    }

    window.addEventListener('hashchange', () => { lastY = -1; }, { passive: true });
    window.addEventListener('resize', () => { lastH = -1; }, { passive: true });

    // Kick off
    pickActiveByCenter();
    updateProgress();
    requestAnimationFrame(watch);
})();
