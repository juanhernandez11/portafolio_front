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
        initCaseStudies();
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
    if (typeof gsap === 'undefined') {
        showStaticContent();
        return;
    }
    pageInitialized = true;

    initNav();
    initHero();
    initScrollingText();

    // Funciones que dependen de ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
        initSplitTitles();
        initScrollReveals();
        initCounters();
        initProjectDividers();
        initExpDividers();
        initContactRows();
    } else {
        // ScrollTrigger no disponible: mostrar contenido estático
        showStaticContent();
    }

    initFilters();
    initCaseStudies();
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

        if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
            gsap.fromTo(links,
                { yPercent: 110 },
                { yPercent: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.2 }
            );
        }
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
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        if (!Number.isFinite(target)) return;

        ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true,
            onEnter() {
                const state = { n: 0 };
                gsap.to(state, {
                    n: target, duration: 1.6, ease: 'power2.out',
                    onUpdate() { el.textContent = Math.round(state.n) + suffix; },
                    onComplete() { el.textContent = target + suffix; }
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

            // Guard: solo llamar gsap si está disponible
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
if (!document.getElementById('nav-solid-style')) {
    const navStyle = document.createElement('style');
    navStyle.id = 'nav-solid-style';
    navStyle.textContent = `
  #nav-panels.is-solid .nav-panel {
    box-shadow: 0 1px 0 rgba(12,11,11,0.08);
  }
  [data-theme="dark"] #nav-panels.is-solid .nav-panel {
    box-shadow: 0 1px 0 rgba(240,236,230,0.06);
  }
`;
    document.head.appendChild(navStyle);
}

/* ═══════════════════════════════════════════════
   DARK MODE — toggle día/noche
═══════════════════════════════════════════════ */
function initTheme() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    // Leer preferencia guardada o del sistema
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');

    applyTheme(initial, false);

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark', true);
    });
}

function applyTheme(theme, animate) {
    const btn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    if (animate && !prefersReducedMotion) {
        // Pequeño flash de escala en el botón como feedback
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(btn,
                { scale: 0.8 },
                { scale: 1, duration: 0.35, ease: 'back.out(1.5)' }
            );
        }
    }

    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Actualizar aria-label del botón
    btn.setAttribute('aria-label',
        theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
    );

    // Actualizar SVG fill del ring en el hero para que cambie con el tema
    const ringGradientStops = document.querySelectorAll('#hero-ring-gradient stop');
    const ringBall = document.querySelector('.hero-ring-ball');
    const ringTrack = document.querySelector('.hero-ring-track');
    if (theme === 'dark') {
        ringGradientStops.forEach(s => s.setAttribute('stop-color', '#f0ece6'));
        if (ringBall) ringBall.setAttribute('fill', '#f0ece6');
        if (ringTrack) ringTrack.setAttribute('stroke', 'rgba(240,236,230,0.12)');
    } else {
        ringGradientStops.forEach(s => s.setAttribute('stop-color', '#0c0b0b'));
        if (ringBall) ringBall.setAttribute('fill', '#0c0b0b');
        if (ringTrack) ringTrack.setAttribute('stroke', 'rgba(12,11,11,0.12)');
    }
}

