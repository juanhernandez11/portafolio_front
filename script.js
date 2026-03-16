/* ═══════════════════════════════════════════════
   INTRO CINEMATOGRÁFICA
═══════════════════════════════════════════════ */
(function () {
    const intro  = document.getElementById('netflix-intro');
    const main   = document.getElementById('main');
    const skip   = document.getElementById('skip-btn');
    const nameEl = document.getElementById('intro-name');
    const lineEl = document.getElementById('intro-line');
    const subEl  = document.getElementById('intro-subtitle');
    const canvas = document.getElementById('intro-canvas');
    const ctx    = canvas.getContext('2d');

    let W, H, raf, startTime, done = false;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const BEAM_COUNT = 18;
    const beams = Array.from({ length: BEAM_COUNT }, (_, i) => {
        const side   = i % 2 === 0 ? -1 : 1;
        const angle  = (Math.PI / 2) + side * (0.08 + (Math.floor(i / 2) * 0.13));
        const delay  = 0.3 + Math.floor(i / 2) * 0.12;
        const width  = 1.5 + Math.random() * 3;
        const bright = 0.4 + Math.random() * 0.6;
        return { angle, delay, width, bright };
    });

    const DUST = Array.from({ length: 80 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.5 + Math.random() * 1.5,
        speed: 0.00008 + Math.random() * 0.00015,
        alpha: 0,
    }));

    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const clamp   = (v, a, b) => Math.max(a, Math.min(b, v));
    const prog    = (t, s, e) => clamp((t - s) / (e - s), 0, 1);

    function draw(ts) {
        if (done) return;
        if (!startTime) startTime = ts;
        const t = (ts - startTime) / 1000;

        ctx.clearRect(0, 0, W, H);
        const cx = W / 2, cy = H / 2;

        // Glow central
        const glowP = easeOut(prog(t, 0, 1.2));
        if (glowP > 0) {
            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.55);
            grd.addColorStop(0,   `rgba(180,0,0,${0.18 * glowP})`);
            grd.addColorStop(0.3, `rgba(100,0,0,${0.12 * glowP})`);
            grd.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W, H);
        }

        // Rayos de luz
        beams.forEach(beam => {
            const p = easeOut(prog(t, beam.delay, beam.delay + 1.8));
            if (p <= 0) return;
            const len   = p * Math.max(W, H) * 1.4;
            const x2    = cx + Math.cos(beam.angle) * len;
            const y2    = cy + Math.sin(beam.angle) * len;
            const pulse = 1 + 0.15 * Math.sin(t * 3 + beam.angle);
            const grd   = ctx.createLinearGradient(cx, cy, x2, y2);
            grd.addColorStop(0,   `rgba(229,9,20,${0.9 * beam.bright * p * pulse})`);
            grd.addColorStop(0.3, `rgba(180,0,0,${0.5 * beam.bright * p})`);
            grd.addColorStop(0.7, `rgba(120,0,0,${0.2 * beam.bright * p})`);
            grd.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = grd;
            ctx.lineWidth   = beam.width * (0.5 + p * 0.5);
            ctx.shadowColor = '#e50914';
            ctx.shadowBlur  = 18 * p;
            ctx.globalAlpha = p;
            ctx.stroke();
            ctx.restore();
        });

        // Reflejo suelo
        const floorP = easeOut(prog(t, 2, 3.5));
        if (floorP > 0) {
            const grd = ctx.createRadialGradient(cx, H, 0, cx, H, W * 0.8);
            grd.addColorStop(0,   `rgba(229,9,20,${0.12 * floorP})`);
            grd.addColorStop(0.5, `rgba(100,0,0,${0.06 * floorP})`);
            grd.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W, H);
        }

        // Partículas
        const dustP = prog(t, 1.5, 3);
        if (dustP > 0) {
            DUST.forEach(d => {
                d.y -= d.speed;
                if (d.y < 0) { d.y = 1; d.x = Math.random(); }
                ctx.beginPath();
                ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,80,80,${Math.min(dustP * 0.5, 0.35)})`;
                ctx.fill();
            });
        }

        // Viñeta
        const vig = ctx.createRadialGradient(cx, cy, H * 0.3, cx, cy, H * 0.9);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.75)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        // Nombre aparece a los 2.2s
        if (t >= 2.2 && !nameEl.classList.contains('show')) {
            nameEl.classList.add('show');
            setTimeout(() => nameEl.classList.add('sweep'), 400);
            setTimeout(() => {
                lineEl.classList.add('show');
                subEl.classList.add('show');
            }, 800);
        }

        if (t >= 7) { endIntro(); return; }
        raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    function endIntro() {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        intro.classList.add('fade-out');
        setTimeout(() => {
            intro.style.display = 'none';
            main.classList.remove('main-hidden');
            main.classList.add('main-visible');
            initCodeCanvas();
            initReveal();
        }, 800);
    }

    skip.addEventListener('click', endIntro);
})();

/* ═══════════════════════════════════════════════
   CANVAS — FONDO DE CÓDIGO ANIMADO
═══════════════════════════════════════════════ */
function initCodeCanvas() {
    const canvas = document.getElementById('code-canvas');
    const ctx    = canvas.getContext('2d');

    const snippets = [
        'const app = React.createElement()',
        'function useState(initial) {',
        'import { Component } from "@angular/core"',
        'export default defineComponent({',
        'const router = express.Router()',
        'db.collection("users").find({})',
        'SELECT * FROM inventario WHERE id = ?',
        'git commit -m "feat: add new feature"',
        'npm install && npm run build',
        '@Component({ selector: "app-root" })',
        'const [state, setState] = useState(null)',
        'async function fetchData(url) {',
        'return res.status(200).json({ ok: true })',
        'v-for="item in items" :key="item.id"',
        'interface User { id: number; name: string }',
        'mongoose.connect(process.env.MONGO_URI)',
        'app.use(cors()); app.use(express.json())',
        'useEffect(() => { fetchData() }, [])',
        'const emit = defineEmits(["update"])',
        'public class Vehiculo { private String placa;',
        'System.out.println("Bienvenido al sistema");',
        '$pdo = new PDO($dsn, $user, $pass)',
        'display: grid; grid-template-columns: repeat(3,1fr)',
        'border-radius: 8px; transition: all .3s',
    ];

    let cols = [];
    const fontSize = 13;
    const lineHeight = 22;

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const numCols = Math.max(1, Math.floor(canvas.width / 320));
        cols = Array.from({ length: numCols }, (_, i) => ({
            x: i * (canvas.width / numCols) + 10,
            y: Math.random() * -canvas.height,
            speed: 0.4 + Math.random() * 0.5,
            lines: Array.from({ length: 18 }, () =>
                snippets[Math.floor(Math.random() * snippets.length)]
            ),
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px 'Courier New', monospace`;

        cols.forEach(col => {
            col.lines.forEach((line, i) => {
                const y = col.y + i * lineHeight;
                if (y < -lineHeight || y > canvas.height + lineHeight) return;
                const relY  = y / canvas.height;
                const alpha = relY < 0.15 ? relY / 0.15 : relY > 0.85 ? (1 - relY) / 0.15 : 1;
                const hue   = 140 + Math.sin(i * 0.5) * 40;
                ctx.fillStyle = `hsla(${hue},70%,55%,${alpha * 0.7})`;
                ctx.fillText(line, col.x, y);
            });
            col.y += col.speed;
            if (col.y > canvas.height * 0.6) {
                col.y = -lineHeight * col.lines.length * 0.5;
                col.lines = col.lines.map(() =>
                    snippets[Math.floor(Math.random() * snippets.length)]
                );
            }
        });

        requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
}

/* ═══════════════════════════════════════════════
   PARALLAX + NAVBAR SCROLL
═══════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
    const heroContent = document.getElementById('hero-content');
    const canvas      = document.getElementById('code-canvas');
    const navbar      = document.getElementById('navbar');

    if (heroContent) {
        const scrollY = window.scrollY;
        heroContent.style.transform = `translateY(${scrollY * 0.35}px)`;
        heroContent.style.opacity   = Math.max(0, 1 - scrollY / 500);
        if (canvas) canvas.style.transform = `translateY(${scrollY * 0.15}px)`;
    }

    if (navbar) navbar.classList.toggle('solid', window.scrollY > 80);
});

/* ═══════════════════════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════════════════════ */
function initReveal() {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const siblings = [...e.target.parentElement.children];
            const idx = siblings.indexOf(e.target);
            e.target.style.transitionDelay = `${idx * 80}ms`;
            e.target.classList.add('visible');
            io.unobserve(e.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════════
   MENÚ HAMBURGER FLOTANTE
═══════════════════════════════════════════════ */
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const floatMenu = document.getElementById('float-menu');
    const backdrop  = document.getElementById('float-backdrop');
    const closeBtn  = document.getElementById('float-close');
    const links     = document.querySelectorAll('.float-link');

    if (!hamburger || !floatMenu) return;

    function openMenu() {
        floatMenu.classList.add('open');
        backdrop.classList.add('open');
        hamburger.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        floatMenu.classList.remove('open');
        backdrop.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', () =>
        floatMenu.classList.contains('open') ? closeMenu() : openMenu()
    );
    closeBtn.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);
    links.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ═══════════════════════════════════════════════
   FILTROS DE PROYECTOS
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    initHamburger();

    const btns  = document.querySelectorAll('.f-btn');
    const cards = document.querySelectorAll('.proj-card');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            cards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                if (match) {
                    card.style.display = 'block';
                    requestAnimationFrame(() => {
                        card.style.opacity   = '1';
                        card.style.transform = 'translateY(0)';
                    });
                } else {
                    card.style.opacity   = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => { card.style.display = 'none'; }, 280);
                }
            });
        });
    });
});

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════════ */
document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
