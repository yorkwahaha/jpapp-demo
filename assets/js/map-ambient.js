/**
 * MapAmbient — Chapter-aware ambient animation system
 * Adds floating particles, subtle background sway, and rare birds to the map.
 * All animated layers are pointer-events:none and sit below stage nodes (z-index: 5).
 *
 * Usage:
 *   MapAmbient.activate(chapterId);    // call when map becomes visible
 *   MapAmbient.deactivate();           // call when leaving the map
 *
 * To add Chapter 2 / 3 themes, add a new entry to MAP_AMBIENT_THEMES below.
 */

window.MapAmbient = (() => {

    // ── Theme definitions ──────────────────────────────────────────────────
    const MAP_AMBIENT_THEMES = {
        'chapter1_0': { // Only for Chapter 1, Segment 0 (新手村)
            particles: {
                colors: [
                    'rgba(234, 255, 148, 0.95)',  // bright lime yellow
                    'rgba(253, 255, 100, 0.90)',  // warm firefly yellow
                    'rgba(190, 255, 120, 0.85)',  // soft green-yellow
                    'rgba(255, 230, 100, 0.80)',  // amber glow
                ],
                count: 18,
                spawnYLimit: 0.7,             // spawn in upper 70%
                vxRange: 0.45,
                vyBase: -0.25,
                vyRange: -0.45,
            },
            birds: {
                color: 'rgba(30,35,40,0.85)',
                maxOnScreen: 2,
                interval: { min: 100, max: 200 }, 
                firstInterval: { min: 60, max: 100 },
                yBand: { min: 0.12, max: 0.38 },   
                speed: { min: 1.3, max: 1.0 },     
                lineWidth: 3.6,
                baseSize: 8.5,
                sizeRange: 6.0,
            },
            sway: {
                class: 'map-ambient-ch1'
            }
        }
        // Any keys NOT defined here (e.g., chapter2_0, chapter1_1) will have NO ambient effects.
    };

    // ── State ──────────────────────────────────────────────────────────────
    let canvas = null;
    let ctx = null;
    let rafId = null;
    let lastFrame = 0;
    let particles = [];
    let birds = [];
    let birdTimer = 0;
    let birdInterval = 0;
    let theme = null;
    let container = null;
    let active = false;

    // ── FPS cap (ms between draws) ─────────────────────────────────────────
    const FRAME_INTERVAL = 50; // ~20 fps — gentle on mobile

    // ── Particle system ────────────────────────────────────────────────────
    function createParticle(w, h) {
        const cfg = theme.particles;
        return {
            x: Math.random() * w,
            y: Math.random() * (h * cfg.spawnYLimit),
            r: 3.0 + Math.random() * 4.0,
            vx: (Math.random() - 0.5) * cfg.vxRange,
            vy: cfg.vyBase + (Math.random() * cfg.vyRange),
            color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
            alpha: 0,
            life: 0,
            maxLife: 180 + Math.random() * 220,
        };
    }

    function stepParticles(w, h) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life++;
            p.x += p.vx + Math.sin(p.life * 0.04) * 0.18; // subtle horizontal drift
            p.y += p.vy;

            // fade in / out
            const t = p.life / p.maxLife;
            p.alpha = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;

            if (p.life >= p.maxLife || p.y < -20) {
                particles.splice(i, 1);
            }
        }
        // replenish
        if (particles.length < theme.particles.count) {
            particles.push(createParticle(w, h));
        }
    }

    function drawParticles() {
        for (const p of particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            
            // Draw firefly: bright center with radial glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
            gradient.addColorStop(0, '#ffffff');          // White hot center
            gradient.addColorStop(0.2, p.color);          // Core color
            gradient.addColorStop(1, 'rgba(0,0,0,0)');    // Soft fade out
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            // Draw a slightly larger area to encompass the glow spread
            ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ── Bird system ────────────────────────────────────────────────────────
    function spawnBird(w, h) {
        const cfg = theme.birds;
        const fromLeft = Math.random() < 0.5;
        const yBand = cfg.yBand.min + Math.random() * cfg.yBand.max;
        return {
            x: fromLeft ? -40 : w + 40,
            y: h * yBand,
            vx: fromLeft ? (cfg.speed.min + Math.random() * cfg.speed.max) : -(cfg.speed.min + Math.random() * cfg.speed.max),
            vy: (Math.random() - 0.5) * 0.2,
            flap: 0,
            size: cfg.baseSize + Math.random() * cfg.sizeRange,
            alpha: 0,
            life: 0,
            maxLife: Math.round((w + 80) / 0.8),  // enough time to cross
        };
    }

    function updateBirdTimer(w, h) {
        const cfg = theme.birds;
        birdTimer++;
        if (birdTimer >= birdInterval) {
            if (birds.length < cfg.maxOnScreen) {
                birds.push(spawnBird(w, h));
                console.log('MapAmbient: Bird spawned');
            }
            birdInterval = cfg.interval.min + Math.floor(Math.random() * cfg.interval.max);
            birdTimer = 0;
        }
    }

    function stepBirds() {
        for (let i = birds.length - 1; i >= 0; i--) {
            const b = birds[i];
            b.life++;
            b.x += b.vx;
            b.y += b.vy;
            b.flap += 0.18;

            const t = b.life / b.maxLife;
            b.alpha = t < 0.08 ? t / 0.08 : t > 0.88 ? (1 - t) / 0.12 : 1;

            if (b.life >= b.maxLife) birds.splice(i, 1);
        }
    }

    function drawBird(b) {
        const cfg = theme.birds;
        if (!cfg || !cfg.color) return;
        // Simple two-wing glyph drawn with arcs
        ctx.save();
        ctx.globalAlpha = b.alpha * 0.85;
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth = cfg.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const wing = Math.sin(b.flap) * b.size * 0.9;
        const flip = b.vx < 0 ? -1 : 1;

        ctx.beginPath();
        // Body (small central dash)
        ctx.moveTo(b.x - flip * 2, b.y);
        ctx.lineTo(b.x + flip * 4, b.y + 1);

        // Left wing
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo(b.x - flip * b.size * 0.7, b.y - wing * 1.3, b.x - flip * b.size * 1.8, b.y - wing * 0.2);
        // Right wing
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo(b.x + flip * b.size * 0.7, b.y - wing * 1.3, b.x + flip * b.size * 1.8, b.y - wing * 0.2);
        ctx.stroke();
        ctx.restore();
    }

    function drawBirds() {
        for (const b of birds) drawBird(b);
    }

    // ── Main loop ──────────────────────────────────────────────────────────
    function loop(ts) {
        if (!active) return;
        rafId = requestAnimationFrame(loop);

        if (ts - lastFrame < FRAME_INTERVAL) return;
        lastFrame = ts;

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (theme.particles) {
            stepParticles(w, h);
            drawParticles();
        }

        if (theme.birds) {
            updateBirdTimer(w, h);
            stepBirds();
            drawBirds();
        }
    }

    // ── Resize handler ─────────────────────────────────────────────────────
    function syncSize() {
        if (!canvas || !container) return;
        // Match canvas to the actual rendered size of map-nodes-container
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width || window.innerWidth;
        canvas.height = rect.height || window.innerHeight;
    }

    let resizeObs = null;

    // ── Public API ─────────────────────────────────────────────────────────
    function activate(chapterId, segmentIdx) {
        deactivate(); // clean up any previous run (MUST do this before checking theme)

        // Only run if we have a theme for this specific segment
        const themeKey = segmentIdx !== undefined ? `${chapterId}_${segmentIdx}` : chapterId;
        theme = MAP_AMBIENT_THEMES[themeKey];
        if (!theme) return;

        // Find the container (map-nodes-container) – wait for Vue to render it
        const tryStart = () => {
            container = document.querySelector('.map-nodes-container');
            if (!container) {
                setTimeout(tryStart, 80);
                return;
            }

            // ── Canvas layer ──
            canvas = document.createElement('canvas');
            canvas.id = 'map-ambient-canvas';
            canvas.style.cssText = [
                'position:absolute',
                'inset:0',
                'width:100%',
                'height:100%',
                'pointer-events:none',
                'z-index:5',
            ].join(';');
            // Insert right after map-base-img (first child)
            const base = container.querySelector('.map-base-img');
            if (base && base.nextSibling) {
                container.insertBefore(canvas, base.nextSibling);
            } else {
                container.appendChild(canvas);
            }

            ctx = canvas.getContext('2d');
            syncSize();

            // ── Sway class on container ──
            if (theme.sway && theme.sway.class) {
                container.classList.add(theme.sway.class);
            }

            // ── Initialize ──
            particles = [];
            birds = [];
            birdTimer = 0;
            if (theme.birds) {
                const bCfg = theme.birds;
                birdInterval = bCfg.firstInterval.min + Math.floor(Math.random() * bCfg.firstInterval.max);
            }
            lastFrame = 0;

            // ── Resize observer ──
            resizeObs = new ResizeObserver(syncSize);
            resizeObs.observe(container);

            active = true;
            console.log('MapAmbient particles started');
            rafId = requestAnimationFrame(loop);
        };

        tryStart();
    }

    function deactivate() {
        active = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        if (container && theme && theme.sway && theme.sway.class) {
            container.classList.remove(theme.sway.class);
        }
        canvas = null;
        ctx = null;
        container = null;
        particles = [];
        birds = [];
    }

    // ── Expose ─────────────────────────────────────────────────────────────
    return { activate, deactivate };

})();