// Inicializar tema antes del loader para evitar flash
(function () {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

initTheme();

const currentYear = document.getElementById('current-year');
if (currentYear) currentYear.textContent = new Date().getFullYear();


/* ═══════════════════════════════════════════════
   CASE STUDIES — datos de proyectos
═══════════════════════════════════════════════ */
const projectData = {
  'estudio-genius': {
    num: '02',
    title: 'Estudio Genius',
    context: 'Plataforma académica para gestión de tareas, autenticación de usuarios y asistente de estudio. Diseñada para uso real con usuarios activos. Diciembre 2025 — Febrero 2026.',
    built: 'Aplicación web con autenticación, gestión de tareas, asistente de estudio y arquitectura cliente-first para minimizar latencia.',
    stack: ['React', 'TypeScript', 'Firebase', 'Groq API', 'Netlify'],
    work: [
      'Arquitectura de componentes React con TypeScript',
      'Integración de Firebase Auth y Firestore',
      'Diseño e implementación de la interfaz completa',
      'Optimización de rendimiento client-side'
    ],
    result: 'Plataforma en producción con usuarios activos.',
    url: 'https://estudiogenius.netlify.app/',
    github: null
  },
  'canal-etico': {
    num: '01',
    title: 'Canal Ético de Denuncias — ARH',
    context: 'ARH Consultores necesitaba un sistema para recibir y gestionar denuncias de forma confidencial y estructurada. No existía ningún sistema previo en la empresa. Febrero 2026 — Actualidad.',
    built: 'Sistema Full Stack con flujo de 6 etapas para denuncias, generación de folios únicos, panel de administración, ciclo completo de estados y notificaciones automáticas por correo.',
    stack: ['Next.js', 'Supabase', 'NodeMailer', 'Netlify'],
    work: [
      'Diseño de arquitectura completa del sistema',
      'Desarrollo del frontend con Next.js',
      'Integración de base de datos con Supabase',
      'Sistema de notificaciones con NodeMailer',
      'Panel de administración para gestión de casos',
      'Flujo de 6 etapas con ciclo de estados'
    ],
    result: 'Primer sistema de este tipo en la empresa. Actualmente en producción para ARH Consultores.',
    url: 'https://denunciasarhconsultores.netlify.app/',
    github: null
  },
  'sistema-inventario': {
    num: '04',
    title: 'Sistema de Inventario — Salud Pública',
    context: 'La Jurisdicción Sanitaria Núm. 10 gestionaba su inventario completamente en Excel. Proyecto desarrollado durante mi experiencia como Pasante de Informática. Mayo 2024 — Agosto 2024.',
    built: 'Sistema web de control de inventarios con arquitectura MVC, reportes automatizados y sustitución completa del flujo en Excel.',
    stack: ['PHP', 'MySQL', 'MVC'],
    work: [
      'Análisis de requerimientos con el área administrativa',
      'Diseño e implementación de base de datos MySQL',
      'Desarrollo del sistema con arquitectura MVC en PHP',
      'Automatización de reportes administrativos'
    ],
    result: 'Redujo tiempos de gestión un 20% en el primer mes. Eliminó aproximadamente 3 horas de trabajo manual semanal.',
    url: null,
    github: 'https://github.com/juanhernandez11/inventario.mvc'
  },
  'taller-mecanico': {
    num: '03',
    title: 'Taller Mecánico — App Operativa',
    context: 'Taller mecánico local necesitaba gestionar órdenes de trabajo, inventario y clientes sin presupuesto para infraestructura de servidor.',
    built: 'Aplicación operativa No-Code con AppSheet y Google Sheets como backend. Gestión completa de órdenes, inventario y clientes.',
    stack: ['AppSheet', 'Google Sheets', 'No-Code'],
    work: [
      'Diseño de la estructura de datos en Google Sheets',
      'Configuración y personalización en AppSheet',
      'Implementación de flujos de trabajo y vistas',
      'Capacitación al equipo del taller'
    ],
    result: 'En producción con costo de infraestructura cero para el negocio.',
    url: 'https://www.appsheet.com/start/b8a666c2-a540-42f0-9aa0-5af268b55232',
    github: null
  }
};

/* ═══════════════════════════════════════════════
   CASE STUDIES — modal slide-in
═══════════════════════════════════════════════ */
function initCaseStudies() {
  const overlay  = document.getElementById('cs-overlay');
  const body     = document.getElementById('cs-body');
  const numEl    = document.getElementById('cs-num');
  const titleEl  = document.getElementById('cs-title');
  const closeBtn = document.getElementById('cs-close');

  if (!overlay || !body) return;

  let previousFocus = null;

  function openCS(projectKey) {
    const data = projectData[projectKey];
    if (!data) return;

    // Inyectar contenido
    numEl.textContent   = data.num;
    titleEl.textContent = data.title;

    let html = '';

    if (data.context) {
      html += `<div>
        <span class="cs-section-label">Contexto</span>
        <p class="cs-section-text">${data.context}</p>
      </div>`;
    }

    if (data.built) {
      html += `<div>
        <span class="cs-section-label">Qué construí</span>
        <p class="cs-section-text">${data.built}</p>
      </div>`;
    }

    if (data.work && data.work.length) {
      html += `<div>
        <span class="cs-section-label">Mi trabajo</span>
        <ul class="cs-list">${data.work.map(w => `<li>${w}</li>`).join('')}</ul>
      </div>`;
    }

    if (data.stack && data.stack.length) {
      html += `<div>
        <span class="cs-section-label">Stack</span>
        <div class="cs-tags">${data.stack.map(s => `<span>${s}</span>`).join('')}</div>
      </div>`;
    }

    if (data.result) {
      html += `<div class="cs-result">
        <strong>Resultado</strong>
        <p>${data.result}</p>
      </div>`;
    }

    const links = [];
    if (data.url)    links.push(`<a href="${data.url}"    target="_blank" rel="noopener noreferrer">Ver proyecto ↗</a>`);
    if (data.github) links.push(`<a href="${data.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`);
    if (links.length) {
      html += `<div class="cs-link-row">${links.join('')}</div>`;
    }

    body.innerHTML = html;

    // Abrir overlay
    previousFocus = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.inert = false;
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    closeBtn?.focus();

    // Scroll dentro del panel: interceptar wheel para bypassear Lenis
    body.scrollTop = 0;

    // Animar contenido si GSAP disponible
    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
      const sections = body.querySelectorAll('div, .cs-result');
      gsap.fromTo(sections,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.3 }
      );
    }
  }

  function closeCS() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    previousFocus?.focus();
    previousFocus = null;
    setTimeout(() => { body.innerHTML = ''; }, 600);
  }

  // Abrir con click en cualquier botón .proj-cs-btn
  document.addEventListener('click', e => {
    const btn = e.target.closest('.proj-cs-btn');
    if (btn) {
      const key = btn.dataset.project;
      if (key) openCS(key);
    }
  });

  // Cerrar con botón close
  closeBtn?.addEventListener('click', closeCS);

  // Cerrar con click en el backdrop (fuera del panel)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeCS();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeCS();
  });

  // Focus trap
  overlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab' || !overlay.classList.contains('is-open')) return;
    const focusable = overlay.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
    }
  });

  // Bypassear Lenis: el panel hace scroll nativo con wheel y touch
  const panel = overlay.querySelector('.cs-panel');

  panel.addEventListener('wheel', e => {
    e.stopPropagation();
    body.scrollTop += e.deltaY;
  }, { passive: true });

  // Touch scroll nativo en móvil
  let touchStartY = 0;
  panel.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  panel.addEventListener('touchmove', e => {
    e.stopPropagation();
    const delta = touchStartY - e.touches[0].clientY;
    body.scrollTop += delta;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
}
