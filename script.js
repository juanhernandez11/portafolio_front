const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
let pageInitialized = false;

function showStaticContent() {
    document.querySelectorAll('.reveal-fade, .reveal-scale').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
    document.querySelectorAll('.text-inner').forEach(el => {
        el.style.transform = 'none';
    });
    document.querySelectorAll('.proj-divider, .exp-divider').forEach(el => {
        el.style.transform = 'scaleX(1)';
    });
    document.getElementById('nav-panels')?.style.setProperty('transform', 'none');
    document.querySelectorAll('.counter').forEach(el => {
        el.textContent = `${el.dataset.target || 0}${el.dataset.suffix || ''}`;
    });
}

/* ═══════════════════════════════════════════════
   LENIS — smooth scroll (Zajno usa esto)
═══════════════════════════════════════════════ */
if (!prefersReducedMotion && typeof gsap !== 'undefined' && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
    }
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
}
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/* ═══════════════════════════════════════════════
   PRELOADER — contador 0→100 + barra + split panels
   (Zajno: loader-counter + loader-bar)
═══════════════════════════════════════════════ */
(function () {
    const counter = document.getElementById('loader-counter');
    const bar     = document.getElementById('loader-bar');
    const loader  = document.getElementById('loader');
    const panels  = document.querySelectorAll('.loader-panel');

    if (prefersReducedMotion) {
        loader?.remove();
        document.body.classList.remove('is-loading');
        showStaticContent();
        initNav();
        initScrollingText();
        initFilters();
        return;
    }

    if (!loader) {
        if (typeof ScrollTrigger !== 'undefined') initPage();
        return;
    }

    if (!counter || !bar || typeof gsap === 'undefined') {
        loader.style.display = 'none';
        document.body.classList.remove('is-loading');
        showStaticContent();
        if (typeof ScrollTrigger !== 'undefined') initPage();
        return;
    }

    const tl = gsap.timeline({ onComplete: exitLoader });

    tl.to({ n: 0 }, {
        n: 100, duration: 2,
        ease: 'power2.inOut',
        onUpdate() { counter.textContent = Math.round(this.targets()[0].n); }
    }, 0);

    tl.to(bar, { width: '100%', duration: 2, ease: 'power2.inOut' }, 0);

    function exitLoader() {
        gsap.to(panels, {
            scaleY: 0,
            transformOrigin: 'top',
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.inOut',
            onComplete() {
                loader.style.display = 'none';
                document.body.classList.remove('is-loading');
                initPage();
            }
        });
        gsap.to([counter, bar], { opacity: 0, duration: 0.3 });
    }
})();

/* ═══════════════════════════════════════════════
   INIT PAGE — todo lo que corre después del loader
═══════════════════════════════════════════════ */
function initPage() {
    if (pageInitialized) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        showStaticContent();
        return;
    }
    pageInitialized = true;

    initNav();
    initHero();
    initScrollingText();
    initSplitTitles();
    initScrollReveals();
    initCounters();
    initProjectDividers();
    initExpDividers();
    initContactRows();
    initFilters();
}

/* ═══════════════════════════════════════════════
   NAV — panel baja desde translateY(-200%)
   (Zajno: nav-panels con transform inicial)
═══════════════════════════════════════════════ */
function initNav() {
    const navPanels = document.getElementById('nav-panels');
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-menu');
    const label = document.getElementById('toggle-label');
    const links = document.querySelectorAll('.nav-menu-link');
    let previousFocus = null;

    if (!navPanels) return;
    menu?.setAttribute('aria-hidden', 'true');
    if (menu) menu.inert = true;

    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        gsap.to(navPanels, {
            y: 0, duration: 1,
            ease: 'power3.out', delay: 0.1
        });
    } else {
        navPanels.style.transform = 'none';
    }

    if (!toggle || !menu || !label) return;

    let open = false;

    function openMenu() {
        open = true;
        previousFocus = document.activeElement;
        menu.classList.add('is-open');
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Cerrar menú');
        label.textContent = 'close';
        document.body.style.overflow = 'hidden';
        menu.setAttribute('aria-hidden', 'false');
        menu.inert = false;
        links[0]?.focus();

        gsap.fromTo(links,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.2 }
        );
    }

    function closeMenu() {
        open = false;
        menu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        label.textContent = 'menú';
        document.body.style.overflow = '';
        menu.setAttribute('aria-hidden', 'true');
        menu.inert = true;
        previousFocus?.focus();
        previousFocus = null;
    }

    toggle.addEventListener('click', () => open ? closeMenu() : openMenu());
    links.forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            start: 'top -60',
            onUpdate(self) {
                navPanels.classList.toggle('is-solid', self.scroll() > 60);
            }
        });
    }
}

/* ═══════════════════════════════════════════════
   HERO — masking reveal (Zajno: text-mask / text-inner)
═══════════════════════════════════════════════ */
function initHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.fromTo('.hero-tag', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 0.05);

    const titleLines = document.querySelectorAll('.hero-h1 .text-inner');
    if (titleLines.length) {
        tl.fromTo(titleLines,
            { yPercent: 110 },
            { yPercent: 0, duration: 1.1, stagger: 0.1 },
            0.1
        );
    }

    const desc = document.querySelector('.hero-desc .text-inner');
    if (desc) {
        tl.fromTo(desc,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.9 },
            0.45
        );
    }

    const actions = document.querySelector('.hero-actions .text-inner');
    if (actions) {
        tl.fromTo(actions,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.8 },
            0.55
        );
    }

    const photoCol = document.querySelector('.hero-photo-col');
    if (photoCol) {
        tl.fromTo(photoCol,
            { opacity: 0, scale: 0.95, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2 },
            0.1
        );
    }

    const stats = document.querySelector('.hero-stats');
    if (stats) {
        tl.fromTo(stats,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.7 },
            0.7
        );
    }
}

