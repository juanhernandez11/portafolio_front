/* ═══════════════════════════════════════════════
   INTRO CINEMATOGRÁFICA
═══════════════════════════════════════════════ */
(function () {
    const intro  = document.getElementById('netflix-intro');
    const main   = document.getElementById('main');
    const skip   = document.getElementById('skip-btn');
    const canvas = document.getElementById('intro-canvas');
    const ctx    = canvas && canvas.getContext ? canvas.getContext('2d') : null;

    if (!canvas || !ctx) return;

    let W, H, raf, startTime, done = false;
    let nameAlpha = 0;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Fondo de partículas suaves
    const PARTICLE_COUNT = 60;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003,
        r: 0.8 + Math.random() * 1.2,
    }));

    const CODE_LINES = [
        'const dev = new Developer("Juan Moreno");',
        'import React, { useState } from "react";',
        'const [projects, setProjects] = useState([]);',
        'app.get("/api/portfolio", (req, res) => {',
        '  return res.json({ status: "available" });',
        '});',
        'git commit -m "feat: building the future"',
        'npm run build -- --mode production',
    ];

    let typed = [];
    let lineIdx = 0;
    let charIdx = 0;
    let cursorVisible = true;
    let cursorFrame = 0;
    let lastTypeTime = 0;
    let codeDone = false;
    let codeFinishTime = null;
    const TYPE_SPEED = 42;
    const FONT_SIZE = 13;
    const LINE_HEIGHT = 22;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function roundRect(ctx, x, y, width, height, radius) {
        if (typeof radius === 'number') {
            radius = [radius, radius, radius, radius];
        } else if (Array.isArray(radius) && radius.length === 4) {
            radius = radius.slice();
        } else {
            radius = [0, 0, 0, 0];
        }

        const [tl, tr, br, bl] = radius;
        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + width - tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
        ctx.lineTo(x + width, y + height - br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
        ctx.lineTo(x + bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
        ctx.lineTo(x, y + tl);
        ctx.quadraticCurveTo(x, y, x + tl, y);
        ctx.closePath();
    }

    function drawLaptop(cx, cy) {
        const lw = Math.min(W * 0.58, 560);
        const lh = lw * 0.60;
        const baseH = lw * 0.07;
        const baseW = lw * 1.08;
        const sx = cx - lw / 2;
        // Centrar verticalmente: pantalla + base
        const totalH = lh + baseH;
        const sy = cy - totalH / 2;

        // --- SOMBRA GLOBAL ---
        ctx.save();
        ctx.shadowColor = 'rgba(99,179,237,0.18)';
        ctx.shadowBlur = 40;

        // --- TAPA (pantalla) ---
        // Marco exterior
        roundRect(ctx, sx, sy, lw, lh, 12);
        const lidGrad = ctx.createLinearGradient(sx, sy, sx, sy + lh);
        lidGrad.addColorStop(0, '#2d3748');
        lidGrad.addColorStop(1, '#1a202c');
        ctx.fillStyle = lidGrad;
        ctx.fill();
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bisel interior (borde negro alrededor de pantalla)
        const bezel = lw * 0.03;
        const screenX = sx + bezel;
        const screenY = sy + bezel;
        const sw = lw - bezel * 2;
        const sh = lh - bezel * 2 - 4;

        roundRect(ctx, screenX, screenY, sw, sh, 6);
        ctx.fillStyle = '#0d1117';
        ctx.fill();
        ctx.restore();

        // --- CONTENIDO PANTALLA ---
        ctx.save();
        roundRect(ctx, screenX, screenY, sw, sh, 6);
        ctx.clip();

        // Fondo editor
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(screenX, screenY, sw, sh);

        // Barra título editor (macOS style)
        const titleBarH = 22;
        const titleGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + titleBarH);
        titleGrad.addColorStop(0, '#21262d');
        titleGrad.addColorStop(1, '#161b22');
        ctx.fillStyle = titleGrad;
        ctx.fillRect(screenX, screenY, sw, titleBarH);

        // Botones semáforo
        [['#ff5f57', '#e0443e'], ['#febc2e', '#d4a017'], ['#28c840', '#1aab2e']].forEach(([fill, stroke], i) => {
            ctx.beginPath();
            ctx.arc(screenX + 14 + i * 20, screenY + titleBarH / 2, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });

        // Nombre archivo
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.textAlign = 'center';
        ctx.fillText('portfolio.js', screenX + sw / 2, screenY + titleBarH - 6);
        ctx.textAlign = 'left';

        // Línea separadora
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(screenX, screenY + titleBarH, sw, 1);

        // --- CÓDIGO ---
        ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
        const codeStartY = screenY + titleBarH + FONT_SIZE + 6;
        const codeStartX = screenX + 8;
        const lineNumW = 28;

        typed.forEach((line, i) => {
            const y = codeStartY + i * LINE_HEIGHT;
            if (y > screenY + sh - 4) return;

            // Highlight línea activa
            if (i === lineIdx && !codeDone) {
                ctx.fillStyle = 'rgba(99,179,237,0.06)';
                ctx.fillRect(screenX, y - FONT_SIZE + 2, sw, LINE_HEIGHT);
            }

            // Número de línea
            ctx.fillStyle = 'rgba(99,179,237,0.25)';
            ctx.textAlign = 'right';
            ctx.fillText(String(i + 1), codeStartX + lineNumW - 6, y);
            ctx.textAlign = 'left';

            // Separador líneas
            ctx.fillStyle = 'rgba(255,255,255,0.04)';
            ctx.fillRect(codeStartX + lineNumW, screenY + titleBarH, 1, sh);

            // Tokens con color
            let x = codeStartX + lineNumW + 10;
            tokenize(line).forEach(({ text, type }) => {
                ctx.fillStyle = getColor(type);
                ctx.fillText(text, x, y);
                x += ctx.measureText(text).width;
            });

            // Cursor parpadeante
            if (i === lineIdx && !codeDone) {
                cursorFrame++;
                if (cursorFrame % 28 === 0) cursorVisible = !cursorVisible;
                if (cursorVisible) {
                    ctx.fillStyle = '#63b3ed';
                    ctx.fillRect(x + 1, y - FONT_SIZE + 2, 2, FONT_SIZE);
                }
            }
        });
        ctx.restore();

        // --- BASE / TECLADO ---
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;

        const baseX = cx - baseW / 2;
        const baseY = sy + lh;

        // Superficie base
        roundRect(ctx, baseX, baseY, baseW, baseH, [0, 0, 10, 10]);
        const baseGrad = ctx.createLinearGradient(baseX, baseY, baseX, baseY + baseH);
        baseGrad.addColorStop(0, '#2d3748');
        baseGrad.addColorStop(1, '#1a202c');
        ctx.fillStyle = baseGrad;
        ctx.fill();
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Touchpad
        const tpW = lw * 0.22;
        const tpH = baseH * 0.55;
        roundRect(ctx, cx - tpW / 2, sy + lh + baseH * 0.2, tpW, tpH, 4);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Teclado (filas de teclas)
        const keyRows = 4;
        const keyCols = 12;
        const keyAreaW = lw * 0.82;
        const keyAreaH = baseH * 0.5;
        const keyAreaX = cx - keyAreaW / 2;
        const keyAreaY = sy + lh + baseH * 0.08;
        const kw = keyAreaW / keyCols - 2;
        const kh = keyAreaH / keyRows - 2;
        for (let r = 0; r < keyRows; r++) {
            for (let c = 0; c < keyCols; c++) {
                roundRect(
                    ctx,
                    keyAreaX + c * (kw + 2),
                    keyAreaY + r * (kh + 2),
                    kw, kh, 2
                );
                ctx.fillStyle = 'rgba(255,255,255,0.06)';
                ctx.fill();
            }
        }

        // Bisagra
        roundRect(ctx, cx - lw * 0.18, sy + lh - 2, lw * 0.36, 4, 2);
        ctx.fillStyle = '#4a5568';
        ctx.fill();

        // Cámara notch
        ctx.beginPath();
        ctx.arc(cx, sy + bezel / 2 + 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#4a5568';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, sy + bezel / 2 + 4, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#2d3748';
        ctx.fill();
    }

    function tokenize(line) {
        const tokens = [];
        const regex = /("[^"]*"|'[^']*')|(\b(?:const|let|var|function|import|export|return|new|interface|class|async|await|from|default)\b)|(\b(?:useState|useEffect|React|Component|Developer|app|res|req)\b)|([{}()[\];,.])|([^\s{}()[\];,."']+)/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            if (match[1]) tokens.push({ text: match[1], type: 'string' });
            else if (match[2]) tokens.push({ text: match[2], type: 'keyword' });
            else if (match[3]) tokens.push({ text: match[3], type: 'variable' });
            else if (match[4]) tokens.push({ text: match[4], type: 'punctuation' });
            else if (match[5]) tokens.push({ text: match[5], type: 'text' });
        }
        return tokens.length ? tokens : [{ text: line, type: 'text' }];
    }

    function getColor(type) {
        switch(type) {
            case 'keyword':     return '#63b3ed';
            case 'string':      return '#68d391';
            case 'variable':    return '#fbd38d';
            case 'punctuation': return '#a0aec0';
            default:            return '#e2e8f0';
        }
    }

    function draw(ts) {
        if (done) return;
        if (!startTime) startTime = ts;
        const t = (ts - startTime) / 1000;

        ctx.clearRect(0, 0, W, H);

        // Fondo
        const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) * 0.8);
        bg.addColorStop(0, '#0a0f1a');
        bg.addColorStop(1, '#050508');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Partículas de fondo
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > 1) p.vx *= -1;
            if (p.y < 0 || p.y > 1) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99,179,237,0.15)';
            ctx.fill();
        });

        // Escritura de código
        if (ts - lastTypeTime > TYPE_SPEED && !codeDone) {
            lastTypeTime = ts;
            if (!typed[lineIdx]) typed[lineIdx] = '';
            if (lineIdx < CODE_LINES.length) {
                if (charIdx < CODE_LINES[lineIdx].length) {
                    typed[lineIdx] += CODE_LINES[lineIdx][charIdx];
                    charIdx++;
                } else {
                    lineIdx++;
                    charIdx = 0;
                    if (lineIdx >= CODE_LINES.length) {
                        codeDone = true;
                        codeFinishTime = ts;
                    }
                }
            }
        }

        // Calcular layout: laptop arriba, nombre abajo, todo centrado
        const lw = Math.min(W * 0.58, 560);
        const lh = lw * 0.60;
        const baseH = lw * 0.07;
        const totalLaptopH = lh + baseH;
        const nameBlockH = 90;
        const gap = 28;
        const totalBlock = totalLaptopH + gap + nameBlockH;
        const blockStartY = (H - totalBlock) / 2;
        const laptopCY = blockStartY + totalLaptopH / 2;
        const nameY = blockStartY + totalLaptopH + gap + 44;

        // Laptop
        const laptopAlpha = clamp(t / 0.6, 0, 1);
        ctx.globalAlpha = laptopAlpha;
        drawLaptop(W / 2, laptopCY);
        ctx.globalAlpha = 1;

        // Viñeta
        const vig = ctx.createRadialGradient(W/2, H/2, H * 0.1, W/2, H/2, H * 0.85);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.88)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        // Nombre en canvas
        if (codeDone && codeFinishTime) {
            const elapsed = (ts - codeFinishTime) / 1000;
            if (elapsed >= 1.2) {
                nameAlpha = Math.min(1, (elapsed - 1.2) / 0.9);
            }
        }

        if (nameAlpha > 0) {
            ctx.save();
            ctx.textAlign = 'center';

            // JUAN MORENO
            const nameFontSize = Math.min(W * 0.065, 68);
            ctx.font = `900 ${nameFontSize}px 'Arial Black', Impact, sans-serif`;
            const grad = ctx.createLinearGradient(W/2 - 220, 0, W/2 + 220, 0);
            grad.addColorStop(0, '#63b3ed');
            grad.addColorStop(0.5, '#ffffff');
            grad.addColorStop(1, '#68d391');
            ctx.fillStyle = grad;
            ctx.globalAlpha = nameAlpha;
            ctx.shadowColor = 'rgba(99,179,237,0.5)';
            ctx.shadowBlur = 24;
            ctx.fillText('JUAN  MORENO', W / 2, nameY);

            // Línea decorativa
            const lineW = Math.min(380, W * 0.38) * nameAlpha;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(W/2 - lineW/2, nameY + 12);
            ctx.lineTo(W/2 + lineW/2, nameY + 12);
            const lg = ctx.createLinearGradient(W/2 - lineW/2, 0, W/2 + lineW/2, 0);
            lg.addColorStop(0, 'transparent');
            lg.addColorStop(0.5, '#63b3ed');
            lg.addColorStop(1, 'transparent');
            ctx.strokeStyle = lg;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Subtítulo
            ctx.shadowBlur = 0;
            const subSize = Math.min(W * 0.017, 14);
            ctx.font = `300 ${subSize}px 'Segoe UI', sans-serif`;
            ctx.fillStyle = `rgba(160,174,192,${nameAlpha})`;
            ctx.fillText('DESARROLLADOR DE SOFTWARE', W / 2, nameY + 36);
            ctx.restore();
        }

        // Auto-terminar
        if (codeDone && codeFinishTime) {
            const elapsed = (ts - codeFinishTime) / 1000;
            if (elapsed >= 4.5) { endIntro(); return; }
        }

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
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        card.style.opacity   = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }));
                } else {
                    card.style.opacity   = '0';
                    card.style.transform = 'translateY(16px) scale(0.97)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
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
