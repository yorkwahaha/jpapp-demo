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

    const HIGHLAND_WIND = {

        particles: {

            colors: ['rgba(200, 240, 255, 0.40)', 'rgba(255, 255, 255, 0.35)', 'rgba(220, 245, 255, 0.25)'],

            count: 8,

            spawnYLimit: 0.8,

            vxRange: 3.2,

            vyBase: -0.12,

            vyRange: -0.22,

        },

        sway: { class: 'map-ambient-highland' }

    };



    const ICEFIELD_WIND = {
        particles: {
            colors: [
                'rgba(225, 245, 255, 0.65)', // icy blue-white
                'rgba(255, 255, 255, 0.55)', // pure white snow
                'rgba(200, 235, 255, 0.45)', // faint deep ice blue
            ],
            count: 32,                    // denser snow field
            spawnYLimit: 1.0,             // spawn throughout (since falling)
            vxBase: 12.0,                 // strong rightward wind
            vxRange: 5.0,                 // variation
            vyBase: 3.5,                  // falling downward
            vyRange: 2.0,
            isDirectional: true           // hint to skip oscillation
        },
        birds: null,                      // no birds in the freezing icefield
        sway: { class: 'map-ambient-ice' }
    };

    const RUINS_MIST = {
        particles: {
            colors: [
                'rgba(255, 255, 255, 0.40)', // mist accent
                'rgba(101, 84, 19, 0.65)',   // brown leaf
                'rgba(78, 91, 49, 0.60)',    // olive leaf
                'rgba(120, 105, 75, 0.55)',  // tan leaf
            ],
            count: 8,                       
            isLeafTheme: true,              // Enable leaf shapes for non-white colors
            spawnYRange: [0.35, 0.95],      // Drift through middle and valley
            vxRange: 1.5,
            vxBase: 1.0,                    // Stronger horizontal wind
            vyBase: 0.1,                    // Slight downward drift
            vyRange: 0.2,
        },
        sway: { class: 'map-ambient-ruins' }
    };

    const ABYSS_BREATH = {
        particles: {
            colors: [
                'rgba(56, 189, 248, 0.65)', // sky-blue saturated
                'rgba(2, 132, 199, 0.50)',  // deep blue
                'rgba(186, 230, 253, 0.40)', // ice-blue soft
            ],
            count: 18,                      
            radiusRange: [1.0, 2.2],        // Smaller energy sparks
            spawnYRange: [0.65, 0.85],      // Mid-depth in gorge
            vxRange: 0.1,                   // Near-zero horizontal drift
            vyBase: -9.0,                   // Extreme upward velocity (2x Ch 3 snow)
            vyRange: -7.0,
            isDirectional: true,            // Skip sine oscillation
            gust: { duration: 3500, strength: 1.2 } // Rhythmic velocity pulses
        },
        glows: [
            { id: 'entrance', x: 82, y: 35, size: 30, strength: 'strong' },
            { id: 'left',     x: 25, y: 32, size: 24, strength: 'medium' },
            { id: 'right',    x: 58, y: 48, size: 22, strength: 'soft' },
            { id: 'updraft-1', x: 48, y: 88, size: 12, strength: 'updraft' },
            { id: 'updraft-2', x: 22, y: 92, size: 10, strength: 'updraft-low' },
            { id: 'updraft-3', x: 74, y: 85, size: 10, strength: 'updraft-low' }
        ],
        sway: { class: 'map-ambient-abyss' }
    };

    const SACRED_GLOW = {
        particles: {
            colors: [
                'rgba(76, 29, 149, 0.45)', // dark purple (purple-900)
                'rgba(153, 27, 27, 0.40)',  // evil red (red-900)
                'rgba(0, 0, 0, 0.50)',      // pure void
            ],
            count: 4,                       // absolute minimum
            spawnYLimit: 0.95,
            vxRange: 0.20,
            vyBase: -0.03,                  // thick, sluggish drift
            vyRange: -0.10,
        },
        glows: [
            { id: 'haze-throne',  x: 50, y: 20, size: 80, strength: 'haze-ultra' },
            { id: 'haze-gate',    x: 68, y: 62, size: 65, strength: 'haze-heavy' },
            { id: 'haze-library', x: 35, y: 82, size: 55, strength: 'haze-dark' },
            // Area 1: Throne Spirits
            { id: 'flame-t1', x: 52, y: 18, size: 24.5, strength: 'ghost-flame' },
            { id: 'flame-t2', x: 48, y: 22, size: 25.5, strength: 'ghost-flame' },
            { id: 'flame-t3', x: 55, y: 15, size: 25.0, strength: 'ghost-flame' },
            // Area 2: Gate Spirits
            { id: 'flame-g1', x: 72, y: 66, size: 26.0, strength: 'ghost-flame' },
            { id: 'flame-g2', x: 65, y: 58, size: 14.8, strength: 'ghost-flame' },
            // Area 3: Library/Fissure Spirits
            { id: 'flame-l1', x: 38, y: 85, size: 15.2, strength: 'ghost-flame' },
            { id: 'flame-l2', x: 32, y: 78, size: 16.5, strength: 'ghost-flame' },
            { id: 'flame-l3', x: 28, y: 84, size: 14.6, strength: 'ghost-flame' }
        ],
        sway: { class: 'map-ambient-sacred' }
    };

    const SACRED_LIGHT = {
        particles: {
            colors: [
                'rgba(255, 255, 255, 0.45)', // white dust
                'rgba(254, 243, 199, 0.35)', // gold dust
            ],
            count: 4,                       // Minimal
            spawnYLimit: 0.7,
            vxRange: 0.15,
            vyBase: -0.05,
            vyRange: -0.15,
        },
        glows: [
            { id: 'sky-pulse', x: 50, y: 50, size: 100, strength: 'sacred-pulse' },
            { id: 'flash-top', x: 50, y: 8, size: 45, strength: 'cloud-flash' },
            { id: 'flash-left', x: 12, y: 56, size: 40, strength: 'cloud-flash' },
            { id: 'flash-right', x: 88, y: 32, size: 45, strength: 'cloud-flash' },
            { id: 'flash-bottom-right', x: 82, y: 85, size: 38, strength: 'cloud-flash' }
        ],
        sway: { class: 'map-ambient-final' }
    };

    const VOID_THRONE = {
        particles: {
            colors: [
                'rgba(220, 38, 38, 0.65)',  // ominous red pulse
                'rgba(0, 0, 0, 0.45)',      // dark void
            ],
            count: 10,                      // Reduced but intense
            spawnYRange: [0.35, 0.65],      // Concentrate near throne (y=0.67)
            vxRange: 1.0,
            vyBase: 0.05,
            vyRange: 0.2,
        },
        stones: {
            count: 12,
            colors: [
                'rgba(20, 20, 25, 1)',   // deep charcoal (solid)
                'rgba(35, 35, 40, 1)',   // dark grey (solid)
                'rgba(50, 50, 55, 0.7)', // mid grey (translucent)
                'rgba(25, 25, 30, 0.9)'  // obsidian
            ],
            sizeRange: [5, 42],
            spawnYRange: [0.1, 0.9]
        },
        sway: { class: 'map-ambient-void' }
    };

    const MAP_AMBIENT_THEMES = {

        'chapter1_0': { // Chapter 1, Segment 0 (新手村)

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

        },

        'highland_wind': HIGHLAND_WIND,

        'icefield_wind': ICEFIELD_WIND,

        'ruins_mist': RUINS_MIST,

        'abyss_breath': ABYSS_BREATH,

        'sacred_glow': SACRED_GLOW,
        'final_sanctum': SACRED_LIGHT,
        'void_throne': VOID_THRONE,
        'chapter1_1': HIGHLAND_WIND,  // Chapter 1, Segment 1 (山路高地)
        'chapter1_2': ICEFIELD_WIND,  // Chapter 1, Segment 2 (冰原冰山)
        'chapter1_3': RUINS_MIST,
        'chapter1_4': ABYSS_BREATH,
        'chapter1_5': SACRED_GLOW,
        'chapter1_6': SACRED_LIGHT,
        'chapter1_7': VOID_THRONE,

        'chapter2_0': HIGHLAND_WIND   // Future proofing for Chapter 2

        // Any keys NOT defined here (e.g., chapter1_3) will have NO ambient effects.

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
    let stones = [];
    let theme = null;
    let container = null;
    let active = false;

    // ── FPS cap (ms between draws) ─────────────────────────────────────────
    const FRAME_INTERVAL = 50; // ~20 fps — gentle on mobile

    // ── Particle system ────────────────────────────────────────────────────
    function createParticle(w, h) {
        const cfg = theme.particles;
        // Start position: cross whole screen or from the "windward" edge for new ones
        const isInit = particles.length === 0;
        
        let x = Math.random() * w;
        let y = 0;
        
        // Enhanced Y Spawning
        if (cfg.spawnYRange) {
            const [min, max] = cfg.spawnYRange;
            y = (min + Math.random() * (max - min)) * h;
        } else {
            y = Math.random() * (h * (cfg.spawnYLimit || 1.0));
        }
        
        // If not init, spawn it slightly off-screen on the windward side
        if (!isInit && (cfg.vxBase || 0) > 1) x = -40; // spawn left for wind
        if (!isInit && (cfg.vyBase || 0) > 1) {
            if (!cfg.spawnYRange) y = -40; // only override Y if no range specified
        }

        const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
        const isLeaf = !!cfg.isLeafTheme && !color.includes('255, 255, 255'); // white is mist

        return {
            x: x,
            y: y,
            baseX: x, // for horizontal swing
            r: cfg.radiusRange 
                ? (cfg.radiusRange[0] + Math.random() * (cfg.radiusRange[1] - cfg.radiusRange[0]))
                : (isLeaf ? (2.0 + Math.random() * 2.5) : (3.0 + Math.random() * 4.0)),
            vx: (cfg.vxBase || 0) + (Math.random() - 0.5) * cfg.vxRange,
            vy: (cfg.vyBase || 0) + (Math.random() * cfg.vyRange),
            color: color,
            alpha: 0,
            life: 0,
            maxLife: 150 + Math.random() * 250,
            isDirectional: !!cfg.isDirectional,
            isLeaf: isLeaf,
            rotation: Math.random() * Math.PI * 2,
            rotationV: (Math.random() - 0.5) * 0.08,
            swing: isLeaf ? (10 + Math.random() * 20) : 0
        };
    }

    function stepParticles(w, h) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life++;
            
            // Horizontal movement
            let dx = p.vx;
            if (p.isLeaf) {
                // Diagonal drift + horizontal swing
                p.x += dx;
                p.x += Math.sin(p.life * 0.05) * 0.5; // slight extra jitter
                p.rotation += p.rotationV;
            } else {
                if (!p.isDirectional) {
                    dx += Math.sin(p.life * 0.04) * 0.18; // only oscillate for "floating" themes
                }
                p.x += dx;
            }

            let dy = p.vy;
            if (theme.particles.gust) {
                const gv = theme.particles.gust;
                const cycle = Date.now() / gv.duration;
                // Calculate pulse factor (1.0 to 1.0 + strength)
                const phase = 0.5 + 0.5 * Math.sin(cycle * Math.PI * 2); 
                dy *= (1.0 + phase * gv.strength);
            }
            p.y += dy;

            // fade in / out
            const t = p.life / p.maxLife;
            p.alpha = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;

            // Expanded removal logic for directional flow
            const isOffScreen = p.x < -100 || p.x > w + 100 || p.y < -100 || p.y > h + 150;
            if (p.life >= p.maxLife || isOffScreen) {
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
            
            if (p.isLeaf) {
                // Draw leaf: small rotated oval
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.r * 1.5, p.r * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Draw firefly/mist mote: bright center with radial glow
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2);
                gradient.addColorStop(0, '#ffffff');          // White hot center
                gradient.addColorStop(0.2, p.color);          // Core color
                gradient.addColorStop(1, 'rgba(0,0,0,0)');    // Soft fade out
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                // Draw a slightly larger area to encompass the glow spread
                ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
                ctx.fill();
            }
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

    // ── Stone system ───────────────────────────────────────────────────────
    function createStone(w, h) {
        const cfg = theme.stones;
        const size = cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]);
        
        let x = Math.random() * w;
        if (size > 22) {
            // Avoid central throne area [0.38w, 0.62w]
            while (x > w * 0.38 && x < w * 0.62) x = Math.random() * w;
        }
        const y = (cfg.spawnYRange[0] + Math.random() * (cfg.spawnYRange[1] - cfg.spawnYRange[0])) * h;
        
        const vertices = [];
        const vStyle = Math.floor(Math.random() * 3); // 0: Elongated, 1: Jagged, 2: Shard
        const vCount = (vStyle === 2) ? 3 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 3);
        
        for(let i=0; i<vCount; i++) {
            const angle = (i / vCount) * Math.PI * 2;
            let dist = 0.6 + Math.random() * 0.5;
            if (vStyle === 1) dist = 0.4 + Math.random() * 0.8; // Jagged
            let vx = Math.cos(angle) * dist;
            let vy = Math.sin(angle) * dist;
            if (vStyle === 0) vx *= 1.5; // Elongated
            vertices.push({ x: vx, y: vy });
        }

        const isSolid = Math.random() < 0.6;
        let opacity = isSolid ? (0.85 + Math.random() * 0.15) : (0.35 + Math.random() * 0.25);
        
        // Pick darker colors for solid ones
        let color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
        if (isSolid && color.includes('0.7')) color = cfg.colors[0]; 

        const isRotating = (size > 28 && Math.random() < 0.4);

        return {
            x, y, baseX: x, baseY: y, size, vertices,
            opacity,
            rotation: Math.random() * Math.PI * 2,
            rotationV: isRotating ? (Math.random() - 0.5) * 0.006 : 0, 
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            ampX: (isSolid ? 8 : 12) + Math.random() * 10,
            ampY: (isSolid ? 18 : 25) + Math.random() * 15,
            speedX: 0.001 + Math.random() * 0.0012,
            speedY: 0.0008 + Math.random() * 0.001,
            color: color
        };
    }

    function stepStones() {
        const now = Date.now();
        for (const s of stones) {
            s.x = s.baseX + Math.sin(now * s.speedX + s.phaseX) * s.ampX;
            s.y = s.baseY + Math.sin(now * s.speedY + s.phaseY) * s.ampY;
            s.rotation += s.rotationV;
        }
    }

    function drawStones() {
        for (const s of stones) {
            ctx.save();
            ctx.globalAlpha = s.opacity;
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rotation);
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.moveTo(s.vertices[0].x * s.size, s.vertices[0].y * s.size);
            for(let i=1; i<s.vertices.length; i++) {
                ctx.lineTo(s.vertices[i].x * s.size, s.vertices[i].y * s.size);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
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

        if (theme.stones) {
            stepStones();
            drawStones();
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
    function activate(chapterId, segmentIdx, themeKeyOverride) {
        deactivate(); // clean up any previous run (MUST do this before checking theme)

        // Only run if we have a theme for this specific segment
        const themeKey = themeKeyOverride || (segmentIdx !== undefined ? `${chapterId}_${segmentIdx}` : chapterId);
        theme = MAP_AMBIENT_THEMES[themeKey];
        if (!theme) return;

        // Find the container (map-nodes-container) – wait for Vue to render it
        const tryStart = () => {
            container = document.querySelector('.map-nodes-container');
            if (!container) {
                setTimeout(tryStart, 80);
                return;
            }

            // ── Glow Layer (Localized Pulses) ──
            if (theme.glows) {
                const glowLayer = document.createElement('div');
                glowLayer.className = 'map-ambient-glow-layer';
                theme.glows.forEach(g => {
                    const dot = document.createElement('div');
                    dot.className = `glow-pulse glow-${g.id} pulse-${g.strength || 'medium'}`;
                    dot.style.cssText = `left:${g.x}%; top:${g.y}%; width:${g.size}%; height:${g.size}%;`;
                    glowLayer.appendChild(dot);
                });
                container.appendChild(glowLayer);
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
            stones = [];
            birdTimer = 0;

            if (theme.stones) {
                for(let i=0; i<theme.stones.count; i++) {
                    stones.push(createStone(canvas.width, canvas.height));
                }
            }

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
        
        // Remove Canvas
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        
        // Remove Glow Layer
        const glowLayer = document.querySelector('.map-ambient-glow-layer');
        if (glowLayer && glowLayer.parentNode) glowLayer.parentNode.removeChild(glowLayer);

        if (container && theme && theme.sway && theme.sway.class) {
            container.classList.remove(theme.sway.class);
        }
        canvas = null;
        ctx = null;
        container = null;
        particles = [];
        theme = null; // Important: Clear theme after cleanup
        birds = [];
        stones = [];
    }

    // ── Expose ─────────────────────────────────────────────────────────────
    return { activate, deactivate };

})();