/* ═══════════════════════════════════════════════
   SCROLLING TEXT — duplicar para loop continuo
═══════════════════════════════════════════════ */
function initScrollingText() {
    const t = document.getElementById('scrolling-track');
    if (!t) return;
    if (t.dataset.duplicated === 'true') return;
    // Duplicar el contenido para el loop infinito sin salto
    const clone = t.innerHTML;
    t.innerHTML = clone + clone;
    t.dataset.duplicated = 'true';
}

/* ═══════════════════════════════════════════════
   SPLIT TITLES — word-by-word reveal (Zajno)
═══════════════════════════════════════════════ */
function initSplitTitles() {
    document.querySelectorAll('.reveal-lines').forEach(el => {
        const text = el.textContent.trim();
        if (!text) return;

        const words = text.split(/\s+/);
        if (words.length === 0) return;

        const hasAlreadyWrapped = el.querySelector('.word');
        if (!hasAlreadyWrapped) {
            el.innerHTML = words.map(w =>
                `<span class="word"><span class="word-inner">${w}</span></span>`
            ).join(' ');
        }

        ScrollTrigger.create({
            trigger: el, start: 'top 88%', once: true,
            onEnter() {
                gsap.fromTo(el.querySelectorAll('.word-inner'),
                    { yPercent: 110 },
                    { yPercent: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out' }
                );
            }
        });
    });
}

/* ═══════════════════════════════════════════════
   SCROLL REVEALS
═══════════════════════════════════════════════ */
function initScrollReveals() {
    // Fade + translateY
    gsap.utils.toArray('.reveal-fade').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
        );
    });

    // Scale (imagen about)
    gsap.utils.toArray('.reveal-scale').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, scale: 0.93, y: 24 },
            { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
        );
    });

    // Experiencia: contenido stagger
    gsap.utils.toArray('.exp-item').forEach(item => {
        const els = item.querySelectorAll('h3, .exp-company, li, .exp-logro, .exp-date, .exp-badge');
        gsap.fromTo(els,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out',
              scrollTrigger: { trigger: item, start: 'top 85%', once: true } }
        );
    });
}

/* ═══════════════════════════════════════════════
   DIVIDERS — scaleX 0→1 (Zajno: líneas que se dibujan)
═══════════════════════════════════════════════ */
function initProjectDividers() {
    document.querySelectorAll('.proj-item:not(.proj-item--last) .proj-divider').forEach(div => {
        gsap.fromTo(div,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, ease: 'power3.out',
              scrollTrigger: { trigger: div, start: 'top 90%', once: true } }
        );
    });
}

function initExpDividers() {
    document.querySelectorAll('.exp-item:not(.exp-item--last) .exp-divider').forEach(div => {
        gsap.fromTo(div,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: div, start: 'top 90%', once: true } }
        );
    });
}

/* ═══════════════════════════════════════════════
   CONTACT ROWS — stagger fade
═══════════════════════════════════════════════ */
function initContactRows() {
    gsap.utils.toArray('.contact-row').forEach((row, i) => {
        gsap.fromTo(row,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: i * 0.06,
              scrollTrigger: { trigger: row, start: 'top 90%', once: true } }
        );
    });
}

/* ═══════════════════════════════════════════════
   COUNTERS
═══════════════════════════════════════════════ */
function initCounters() {
    document.querySelectorAll('.counter').forEach(el => {
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter() {
                gsap.to({ n: 0 }, {
                    n: target, duration: 1.6, ease: 'power2.out',
                    onUpdate() { el.textContent = Math.round(this.targets()[0].n) + suffix; }
                });
            }
        });
    });
}

/* ═══════════════════════════════════════════════
   PROJECT FILTERS
═══════════════════════════════════════════════ */
function initFilters() {
    const btns = document.querySelectorAll('.f-btn');
    const rows = document.querySelectorAll('.proj-item:not(.proj-item--last)');

    if (!btns.length || !rows.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            btns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
            const filter = btn.dataset.filter;
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                gsap.killTweensOf(rows);
            }

            rows.forEach((row, i) => {
                const show = filter === 'all' || row.dataset.category === filter;
                if (show) {
                    row.style.display = '';
                    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                        gsap.fromTo(row,
                            { opacity: 0, x: -12 },
                            { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', delay: i * 0.025 }
                        );
                    } else {
                        row.style.opacity = '1';
                        row.style.transform = 'none';
                    }
                } else {
                    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                        gsap.to(row, {
                            opacity: 0, x: -8, duration: 0.25, ease: 'power2.in',
                            onComplete() { row.style.display = 'none'; }
                        });
                    } else {
                        row.style.opacity = '0';
                        row.style.display = 'none';
                    }
                }
            });
        });
    });
}

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL para links internos
═══════════════════════════════════════════════ */
document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    const target = document.querySelector(href);
    if (target && lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    } else if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

/* ═══════════════════════════════════════════════
   NAV solid class CSS
═══════════════════════════════════════════════ */
const navStyle = document.createElement('style');
navStyle.textContent = `
  #nav-panels.is-solid .nav-panel {
    box-shadow: 0 1px 0 rgba(12,11,11,0.08);
  }
`;
document.head.appendChild(navStyle);

const currentYear = document.getElementById('current-year');
if (currentYear) currentYear.textContent = new Date().getFullYear();
