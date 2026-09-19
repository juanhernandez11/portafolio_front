/* ═══════════════════════════════════════════════
   LENIS — smooth scroll (Zajno usa esto)
═══════════════════════════════════════════════ */
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ═══════════════════════════════════════════════
   PRELOADER — contador 0→100 + barra + split panels
   (Zajno: loader-counter + loader-bar)
═══════════════════════════════════════════════ */
(function () {
    const counter = document.getElementById('loader-counter');
    const bar     = document.getElementById('loader-bar');
    const loader  = document.getElementById('loader');
    const panels  = document.querySelectorAll('.loader-panel');
    if (!loader) return;

    const tl = gsap.timeline({
        onComplete: exitLoader
    });

    // Contador 0 → 100
    tl.to({ n: 0 }, {
        n: 100, duration: 2,
        ease: 'power2.inOut',
        onUpdate() { counter.textContent = Math.round(this.targets()[0].n); }
    }, 0);

    // Barra de progreso
    tl.to(bar, { width: '100%', duration: 2, ease: 'power2.inOut' }, 0);

    function exitLoader() {
        // Paneles se abren hacia arriba (Zajno split)
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
        // Fade out counter
        gsap.to([counter, bar], { opacity: 0, duration: 0.3 });
    }
})();

/* ═══════════════════════════════════════════════
   INIT PAGE — todo lo que corre después del loader
═══════════════════════════════════════════════ */
function initPage() {
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
    // Nav entra desde arriba
    gsap.to('#nav-panels', {
        y: 0, duration: 1,
        ease: 'power3.out', delay: 0.1
    });

    // Toggle menú
    const toggle = document.getElementById('nav-toggle');
    const menu   = document.getElementById('nav-menu');
    const label  = document.getElementById('toggle-label');
    const links  = document.querySelectorAll('.nav-menu-link');

    let open = false;

    function openMenu() {
        open = true;
        menu.classList.add('is-open');
        toggle.classList.add('is-open');
        label.textContent = 'close';
        document.body.style.overflow = 'hidden';

        // Zajno: cada link del menú entra con stagger
        gsap.fromTo(links,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.2 }
        );
    }

    function closeMenu() {
        open = false;
        menu.classList.remove('is-open');
        toggle.classList.remove('is-open');
        label.textContent = 'menú';
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => open ? closeMenu() : openMenu());
    links.forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

    // Nav solid on scroll
    ScrollTrigger.create({
        start: 'top -60',
        onUpdate(self) {
            document.getElementById('nav-panels')
                ?.classList.toggle('is-solid', self.scroll() > 60);
        }
    });
}

/* ═══════════════════════════════════════════════
   HERO — masking reveal (Zajno: text-mask / text-inner)
═══════════════════════════════════════════════ */
function initHero() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Tag
    tl.fromTo('.hero-tag', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 0.05);

    // Título: cada .text-inner sube desde yPercent 110 (Zajno masking)
    tl.fromTo('.hero-h1 .text-inner',
        { yPercent: 110 },
        { yPercent: 0, duration: 1.1, stagger: 0.1 },
        0.1
    );

    // Desc y acciones
    tl.fromTo('.hero-desc .text-inner',
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9 },
        0.45
    );
    tl.fromTo('.hero-actions .text-inner',
        { yPercent: 110 },
        { yPercent: 0, duration: 0.8 },
        0.55
    );

    // Foto — aparece desde opacity/scale
    tl.fromTo('.hero-photo-col',
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2 },
        0.1
    );

    // Stats
    tl.fromTo('.hero-stats',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.7
    );
}

/* ═══════════════════════════════════════════════
   SCROLLING TEXT — duplicar para loop continuo
═══════════════════════════════════════════════ */
function initScrollingText() {
    const t = document.getElementById('scrolling-track');
    if (!t) return;
    // Duplicar el contenido para el loop infinito sin salto
    const clone = t.innerHTML;
    t.innerHTML = clone + clone;
}

/* ═══════════════════════════════════════════════
   SPLIT TITLES — word-by-word reveal (Zajno)
═══════════════════════════════════════════════ */
function initSplitTitles() {
    document.querySelectorAll('.reveal-lines').forEach(el => {
        const words = el.textContent.trim().split(/\s+/);
        el.innerHTML = words.map(w =>
            `<span class="word"><span class="word-inner">${w}</span></span>`
        ).join(' ');

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
        ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter() {
                gsap.to({ n: 0 }, {
                    n: target, duration: 1.6, ease: 'power2.out',
                    onUpdate() { el.textContent = Math.round(this.targets()[0].n) + '+'; }
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

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            rows.forEach((row, i) => {
                const show = filter === 'all' || row.dataset.category === filter;
                if (show) {
                    row.style.display = 'block';
                    gsap.fromTo(row,
                        { opacity: 0, x: -12 },
                        { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out', delay: i * 0.025 }
                    );
                } else {
                    gsap.to(row, {
                        opacity: 0, x: -8, duration: 0.25, ease: 'power2.in',
                        onComplete() { row.style.display = 'none'; }
                    });
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
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
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
